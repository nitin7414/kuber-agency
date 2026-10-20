import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    // Get admin row or auto-initialize with default PIN "123456" if missing
    let admin = await prisma.admin.findFirst();

    if (!admin) {
      const hashedDefault = await bcrypt.hash("123456", 10);
      admin = await prisma.admin.create({
        data: {
          adminPin: hashedDefault,
        },
      });
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
          debug: {
            adminId: admin.id,
            adminCreatedAt: admin.createdAt,
            dbHost: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : "no-url",
          }
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
    console.error("Login API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        debugError: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}