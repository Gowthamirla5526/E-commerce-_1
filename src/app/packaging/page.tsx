import React from "react";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";
import { ReturnablePackagingClient } from "@/shared/components/packaging/ReturnablePackagingClient";

export const revalidate = 0; // Live user data

export default async function PackagingPage() {
  const session = await getCustomerSession();
  let userId = session?.userId;

  if (!userId) {
    const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (demo) userId = demo.id;
  }

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Returnable Crates & Packaging</h2>
        <p className="text-stone-600 text-sm">Please sign in to view your circular crates and deposit ledger.</p>
      </div>
    );
  }

  const [activeLedgers, fullLedger] = await Promise.all([
    prisma.packagingDepositLedger.findMany({
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
    }),
    prisma.packagingDepositLedger.findMany({
      where: { userId },
      include: {
        packagingAsset: true,
        order: { select: { orderNumber: true } },
      },
      orderBy: { chargedAt: "desc" },
      take: 20,
    }),
  ]);

  const activeCrates = activeLedgers.map((l) => ({
    ledgerId: l.id,
    assetId: l.packagingAsset.id,
    assetCode: l.packagingAsset.assetCode,
    qrCodePayload: l.packagingAsset.qrCodePayload,
    depositAmountPaise: l.depositAmountPaise,
    chargedAt: l.chargedAt.toISOString(),
    orderNumber: l.order.orderNumber,
    orderDate: l.order.createdAt.toISOString(),
    crateType: l.packagingAsset.packagingType.name,
    returnRequested: l.packagingAsset.returnRequests.length > 0,
    returnStatus: l.packagingAsset.returnRequests[0]?.status || null,
  }));

  const totalActiveDepositPaise = activeLedgers.reduce((sum, l) => sum + l.depositAmountPaise, 0);

  const serializedLedger = fullLedger.map((f) => ({
    id: f.id,
    depositAmountPaise: f.depositAmountPaise,
    status: f.status,
    chargedAt: f.chargedAt.toISOString(),
    refundedAt: f.refundedAt ? f.refundedAt.toISOString() : null,
    packagingAsset: {
      assetCode: f.packagingAsset.assetCode,
    },
    order: {
      orderNumber: f.order.orderNumber,
    },
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ReturnablePackagingClient
        initialActiveCrates={activeCrates}
        totalActiveDepositPaise={totalActiveDepositPaise}
        initialLedger={serializedLedger}
      />
    </div>
  );
}

