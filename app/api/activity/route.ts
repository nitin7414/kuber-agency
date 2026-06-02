import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const format = searchParams.get("format");

    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    if (format === "csv") {
      // Build highly detailed, clean and professional CSV rows
      const rows = [
        [
          "Date",
          "Time",
          "Activity Category",
          "Customer Name",
          "Cylinders Delivered",
          "Empties Collected",
          "Amount Paid (₹)",
          "Details"
        ],
        ...logs.map((l: any) => {
          const dateObj = new Date(l.createdAt);
          const day = String(dateObj.getDate()).padStart(2, "0");
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const year = dateObj.getFullYear();
          const formattedDate = `${day}-${month}-${year}`;

          const hours = String(dateObj.getHours()).padStart(2, "0");
          const minutes = String(dateObj.getMinutes()).padStart(2, "0");
          const formattedTime = `${hours}:${minutes}`;

          let category = l.type.replace(/_/g, " ");
          // Proper Title Case format
          category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
          if (l.type === "CUSTOMER_ADDED") category = "Customer Registered";
          if (l.type === "PAYMENT_RECEIVED") category = "Payment Received";
          if (l.type === "CYLINDERS_DELIVERED") category = "Cylinder Delivered";
          if (l.type === "EMPTIES_COLLECTED") category = "Empties Collected";
          if (l.type === "TASK_ADDED") category = "Note Created";
          if (l.type === "TASK_EDITED") category = "Note Updated";

          const cylindersDelivered = l.type === "CYLINDERS_DELIVERED" ? (l.cylinders || "") : "";
          const emptiesCollected = l.type === "EMPTIES_COLLECTED" ? (l.cylinders || "") : "";
          const amountPaid = l.amount ? l.amount.toFixed(2) : "";

          return [
            formattedDate,
            formattedTime,
            category,
            l.customerName || "—",
            cylindersDelivered,
            emptiesCollected,
            amountPaid,
            l.description
          ];
        }),
      ];
      const csv = rows.map((r) => r.map((c: any) => `"${c}"`).join(",")).join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="ssga-activity-${Date.now()}.csv"`,
        },
      });
    }

    // Calculate monthly performance statistics for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const txns = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
        cylindersDelivered: true,
        paymentAmount: true,
      },
    });

    // Group by month
    const monthlyStats: Record<string, { month: string; cylinders: number; payments: number }> = {};
    
    // Initialize last 6 months in order
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toLocaleString("en-US", { month: "short" });
      const yearKey = d.getFullYear().toString().slice(-2);
      const label = `${monthKey} '${yearKey}`;
      monthlyStats[label] = { month: label, cylinders: 0, payments: 0 };
    }

    txns.forEach((t: { createdAt: string | number | Date; cylindersDelivered: any; paymentAmount: any; }) => {
      const d = new Date(t.createdAt);
      const monthKey = d.toLocaleString("en-US", { month: "short" });
      const yearKey = d.getFullYear().toString().slice(-2);
      const label = `${monthKey} '${yearKey}`;
      
      if (monthlyStats[label]) {
        monthlyStats[label].cylinders += t.cylindersDelivered ?? 0;
        monthlyStats[label].payments += t.paymentAmount ?? 0;
      }
    });

    const performance = Object.values(monthlyStats);

    return NextResponse.json({
      logs,
      performance,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}