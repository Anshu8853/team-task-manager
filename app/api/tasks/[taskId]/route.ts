import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { taskUpdateSchema } from "@/lib/validators";
import { USER_ROLES } from "@/lib/constants";
import { canEditTask, canManageProject } from "@/lib/permissions";

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await requireSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await context.params;
  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { select: { id: true, ownerId: true } } }
  });

  if (!existing) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  const editAllowed = user.role === USER_ROLES.ADMIN || await canEditTask(user, existing.projectId, existing.assigneeId, existing.creatorId);
  if (!editAllowed) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = taskUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const assigneeChanged = parsed.data.assigneeId !== undefined;
  const nextAssigneeId = assigneeChanged ? parsed.data.assigneeId || null : existing.assigneeId;
  if (assigneeChanged) {
    const allowedMember = user.role === USER_ROLES.ADMIN || await canManageProject(user, existing.projectId);
    if (!allowedMember) {
      return NextResponse.json({ message: "You cannot change the assignee for this task" }, { status: 403 });
    }

    if (nextAssigneeId) {
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: existing.projectId,
            userId: nextAssigneeId
          }
        }
      });

      if (!membership && user.role !== USER_ROLES.ADMIN) {
        return NextResponse.json({ message: "Assignee must belong to the project" }, { status: 400 });
      }
    }
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description === "" ? null : parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate === undefined ? undefined : parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      assigneeId: parsed.data.assigneeId === undefined ? undefined : nextAssigneeId
    },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } }
    }
  });

  return NextResponse.json({ task });
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await requireSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await context.params;
  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  const allowed = user.role === USER_ROLES.ADMIN || await canManageProject(user, existing.projectId);
  if (!allowed) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ ok: true });
}
