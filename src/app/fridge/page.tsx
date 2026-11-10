import React from "react";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";
import { FridgeClient } from "@/shared/components/fridge/FridgeClient";

export const revalidate = 0; // Live household data

export const metadata = {
  title: "My Fridge Intelligence | Fresh Harvest",
  description: "Track your household produce inventory, estimated usage windows, and eliminate food waste.",
};

export default async function FridgePage() {
  const session = await getCustomerSession();
  let userId = session?.userId;

  if (!userId) {
    const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (demo) userId = demo.id;
  }

  const items = userId
    ? await prisma.householdProduceItem.findMany({
        where: { userId },
        include: {
          product: {
            include: { storageGuide: true },
          },
        },
        orderBy: { estimatedExpiryDate: "asc" },
      })
    : [];

  const serialized = items.map((i) => ({
    id: i.id,
    customName: i.customName,
    quantityGrams: i.quantityGrams,
    purchasedDate: i.purchasedDate.toISOString(),
    estimatedExpiryDate: i.estimatedExpiryDate.toISOString(),
    status: i.status,
    notes: i.notes,
    product: i.product
      ? {
          title: i.product.title,
          featuredImageUrl: i.product.featuredImageUrl,
          storageGuide: i.product.storageGuide
            ? {
                idealStorageMethod: i.product.storageGuide.idealStorageMethod,
                prepTip: i.product.storageGuide.prepTip,
              }
            : null,
        }
      : null,
  }));

  return <FridgeClient initialItems={serialized} />;
}

