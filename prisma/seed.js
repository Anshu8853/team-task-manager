import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Password123!", 10);
  const memberPassword = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@teamtask.local" },
    update: {},
    create: {
      name: "Team Admin",
      email: "admin@teamtask.local",
      passwordHash: adminPassword,
      role: "ADMIN"
    }
  });

  const member = await prisma.user.upsert({
    where: { email: "member@teamtask.local" },
    update: {},
    create: {
      name: "Team Member",
      email: "member@teamtask.local",
      passwordHash: memberPassword,
      role: "MEMBER"
    }
  });

  const existingProject = await prisma.project.findFirst({ where: { ownerId: admin.id } });

  const project = existingProject ?? await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "A sample project showing the full workflow from planning to delivery.",
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: "OWNER" },
          { userId: member.id, role: "MEMBER" }
        ]
      },
      tasks: {
        create: [
          {
            title: "Audit current dashboard",
            description: "Review existing pages and identify UX and data gaps.",
            status: "IN_PROGRESS",
            priority: "HIGH",
            assigneeId: member.id,
            creatorId: admin.id,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2)
          },
          {
            title: "Prepare deployment checklist",
            description: "Capture Railway settings, environment variables, and smoke tests.",
            status: "TODO",
            priority: "MEDIUM",
            assigneeId: admin.id,
            creatorId: admin.id,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24)
          }
        ]
      }
    }
  });

  if (!existingProject) {
    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: admin.id
        }
      },
      update: { role: "OWNER" },
      create: { projectId: project.id, userId: admin.id, role: "OWNER" }
    });
  }

  console.log("Seeded users:");
  console.log("Admin: admin@teamtask.local / Password123!");
  console.log("Member: member@teamtask.local / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
