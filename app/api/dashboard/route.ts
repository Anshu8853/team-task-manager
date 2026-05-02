import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";

export async function GET(request: Request) {
  const user = await requireSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const projectWhere = user.role === USER_ROLES.ADMIN
    ? {}
    : { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] };

  const taskWhere = user.role === USER_ROLES.ADMIN
    ? {}
    : {
        OR: [
          { creatorId: user.id },
          { assigneeId: user.id },
          { project: { ownerId: user.id } },
          { project: { members: { some: { userId: user.id } } } }
        ]
      };

  const now = new Date();
  const [projectCount, taskCount, todoCount, progressCount, doneCount, overdueCount, projects, tasks] = await Promise.all([
    prisma.project.count({ where: projectWhere }),
    prisma.task.count({ where: taskWhere }),
    prisma.task.count({ where: { ...taskWhere, status: "TODO" } }),
    prisma.task.count({ where: { ...taskWhere, status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { ...taskWhere, status: "DONE" } }),
    prisma.task.count({
      where: {
        ...taskWhere,
        dueDate: { lt: now },
        status: { not: "DONE" }
      }
    }),
    prisma.project.findMany({
      where: projectWhere,
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { tasks: true, members: true } }
      }
    }),
    prisma.task.findMany({
      where: taskWhere,
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } },
        creator: { select: { name: true } }
      }
    })
  ]);

  return NextResponse.json({
    summary: {
      projectCount,
      taskCount,
      todoCount,
      progressCount,
      doneCount,
      overdueCount
    },
    recentProjects: projects,
    recentTasks: tasks
  });
}
