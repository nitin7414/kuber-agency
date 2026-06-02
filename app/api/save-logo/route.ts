import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "Image data required" }, { status: 400 });
    }

    // Strip out base64 header if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const logoPath = path.join(process.cwd(), "public", "logo.png");
    await fs.writeFile(logoPath, buffer);

    return NextResponse.json({ success: true, message: "Logo updated successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save logo" }, { status: 500 });
  }
}
