import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { canManageProject } from "@/lib/permissions";

type RouteContext = {
  params: Promise<{ projectId: string; memberId: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  const user = await requireSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId, memberId } = await context.params;
  const allowed = await canManageProject(user, projectId);
  if (!allowed) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId: memberId
      }
    }
  });

  return NextResponse.json({ ok: true });
}
