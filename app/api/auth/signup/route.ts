import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validators";
import { createToken, authCookieOptions, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return NextResponse.json({ message: "Email is already registered" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hashPassword(parsed.data.password),
        role: "MEMBER"
      },
      select: { id: true, name: true, email: true, role: true }
    });

    const token = await createToken(user);
    const response = NextResponse.json({ user });
    response.cookies.set(authCookieOptions(token));
    return response;
  } catch {
    return NextResponse.json({ message: "Could not create account" }, { status: 500 });
  }
}
