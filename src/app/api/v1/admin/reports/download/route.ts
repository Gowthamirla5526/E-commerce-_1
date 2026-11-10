import { NextResponse } from "next/server";
import { prisma } from "@/core/db/prisma";
import { requireAdminSession } from "@/core/security/auth";

export async function GET(req: Request) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month"; // day, week, month, year
    const format = searchParams.get("format") || "csv"; // csv or json

    // Calculate start date based on period
    const now = new Date();
    let startDate = new Date();
    if (period === "day") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "month") {
      startDate.setDate(now.getDate() - 30);
    } else if (period === "year") {
      startDate.setDate(now.getDate() - 365);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    // Fetch matching orders with customer and item details
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        deliverySlot: { select: { name: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // If json requested
    if (format === "json") {
      return NextResponse.json({
        success: true,
        period,
        generatedAt: now.toISOString(),
        orderCount: orders.length,
        totalRevenueINR: (orders.reduce((sum, o) => sum + o.totalPaise, 0) / 100).toFixed(2),
        orders: orders.map((o) => ({
          orderNumber: o.orderNumber,
          date: o.createdAt.toISOString(),
          customerName: o.user?.name || "Customer",
          customerPhone: o.user?.phone || "",
          items: o.items.map((i) => `${i.productNameSnapshot} x${i.quantity}`).join("; "),
          totalINR: (o.totalPaise / 100).toFixed(2),
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMethod: "Cash on Delivery (Doorstep)",
        })),
      });
    }

    // Build standard CSV
    const csvHeaders = [
      "Order Number",
      "Order Date & Time",
      "Customer Name",
      "Customer Phone",
      "Customer Email",
      "Items Breakdown",
      "Total Items Count",
      "Subtotal (INR)",
      "Packaging Deposit (INR)",
      "Delivery Fee (INR)",
      "Total Amount (INR)",
      "Payment Mode",
      "Payment Status",
      "Fulfilment Status",
      "Delivery Slot",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = orders.map((o) => {
      const itemsStr = o.items
        .map((i) => `${i.productNameSnapshot} (${i.quantity} units @ ₹${(i.unitPricePaise / 100).toFixed(2)})`)
        .join(" | ");

      return [
        escapeCsv(o.orderNumber),
        escapeCsv(o.createdAt.toLocaleString("en-IN")),
        escapeCsv(o.user?.name || "Customer"),
        escapeCsv(o.user?.phone || ""),
        escapeCsv(o.user?.email || ""),
        escapeCsv(itemsStr),
        escapeCsv(o.items.length),
        escapeCsv((o.subtotalPaise / 100).toFixed(2)),
        escapeCsv((o.packagingDepositPaise / 100).toFixed(2)),
        escapeCsv((o.deliveryFeePaise / 100).toFixed(2)),
        escapeCsv((o.totalPaise / 100).toFixed(2)),
        escapeCsv("Cash on Delivery (Pay at Doorstep)"),
        escapeCsv(o.paymentStatus),
        escapeCsv(o.status),
        escapeCsv(o.deliverySlot?.name || "Morning Express (06:30 - 09:30 AM)"),
      ].join(",");
    });

    const totalRevenuePaise = orders.reduce((sum, o) => sum + o.totalPaise, 0);
    const summaryRows = [
      "",
      `"--- REPORT SUMMARY ---"`,
      `"Report Period:","${period.toUpperCase()}"`,
      `"Generated At:","${now.toLocaleString("en-IN")}"`,
      `"Total Orders:","${orders.length}"`,
      `"Total Revenue (INR):","₹${(totalRevenuePaise / 100).toFixed(2)}"`,
      `"Payment Gateway:","100% Cash on Delivery (Strict Compliance)"`,
    ];

    const fullCsv = [csvHeaders.join(","), ...csvRows, ...summaryRows].join("\n");

    const filename = `FreshHarvest_${period.toUpperCase()}_Sales_Report_${now.toISOString().slice(0, 10)}.csv`;

    return new Response(fullCsv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    const isAuth = error?.message === "UNAUTHORIZED_ADMIN";
    return NextResponse.json(
      { success: false, error: isAuth ? "Access Denied: Administrator role required (HTTP 403 Forbidden)." : error.message },
      { status: isAuth ? 403 : 500 }
    );
  }
}

