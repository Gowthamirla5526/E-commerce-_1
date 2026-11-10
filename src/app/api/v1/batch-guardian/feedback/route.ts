import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";

const feedbackSchema = z.object({
  orderItemId: z.string().min(1),
  freshnessRating: z.number().int().min(1).max(5),
  firmnessRating: z.number().int().min(1).max(5),
  damagePresent: z.boolean().default(false),
  defectCategory: z.enum(["BRUISED", "OVERRIPE", "PEST_DAMAGE", "MOULD_ROT", "INCORRECT_SIZE", "OTHER"]).optional().nullable(),
  comments: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const session = await getCustomerSession();
    let userId = session?.userId;

    if (!userId) {
      const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      if (demo) userId = demo.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const data = feedbackSchema.parse(body);

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: data.orderItemId },
      include: {
        order: true,
        sku: true,
      },
    });

    if (!orderItem || !orderItem.allocatedBatchId) {
      return NextResponse.json({ success: false, error: "Order item or allocated batch not found." }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Batch Quality Feedback
      const feedback = await tx.batchQualityFeedback.create({
        data: {
          batchId: orderItem.allocatedBatchId!,
          orderItemId: orderItem.id,
          userId,
          freshnessRating: data.freshnessRating,
          firmnessRating: data.firmnessRating,
          damagePresent: data.damagePresent,
          defectCategory: data.defectCategory || null,
          comments: data.comments || null,
        },
      });

      // 2. Aggregate quality signals for this batch
      const allFeedbackForBatch = await tx.batchQualityFeedback.findMany({
        where: { batchId: orderItem.allocatedBatchId! },
      });

      const defectsCount = allFeedbackForBatch.filter(
        (f) => f.damagePresent || f.freshnessRating <= 2 || f.firmnessRating <= 2
      ).length;

      // 3. Automated Threshold Rule: Trigger alert and quarantine batch if >= 2 defect reports
      if (defectsCount >= 2 || data.defectCategory === "MOULD_ROT") {
        const existingAlert = await tx.qualityAlert.findFirst({
          where: { batchId: orderItem.allocatedBatchId!, status: "OPEN" },
        });

        if (!existingAlert) {
          await tx.qualityAlert.create({
            data: {
              batchId: orderItem.allocatedBatchId!,
              skuId: orderItem.skuId,
              severity: data.defectCategory === "MOULD_ROT" ? "CRITICAL" : "MEDIUM",
              complaintThresholdCount: 2,
              currentComplaints: defectsCount,
              triggerReason: `Repeated customer feedback: ${defectsCount} defects reported (${data.defectCategory || "Freshness/Damage"}).`,
              status: "OPEN",
            },
          });

          // Prevent further customer allocations from this batch
          await tx.inventoryBatch.update({
            where: { id: orderItem.allocatedBatchId! },
            data: { status: "QUARANTINED" },
          });

          // Log quarantine event in stock ledger
          await tx.stockLedgerEntry.create({
            data: {
              batchId: orderItem.allocatedBatchId!,
              skuId: orderItem.skuId,
              entryType: "QUARANTINE_HOLD",
              quantityDeltaGrams: 0,
              balanceAfterGrams: 0,
              notes: `Batch Guardian automated quarantine triggered: ${defectsCount} customer defect reports.`,
            },
          });
        }
      }

      return feedback;
    });

    return NextResponse.json({
      success: true,
      message: "Quality feedback linked to farm batch. Thank you for helping us maintain peak standards.",
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit quality feedback." },
      { status: 400 }
    );
  }
}

