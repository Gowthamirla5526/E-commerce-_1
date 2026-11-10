import React from "react";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";
import { PerfectPickClient } from "@/shared/components/perfect-pick/PerfectPickClient";

export const metadata = {
  title: "My Perfect Pick | Fresh Harvest",
  description:
    "Personalize how fresh fruits and vegetables are selected. Save firmness, ripeness, and size preferences.",
};

export default async function PerfectPickPage() {
  const session = await getCustomerSession();
  const userId = session?.userId || (await prisma.user.findFirst({ where: { role: "CUSTOMER" } }))?.id;

  const [products, userPreferences] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      take: 6,
    }),
    userId
      ? prisma.customerPerfectPick.findMany({
          where: { userId },
        })
      : [],
  ]);

  const serialized = products.map((p) => {
    const existing = userPreferences.find((u) => u.productId === p.id);
    return {
      productId: p.id,
      title: p.title,
      featuredImageUrl: p.featuredImageUrl,
      categoryName: p.category.name,
      currentPreference: existing
        ? {
            preferredFirmness: existing.preferredFirmness,
            preferredRipeness: existing.preferredRipeness,
            preferredSize: existing.preferredSize,
            specialInstructions: existing.specialInstructions,
          }
        : null,
    };
  });

  return <PerfectPickClient initialProducts={serialized} />;
}

