import { NextResponse } from "next/server";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";

export async function GET() {
  try {
    const session = await getCustomerSession();
    let userId = session?.userId;

    if (!userId) {
      const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      if (demo) userId = demo.id;
    }

    if (!userId) {
      return NextResponse.json({ success: true, data: { activeCrates: [], ledger: [] } });
    }

    // Active deposits currently charged to customer
    const activeLedgers = await prisma.packagingDepositLedger.findMany({
      where: {
        userId,
        status: "CHARGED",
      },
      include: {
        packagingAsset: {
          include: {
            packagingType: true,
            returnRequests: {
              where: { status: { in: ["REQUESTED", "PICKUP_SCHEDULED"] } },
              take: 1,
            },
          },
        },
        order: {
          select: { orderNumber: true, createdAt: true },
        },
      },
      orderBy: { chargedAt: "desc" },
    });

    // All past ledger transactions
    const fullLedger = await prisma.packagingDepositLedger.findMany({
      where: { userId },
      include: {
        packagingAsset: true,
        order: { select: { orderNumber: true } },
      },
      orderBy: { chargedAt: "desc" },
      take: 20,
    });

    const activeCrates = activeLedgers.map((l) => ({
      ledgerId: l.id,
      assetId: l.packagingAsset.id,
      assetCode: l.packagingAsset.assetCode,
      qrCodePayload: l.packagingAsset.qrCodePayload,
      depositAmountPaise: l.depositAmountPaise,
      chargedAt: l.chargedAt,
      orderNumber: l.order.orderNumber,
      orderDate: l.order.createdAt,
      crateType: l.packagingAsset.packagingType.name,
      returnRequested: l.packagingAsset.returnRequests.length > 0,
      returnStatus: l.packagingAsset.returnRequests[0]?.status || null,
    }));

    const totalActiveDepositPaise = activeLedgers.reduce((sum, l) => sum + l.depositAmountPaise, 0);

    return NextResponse.json({
      success: true,
      data: {
        activeCrates,
        totalActiveDepositPaise,
        ledger: fullLedger,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load packaging ledger." },
      { status: 500 }
    );
  }
}

