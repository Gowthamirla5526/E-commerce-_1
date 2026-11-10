import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getAdminSession } from "@/core/security/auth";

const resolveAlertSchema = z.object({
  alertId: z.string().min(1),
  actionTaken: z.enum(["BATCH_QUARANTINED", "PRICE_DOWNGRADED", "DISCARDED", "CLEARED_FALSE_ALARM"]),
  notes: z.string().min(5),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = resolveAlertSchema.parse(body);

    const alert = await prisma.qualityAlert.findUnique({
      where: { id: data.alertId },
      include: { batch: true },
    });

    if (!alert) {
      return NextResponse.json({ success: false, error: "Alert not found." }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Alert status
      await tx.qualityAlert.update({
        where: { id: data.alertId },
        data: { status: "RESOLVED" },
      });

      // 2. Create Quality Investigation Record
      const investigation = await tx.qualityInvestigation.upsert({
        where: { qualityAlertId: data.alertId },
        update: {
          inspectorId: session.userId,
          actionTaken: data.actionTaken,
          physicalInspectionNotes: data.notes,
          completedAt: new Date(),
        },
        create: {
          qualityAlertId: data.alertId,
          inspectorId: session.userId,
          actionTaken: data.actionTaken,
          physicalInspectionNotes: data.notes,
          completedAt: new Date(),
        },
      });

      // 3. Batch state modification
      if (data.actionTaken === "CLEARED_FALSE_ALARM") {
        await tx.inventoryBatch.update({
          where: { id: alert.batchId },
          data: { status: "ACTIVE" },
        });
      } else if (data.actionTaken === "DISCARDED") {
        await tx.inventoryBatch.update({
          where: { id: alert.batchId },
          data: { status: "DEPLETED", availableQuantityGrams: 0 },
        });
      }

      return investigation;
    });

    return NextResponse.json({
      success: true,
      message: `Quality alert resolved with action: ${data.actionTaken}`,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resolve alert." },
      { status: 400 }
    );
  }
}

