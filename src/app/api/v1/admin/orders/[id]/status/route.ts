import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { requireAdminSession } from "@/core/security/auth";

const updateStatusSchema = z.object({
  status: z.enum([
    "CONFIRMED",
    "PICKING",
    "PACKED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = await req.json();
    const { status } = updateStatusSchema.parse(body);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        paymentStatus: status === "DELIVERED" ? "PAID" : order.paymentStatus,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Order ${order.orderNumber} status updated to ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    const isAuth = error?.message === "UNAUTHORIZED_ADMIN";
    return NextResponse.json(
      { success: false, error: isAuth ? "Access Denied: Admin role required (HTTP 403 Forbidden)." : error.message },
      { status: isAuth ? 403 : 400 }
    );
  }
}

