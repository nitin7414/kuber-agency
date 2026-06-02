import { NextResponse } from "next/server";
import { getValidSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getValidSession();
  if (!session || !session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  session.destroy();
  return NextResponse.json({ success: true });
}