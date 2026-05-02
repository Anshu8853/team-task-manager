import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { taskSchema } from "@/lib/validators";
import { USER_ROLES } from "@/lib/constants";
import { canAccessProject } from "@/lib/permissions";

export async function GET(request: Request) {
  const user = await requireSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");

  const where = user.role === USER_ROLES.ADMIN
    ? projectId ? { projectId } : {}
    : {
        ...(projectId ? { projectId } : {}),
        OR: [
          { creatorId: user.id },
          { assigneeId: user.id },
          { project: { ownerId: user.id } },
          { project: { members: { some: { userId: user.id } } } }
        ]
      };

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } }
    }
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const user = await requireSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const projectAllowed = user.role === USER_ROLES.ADMIN || await canAccessProject(user, parsed.data.projectId);
  if (!projectAllowed) {
    return NextResponse.json({ message: "You do not have access to this project" }, { status: 403 });
  }

  const assigneeId = parsed.data.assigneeId || null;
  if (assigneeId) {
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: parsed.data.projectId,
          userId: assigneeId
        }
      }
    });

    if (!membership && user.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ message: "Assignee must belong to the project" }, { status: 400 });
    }
  }

  const task = await prisma.task.create({
    data: {
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status ?? "TODO",
      priority: parsed.data.priority ?? "MEDIUM",
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      assigneeId,
      creatorId: user.id
    },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } }
    }
  });

  return NextResponse.json({ task }, { status: 201 });
}
