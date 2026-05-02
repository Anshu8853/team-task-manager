import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await requireSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
