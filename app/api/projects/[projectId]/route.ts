import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { projectUpdateSchema } from "@/lib/validators";
import { USER_ROLES } from "@/lib/constants";
import { canManageProject } from "@/lib/permissions";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await requireSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const allowed = await canManageProject(user, projectId);
  if (!allowed) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...parsed.data,
      description: parsed.data.description === "" ? null : parsed.data.description
    }
  });

  return NextResponse.json({ project });
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await requireSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const allowed = user.role === USER_ROLES.ADMIN || await canManageProject(user, projectId);
  if (!allowed) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id: projectId } });
  return NextResponse.json({ ok: true });
}
