import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Auto-heal any legacy negative balances to 0 for absolute safety
    await prisma.customer.updateMany({
      where: { pendingBalance: { lt: 0 } },
      data: { pendingBalance: 0 },
    });

    // Agency stock
    let stock = await prisma.agencyStock.findFirst();
    if (!stock) {
      stock = await prisma.agencyStock.create({ data: {} });
    }

    // Total pending balance across all customers (unpaid outstanding dues)
    const balanceAgg = await prisma.customer.aggregate({
      where: { pendingBalance: { gt: 0 } },
      _sum: { pendingBalance: true },
    });

    // Total empty across all customers (at their shops)
    const emptyAgg = await prisma.customer.aggregate({
      _sum: { totalEmptyLeft: true },
    });

    // Total delivered cylinders across all customers till date
    const deliveredAgg = await prisma.customer.aggregate({
      _sum: { totalDelivered: true },
    });

    // Recent payment history (all transactions with payment)
    const paymentHistory = await prisma.transaction.findMany({
      where: { paymentAmount: { gt: 0 } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { customer: { select: { name: true } } },
    });

    // Recent delivery history
    const deliveryHistory = await prisma.transaction.findMany({
      where: { cylindersDelivered: { gt: 0 } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { customer: { select: { name: true } } },
    });

    // Customers holding empty cylinders
    const customersWithEmpties = await prisma.customer.findMany({
      where: { totalEmptyLeft: { gt: 0 } },
      orderBy: { totalEmptyLeft: "desc" },
      select: {
        id: true,
        name: true,
        totalEmptyLeft: true,
      },
    });

    // Find the last database backup activity log
    const lastBackupLog = await prisma.activityLog.findFirst({
      where: {
        description: { contains: "backup downloaded" }
      },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true }
    });

    return NextResponse.json({
      totalFilled: stock.totalFilled,
      totalEmpty: stock.totalEmpty,
      totalPending: balanceAgg._sum.pendingBalance ?? 0,
      totalEmptyAtCustomers: emptyAgg._sum.totalEmptyLeft ?? 0,
      totalDelivered: deliveredAgg._sum.totalDelivered ?? 0,
      paymentHistory,
      deliveryHistory,
      customersWithEmpties,
      lastBackupDate: lastBackupLog?.createdAt || null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}