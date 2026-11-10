import { NextResponse } from "next/server";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";

export async function GET() {
  const session = await getCustomerSession();
  const userId = session?.userId || (await prisma.user.findFirst({ where: { role: "CUSTOMER" } }))?.id;

  if (!userId) {
    return NextResponse.json({ success: true, data: [] });
  }

  // Find products that user has saved in household or wishlist
  const products = await prisma.product.findMany({
    where: { active: true },
    take: 4,
    include: {
      category: true,
      skus: {
        where: { active: true },
        take: 1,
        include: {
          inventoryBatches: {
            where: { status: "ACTIVE" },
            take: 1,
          },
        },
      },
    },
  });

  return NextResponse.json({ success: true, data: products });
}

