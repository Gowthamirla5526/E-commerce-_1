import React from "react";
import { prisma } from "@/core/db/prisma";
import { PackagingAdminClient } from "./PackagingAdminClient";

export const revalidate = 0; // Live admin data

export default async function AdminPackagingPage() {
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
        where: { status: { in: ["REQUESTED", "PICKUP_SCHEDULED"] } },
        take: 1,
      },
    },
    orderBy: { assetCode: "asc" },
  });

  const serialized = assets.map((a) => {
    const activeLedger = a.depositLedgers[0];
    return {
      id: a.id,
      assetCode: a.assetCode,
      qrCodePayload: a.qrCodePayload,
      status: a.status,
      totalCycleCount: a.totalCycleCount,
      packagingType: {
        name: a.packagingType.name,
        depositPaise: a.packagingType.depositPaise,
      },
      currentUser: activeLedger
        ? {
            name: activeLedger.user.name,
            phone: activeLedger.user.phone,
          }
        : null,
      currentOrderNumber: activeLedger ? activeLedger.order.orderNumber : null,
      returnRequested: a.returnRequests.length > 0,
    };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PackagingAdminClient crates={serialized} />
    </div>
  );
}

