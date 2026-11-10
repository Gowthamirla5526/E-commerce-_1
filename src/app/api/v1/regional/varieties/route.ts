import { NextResponse } from "next/server";
import { prisma } from "@/core/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");

  const whereCondition: any = {
    active: true,
    regionalDetail: {
      isNot: null,
    },
  };

  if (state && state !== "ALL") {
    whereCondition.regionalDetail = {
      nativeState: state,
    };
  }

  const products = await prisma.product.findMany({
    where: whereCondition,
    include: {
      category: true,
      regionalDetail: true,
      storageGuide: true,
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
    orderBy: { title: "asc" },
  });

  return NextResponse.json({ success: true, data: products });
}

