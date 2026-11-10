import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getAdminSession } from "@/core/security/auth";

const returnSchema = z.object({
  assetId: z.string().min(1),
  condition: z.enum(["PASSED_CLEAN", "DAMAGED"]),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = returnSchema.parse(body);

    const asset = await prisma.packagingAsset.findUnique({
      where: { id: data.assetId },
      include: {
        depositLedgers: {
          where: { status: "CHARGED" },
          take: 1,
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ success: false, error: "Crate asset not found." }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Asset Status and cycle count
      const updatedAsset = await tx.packagingAsset.update({
        where: { id: asset.id },
        data: {
          status: data.condition === "PASSED_CLEAN" ? "IN_WAREHOUSE" : "DAMAGED_RETIRED",
          totalCycleCount: { increment: 1 },
        },
      });

      // 2. Refund the deposit ledger if actively charged
      const activeLedger = asset.depositLedgers[0];
      if (activeLedger) {
        await tx.packagingDepositLedger.update({
          where: { id: activeLedger.id },
          data: {
            status: data.condition === "PASSED_CLEAN" ? "REFUNDED_TO_CREDIT" : "FORFEITED",
            refundedAt: new Date(),
          },
        });
      }

      // 3. Close open return requests for this crate
      await tx.packagingReturnRequest.updateMany({
        where: {
          packagingAssetId: asset.id,
          status: { in: ["REQUESTED", "PICKUP_SCHEDULED"] },
        },
        data: {
          status: data.condition === "PASSED_CLEAN" ? "INSPECTED_PASSED" : "FAILED_DAMAGED",
          collectedAt: new Date(),
        },
      });

      return updatedAsset;
    });

    return NextResponse.json({
      success: true,
      message: `Crate ${asset.assetCode} checked in. Deposit refund processed.`,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process crate return." },
      { status: 400 }
    );
  }
}

