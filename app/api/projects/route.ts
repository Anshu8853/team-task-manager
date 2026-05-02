import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { projectSchema } from "@/lib/validators";
import { USER_ROLES, PROJECT_MEMBER_ROLES } from "@/lib/constants";

export async function GET(request: Request) {
  const user = await requireSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const where = user.role === USER_ROLES.ADMIN
    ? {}
    : {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      };

  const projects = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { joinedAt: "asc" }
      },
      _count: { select: { tasks: true } }
    }
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const user = await requireSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        ownerId: user.id,
        members: {
          create: [
            {
              userId: user.id,
              role: PROJECT_MEMBER_ROLES.OWNER
            }
          ]
        }
      }
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Could not create project" }, { status: 500 });
  }
}
