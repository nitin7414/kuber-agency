import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/customers/[id]/transactions — add new transaction
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { cylindersDelivered, emptiesCollected, paymentAmount, pendingAmount, note } = body;

    // Validate at least one field
    const hasData =
      (cylindersDelivered && cylindersDelivered > 0) ||
      (emptiesCollected && emptiesCollected > 0) ||
      (paymentAmount && paymentAmount > 0) ||
      (pendingAmount !== undefined && pendingAmount !== null && pendingAmount !== "");

    if (!hasData) {
      return NextResponse.json(
        { error: "At least one field must be filled" },
        { status: 400 }
      );
    }

    // Get current customer state
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // ── Calculate new running totals ─────────────────────────
    const delivered = cylindersDelivered || 0;
    const collected = emptiesCollected || 0;
    const payment = paymentAmount || 0;

    // New total empty at shop: previous + delivered - collected
    const newTotalEmpty = customer.totalEmptyLeft + delivered - collected;
    const newTotalDelivered = customer.totalDelivered + delivered;

    // New pending balance: previous - payment (or manual override pendingAmount)
    const newBalance = (pendingAmount !== undefined && pendingAmount !== null && pendingAmount !== "")
      ? Math.max(0, parseFloat(pendingAmount) || 0)
      : Math.max(0, customer.pendingBalance - payment);

    // ── Create transaction ───────────────────────────────────
    const txn = await prisma.transaction.create({
      data: {
        customerId: id,
        cylindersDelivered: delivered || null,
        emptiesCollected: collected || null,
        paymentAmount: payment || null,
        balanceAfter: newBalance,
        totalEmptyAfter: Math.max(0, newTotalEmpty),
        note,
      },
    });

    // ── Update customer totals ───────────────────────────────
    await prisma.customer.update({
      where: { id },
      data: {
        totalDelivered: newTotalDelivered,
        totalEmptyLeft: Math.max(0, newTotalEmpty),
        pendingBalance: newBalance,
      },
    });

    // ── Update agency stock ──────────────────────────────────
    // Delivered cylinders leave agency (filled - delivered), empties return (empty + collected)
    const stock = await prisma.agencyStock.findFirst();
    if (stock) {
      await prisma.agencyStock.update({
        where: { id: stock.id },
        data: {
          totalFilled: Math.max(0, stock.totalFilled - delivered),
          totalEmpty: stock.totalEmpty + collected,
        },
      });
    }

    // ── Activity logs ────────────────────────────────────────
    const logs = [];
    if (delivered > 0) {
      logs.push({
        type: "CYLINDERS_DELIVERED" as const,
        description: `${delivered} cylinder(s) delivered to ${customer.name}`,
        customerId: id,
        customerName: customer.name,
        cylinders: delivered,
      });
    }
    if (collected > 0) {
      logs.push({
        type: "EMPTIES_COLLECTED" as const,
        description: `${collected} empty cylinder(s) collected from ${customer.name}`,
        customerId: id,
        customerName: customer.name,
        cylinders: collected,
      });
    }
    if (payment > 0) {
      logs.push({
        type: "PAYMENT_RECEIVED" as const,
        description: `Payment of ₹${payment.toFixed(2)} received from ${customer.name}`,
        customerId: id,
        customerName: customer.name,
        amount: payment,
      });
    }

    if (logs.length > 0) {
      await prisma.activityLog.createMany({ data: logs });
    }

    return NextResponse.json(txn, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}