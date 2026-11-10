import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";

const perfectPickSchema = z.object({
  productId: z.string().min(1),
  preferredFirmness: z.enum(["CRISP", "MEDIUM", "SOFT", "ANY"]).default("ANY"),
  preferredRipeness: z.enum(["RAW_FOR_COOKING", "TURNING", "READY_TO_EAT", "ANY"]).default("ANY"),
  preferredSize: z.enum(["SMALL", "MEDIUM", "LARGE", "ANY"]).default("ANY"),
  specialInstructions: z.string().optional().nullable(),
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

  const preferences = await prisma.customerPerfectPick.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: true,
          skus: { where: { active: true }, take: 1 },
        },
      },
    },
  });

  return NextResponse.json({ success: true, data: preferences });
}

export async function POST(req: Request) {
  const session = await getCustomerSession();
  let userId = session?.userId;

  if (!userId) {
    const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (demo) userId = demo.id;
  }

  if (!userId) {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = perfectPickSchema.parse(body);

    const preference = await prisma.customerPerfectPick.upsert({
      where: {
        userId_productId: {
          userId,
          productId: data.productId,
        },
      },
      update: {
        preferredFirmness: data.preferredFirmness,
        preferredRipeness: data.preferredRipeness,
        preferredSize: data.preferredSize,
        specialInstructions: data.specialInstructions,
      },
      create: {
        userId,
        productId: data.productId,
        preferredFirmness: data.preferredFirmness,
        preferredRipeness: data.preferredRipeness,
        preferredSize: data.preferredSize,
        specialInstructions: data.specialInstructions,
      },
    });

    return NextResponse.json({ success: true, data: preference });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save picking preference." },
      { status: 400 }
    );
  }
}

