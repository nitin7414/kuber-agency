import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/customers — list all customers (with search)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q") || "";

    const customers = await prisma.customer.findMany({
      where: q
        ? { name: { contains: q, mode: "insensitive" } }
        : undefined,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        mobile: true,
        email: true,
        address: true,
        pendingBalance: true,
        totalDelivered: true,
        totalEmptyLeft: true,
        createdAt: true,
      },
    });

    return NextResponse.json(customers);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/customers — create new customer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, mobile, email, address, pendingBalance, aadharUrl, panUrl, foodLicenseUrl, gstCertUrl } = body;

    if (!name || !mobile) {
      return NextResponse.json({ error: "Name and mobile required" }, { status: 400 });
    }

    const initialBalance = Math.max(0, parseFloat(pendingBalance) || 0);

    const customer = await prisma.customer.create({
      data: { 
        name, 
        mobile, 
        email, 
        address, 
        pendingBalance: initialBalance,
        aadharUrl, 
        panUrl, 
        foodLicenseUrl, 
        gstCertUrl 
      },
    });

    // Create an opening balance transaction if customer starts with existing debt
    if (initialBalance > 0) {
      await prisma.transaction.create({
        data: {
          customerId: customer.id,
          balanceAfter: initialBalance,
          totalEmptyAfter: 0,
          note: "Opening Balance",
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "CUSTOMER_ADDED",
        description: `New customer added: ${name}${initialBalance > 0 ? ` with opening balance of ₹${initialBalance.toFixed(2)}` : ""}`,
        customerId: customer.id,
        customerName: name,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}