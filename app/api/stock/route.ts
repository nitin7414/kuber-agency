import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let stock = await prisma.agencyStock.findFirst();
    if (!stock) stock = await prisma.agencyStock.create({ data: {} });
    return NextResponse.json(stock);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { totalFilled, totalEmpty } = await req.json();
    let stock = await prisma.agencyStock.findFirst();
    if (!stock) {
      stock = await prisma.agencyStock.create({ data: { totalFilled, totalEmpty } });
    } else {
      stock = await prisma.agencyStock.update({
        where: { id: stock.id },
        data: { totalFilled, totalEmpty },
      });
    }
    await prisma.activityLog.create({
      data: {
        type: "STOCK_UPDATED",
        description: `Stock updated: ${totalFilled} filled, ${totalEmpty} empty`,
      },
    });
    return NextResponse.json(stock);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}