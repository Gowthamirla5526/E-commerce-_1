import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";

const updateFridgeItemSchema = z.object({
  status: z.enum(["IN_FRIDGE", "CONSUMED", "DISCARDED"]).optional(),
  quantityConsumedGrams: z.number().int().positive().optional(),
  discardReason: z.enum(["SPOILED", "FORGOTTEN", "OVERCOOKED", "OTHER"]).optional(),
  quantityGrams: z.number().int().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateFridgeItemSchema.parse(body);

    const existing = await prisma.householdProduceItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (data.status === "CONSUMED" && data.quantityConsumedGrams) {
        await tx.consumptionEvent.create({
          data: {
            householdProduceItemId: id,
            quantityConsumedGrams: data.quantityConsumedGrams,
          },
        });
      }

      return await tx.householdProduceItem.update({
        where: { id },
        data: {
          status: data.status || existing.status,
          quantityGrams: data.quantityGrams !== undefined ? data.quantityGrams : existing.quantityGrams,
          discardReason: data.discardReason || existing.discardReason,
        },
      });
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update item." },
      { status: 400 }
    );
  }
}
