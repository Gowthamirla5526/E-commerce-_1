import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";

const addFridgeItemSchema = z.object({
  customName: z.string().min(2),
  quantityGrams: z.number().int().positive(),
  expiryDays: z.number().int().positive().default(4),
  productId: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export async function GET() {
  const session = await getCustomerSession();
  let userId = session?.userId;

  if (!userId) {
    const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (demo) userId = demo.id;
  }

  if (!userId) {
    return NextResponse.json({ success: true, data: [] });
  }

  const items = await prisma.householdProduceItem.findMany({
    where: { userId },
    include: {
      product: {
        include: { storageGuide: true },
      },
      consumptionEvents: true,
    },
    orderBy: { estimatedExpiryDate: "asc" },
  });

  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: Request) {
  const session = await getCustomerSession();
  let userId = session?.userId;

  if (!userId) {
    const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (demo) userId = demo.id;
  }

  if (!userId) {
    return NextResponse.json({ success: false, error: "Please sign in." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = addFridgeItemSchema.parse(body);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + data.expiryDays);

    const item = await prisma.householdProduceItem.create({
      data: {
        userId,
        customName: data.customName,
        quantityGrams: data.quantityGrams,
        estimatedExpiryDate: expiryDate,
        productId: data.productId || null,
        notes: data.notes || null,
        status: "IN_FRIDGE",
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add fridge item." },
      { status: 400 }
    );
  }
}
