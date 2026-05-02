import { prisma } from "@/lib/prisma";
import { PROJECT_MEMBER_ROLES, USER_ROLES } from "@/lib/constants";
import type { SessionUser } from "@/lib/auth";

export async function canManageProject(user: SessionUser, projectId: string) {
  if (user.role === USER_ROLES.ADMIN) {
    return true;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true }
  });

  return project?.ownerId === user.id;
}

export async function canAccessProject(user: SessionUser, projectId: string) {
  if (user.role === USER_ROLES.ADMIN) {
    return true;
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: user.id
      }
    },
    select: { id: true }
  });

  return Boolean(membership);
}

export async function projectMemberRole(userId: string, projectId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    },
    select: { role: true }
  });

  return membership?.role ?? null;
}

export async function canEditTask(user: SessionUser, projectId: string, taskAssigneeId: string | null, creatorId: string | null) {
  if (user.role === USER_ROLES.ADMIN) {
    return true;
  }

  const projectAccess = await canAccessProject(user, projectId);
  if (!projectAccess) {
    return false;
  }

  return user.id === taskAssigneeId || user.id === creatorId;
}

export function isOwnerRole(role: string | null | undefined) {
  return role === PROJECT_MEMBER_ROLES.OWNER;
}
