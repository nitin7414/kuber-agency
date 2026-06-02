// app/api/backup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getValidSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/backup - Export all business data as a downloadable JSON file
export async function GET() {
  try {
    const session = await getValidSession();
    // Removed `!session.adminId` because the PIN system doesn't use it
    if (!session || !session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all business collections in parallel
    const [customers, transactions, tasks, agencyStocks, activityLogs] = await Promise.all([
      prisma.customer.findMany(),
      prisma.transaction.findMany(),
      prisma.task.findMany(),
      prisma.agencyStock.findMany(),
      prisma.activityLog.findMany(),
    ]);

    const backupPayload = {
      app: "Agency-demo",
      version: "1.0",
      backupDate: new Date().toISOString(),
      data: {
        customers,
        transactions,
        tasks,
        agencyStocks,
        activityLogs,
      },
    };

    const fileName = `ssga_database_backup_${new Date().toISOString().split("T")[0]}.json`;

    // Log the backup download event in the database
    try {
      await prisma.activityLog.create({
        data: {
          type: "STOCK_UPDATED",
          description: "Database backup downloaded successfully",
        },
      });
    } catch (err) {
      console.error("Failed to log backup download:", err);
    }

    return new NextResponse(JSON.stringify(backupPayload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("Backup failed:", err);
    return NextResponse.json({ error: "Server error during backup generation" }, { status: 500 });
  }
}

// POST /api/backup - Restore database from a uploaded JSON backup
export async function POST(req: NextRequest) {
  try {
    const session = await getValidSession();
    // Removed `!session.adminId` here as well
    if (!session || !session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();

    // Structural validation
    if (
      !payload ||
      payload.version !== "1.0" ||
      !payload.data ||
      !Array.isArray(payload.data.customers) ||
      !Array.isArray(payload.data.transactions) ||
      !Array.isArray(payload.data.tasks) ||
      !Array.isArray(payload.data.agencyStocks) ||
      !Array.isArray(payload.data.activityLogs)
    ) {
      return NextResponse.json(
        { error: "Invalid backup file structure. Please upload a valid SSGA backup JSON file." },
        { status: 400 }
      );
    }

    const { customers, transactions, tasks, agencyStocks, activityLogs } = payload.data;

    // Map strings back to Date objects for Prisma
    const formattedCustomers = customers.map((c: any) => ({
      id: c.id,
      name: c.name,
      mobile: c.mobile,
      email: c.email || null,
      address: c.address || null,
      aadharUrl: c.aadharUrl || null,
      panUrl: c.panUrl || null,
      foodLicenseUrl: c.foodLicenseUrl || null,
      gstCertUrl: c.gstCertUrl || null,
      totalDelivered: parseInt(c.totalDelivered) || 0,
      totalEmptyLeft: parseInt(c.totalEmptyLeft) || 0,
      pendingBalance: parseFloat(c.pendingBalance) || 0,
      createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
      updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    }));

    const formattedTransactions = transactions.map((t: any) => ({
      id: t.id,
      customerId: t.customerId,
      cylindersDelivered: t.cylindersDelivered !== null && t.cylindersDelivered !== undefined ? parseInt(t.cylindersDelivered) : null,
      emptiesCollected: t.emptiesCollected !== null && t.emptiesCollected !== undefined ? parseInt(t.emptiesCollected) : null,
      paymentAmount: t.paymentAmount !== null && t.paymentAmount !== undefined ? parseFloat(t.paymentAmount) : null,
      balanceAfter: parseFloat(t.balanceAfter) || 0,
      totalEmptyAfter: parseInt(t.totalEmptyAfter) || 0,
      note: t.note || null,
      createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
    }));

    const formattedTasks = tasks.map((tk: any) => ({
      id: tk.id,
      content: tk.content,
      createdAt: tk.createdAt ? new Date(tk.createdAt) : new Date(),
      updatedAt: tk.updatedAt ? new Date(tk.updatedAt) : new Date(),
    }));

    const formattedStocks = agencyStocks.map((s: any) => ({
      id: s.id,
      totalFilled: parseInt(s.totalFilled) || 0,
      totalEmpty: parseInt(s.totalEmpty) || 0,
      updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
    }));

    const formattedLogs = activityLogs.map((l: any) => ({
      id: l.id,
      type: l.type,
      description: l.description,
      customerId: l.customerId || null,
      customerName: l.customerName || null,
      amount: l.amount !== null && l.amount !== undefined ? parseFloat(l.amount) : null,
      cylinders: l.cylinders !== null && l.cylinders !== undefined ? parseInt(l.cylinders) : null,
      createdAt: l.createdAt ? new Date(l.createdAt) : new Date(),
    }));

    // Perform database operations in an ACID transaction
    await prisma.$transaction([
      prisma.transaction.deleteMany(),
      prisma.customer.deleteMany(),
      prisma.task.deleteMany(),
      prisma.agencyStock.deleteMany(),
      prisma.activityLog.deleteMany(),

      prisma.customer.createMany({ data: formattedCustomers }),
      prisma.transaction.createMany({ data: formattedTransactions }),
      prisma.task.createMany({ data: formattedTasks }),
      prisma.agencyStock.createMany({ data: formattedStocks }),
      prisma.activityLog.createMany({ data: formattedLogs }),
    ]);

    // Log the restore event
    await prisma.activityLog.create({
      data: {
        type: "STOCK_UPDATED",
        description: `Database successfully restored from backup created on ${payload.backupDate}`,
      },
    });

    return NextResponse.json({ success: true, message: "Database restored successfully." });
  } catch (err: any) {
    console.error("Restore failed:", err);
    return NextResponse.json(
      { error: `Database restoration failed: ${err?.message || "Internal database error."}` },
      { status: 500 }
    );
  }
}