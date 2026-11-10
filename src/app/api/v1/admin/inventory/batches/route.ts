import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getAdminSession } from "@/core/security/auth";

const batchInwardSchema = z.object({
  batchNumber: z.string().min(3),
  skuId: z.string().min(1),
  supplierId: z.string().min(1),
  locationId: z.string().min(1),
  initialQuantityGrams: z.number().int().positive(),
  unitCostPaise: z.number().int().positive(),
  readinessStage: z.enum(["RAW", "TURNING", "READY_TO_EAT", "PEAK", "OVERRIPE"]).default("READY_TO_EAT"),
  bestBeforeDays: z.number().int().positive().default(5),
  inspectionGrade: z.enum(["GRADE_A_PREMIUM", "GRADE_B_STANDARD", "REJECTED"]).default("GRADE_A_PREMIUM"),
  inspectionNotes: z.string().optional(),
});

export async function GET() {
  const batches = await prisma.inventoryBatch.findMany({
    include: {
      sku: {
        include: {
          product: true,
        },
      },
      supplier: true,
      location: true,
      inspections: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { receivedDate: "desc" },
  });

  return NextResponse.json({ success: true, data: batches });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = batchInwardSchema.parse(body);

    const bestBefore = new Date();
    bestBefore.setDate(bestBefore.getDate() + data.bestBeforeDays);

    const result = await prisma.$transaction(async (tx) => {
      const batch = await tx.inventoryBatch.create({
        data: {
          batchNumber: data.batchNumber,
          skuId: data.skuId,
          supplierId: data.supplierId,
          locationId: data.locationId,
          initialQuantityGrams: data.initialQuantityGrams,
          availableQuantityGrams: data.initialQuantityGrams,
          unitCostPaise: data.unitCostPaise,
          readinessStage: data.readinessStage,
          bestBeforeDate: bestBefore,
          ripenessWindowStart: new Date(),
          ripenessWindowEnd: bestBefore,
          status: "ACTIVE",
        },
      });

      // Record inward quality inspection
      await tx.qualityInspection.create({
        data: {
          batchId: batch.id,
          inspectorId: session.userId,
          inspectionType: "INWARD_GATE",
          overallGrade: data.inspectionGrade,
          firmnessScore: 5,
          blemishScore: 5,
          notes: data.inspectionNotes || "Standard inward gate verification completed.",
        },
      });

      // Record in stock ledger
      await tx.stockLedgerEntry.create({
        data: {
          batchId: batch.id,
          skuId: data.skuId,
          entryType: "PROCUREMENT",
          quantityDeltaGrams: data.initialQuantityGrams,
          balanceAfterGrams: data.initialQuantityGrams,
          notes: `Batch inwarded: ${data.batchNumber}`,
        },
      });

      return batch;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to inward inventory batch." },
      { status: 400 }
    );
  }
}

