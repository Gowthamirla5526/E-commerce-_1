import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getAdminSession } from "@/core/security/auth";

const pickingCompleteSchema = z.object({
  taskId: z.string().min(1),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { taskId, notes } = pickingCompleteSchema.parse(body);

    const task = await prisma.pickingTask.findUnique({
      where: { id: taskId },
      include: { order: true },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.pickingTask.update({
        where: { id: taskId },
        data: {
          status: "COMPLETED",
          pickerNotes: notes,
          completedAt: new Date(),
          assignedStaffId: session.userId,
        },
      });

      await tx.order.update({
        where: { id: task.orderId },
        data: {
          status: "PACKING",
        },
      });

      // Ensure packing task exists
      await tx.packingTask.upsert({
        where: { orderId: task.orderId },
        update: {},
        create: {
          orderId: task.orderId,
          status: "PENDING",
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: task.orderId,
          fromStatus: task.order.status,
          toStatus: "PACKING",
          reason: "Order items picked from darkstore batches.",
          changedBy: session.name,
        },
      });
    });

    return NextResponse.json({ success: true, message: "Picking completed. Ready for packing." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to complete picking task." },
      { status: 400 }
    );
  }
}

