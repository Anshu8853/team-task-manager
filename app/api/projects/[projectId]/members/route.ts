import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { addMemberSchema } from "@/lib/validators";
import { canManageProject } from "@/lib/permissions";
import { PROJECT_MEMBER_ROLES } from "@/lib/constants";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
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
  const parsed = addMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!targetUser) {
    return NextResponse.json({ message: "No user found with that email" }, { status: 404 });
  }

  const membership = await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId,
        userId: targetUser.id
      }
    },
    update: { role: PROJECT_MEMBER_ROLES.MEMBER },
    create: {
      projectId,
      userId: targetUser.id,
      role: PROJECT_MEMBER_ROLES.MEMBER
    },
    include: { user: { select: { id: true, name: true, email: true, role: true } } }
  });

  return NextResponse.json({ membership }, { status: 201 });
}
