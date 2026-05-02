import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // Optional: Add a simple secret check for security
    const secret = req.nextUrl.searchParams.get("secret");
    if (secret !== "seed-key-12345") {
      return Response.json({ error: "Invalid secret" }, { status: 401 });
    }

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

    const existingProject = await prisma.project.findFirst({
      where: { ownerId: admin.id }
    });

    if (!existingProject) {
      await prisma.project.create({
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
    }

    return Response.json({
      success: true,
      message: "Database seeded successfully",
      accounts: [
        { email: "admin@teamtask.local", password: "Password123!" },
        { email: "member@teamtask.local", password: "Password123!" }
      ]
    });
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
