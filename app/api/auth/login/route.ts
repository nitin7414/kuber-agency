import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    // ==========================================
    // DEMO BYPASS: Accept "1234" automatically
    // ==========================================
    if (pin === "123456") {
      const session = await getSession();
      session.isLoggedIn = true;
      await session.save();

      return NextResponse.json({
        success: true,
        message: "Demo login successful",
      });
    }
    // ==========================================

    // Get admin row
    const admin = await prisma.admin.findFirst();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin configuration not found",
        },
        { status: 404 }
      );
    }

    // Compare entered PIN with hashed DB PIN
    const validPin = await bcrypt.compare(
      pin,
      admin.adminPin
    );

    if (!validPin) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid PIN",
        },
        { status: 401 }
      );
    }

    // Create session
    const session = await getSession();
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}