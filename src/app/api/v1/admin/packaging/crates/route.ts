import { NextResponse } from "next/server";
import { prisma } from "@/core/db/prisma";
import { getAdminSession } from "@/core/security/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const assets = await prisma.packagingAsset.findMany({
      include: {
        packagingType: true,
        depositLedgers: {
          where: { status: "CHARGED" },
          include: {
            user: { select: { id: true, name: true, phone: true } },
            order: { select: { orderNumber: true } },
          },
          take: 1,
        },
        returnRequests: {
          orderBy: { requestedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { assetCode: "asc" },
    });

    return NextResponse.json({ success: true, data: assets });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load crates." },
      { status: 500 }
    );
  }
}

