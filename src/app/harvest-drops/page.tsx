import React from "react";
import { prisma } from "@/core/db/prisma";
import { HarvestDropsClient } from "@/shared/components/harvest/HarvestDropsClient";

export const revalidate = 60;

export default async function HarvestDropsPage() {
  const campaigns = await prisma.harvestCampaign.findMany({
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { deadlineAt: "asc" },
  });

  const serializedCampaigns = campaigns.map((c) => {
    const percentage = Math.min(100, Math.round((c.currentGrams / c.targetGrams) * 100));
    const isExpired = new Date() > new Date(c.deadlineAt);
    const savingsPaise = Math.max(0, c.benchmarkRetailPricePaise - c.unitPricePaise);
    const savingsPercentage = Math.round((savingsPaise / c.benchmarkRetailPricePaise) * 100);

    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      farmName: c.farmName,
      location: c.location,
      harvestDate: c.harvestDate.toISOString(),
      deliveryWindowStart: c.deliveryWindowStart.toISOString(),
      deliveryWindowEnd: c.deliveryWindowEnd.toISOString(),
      targetGrams: c.targetGrams,
      currentGrams: c.currentGrams,
      unitPricePaise: c.unitPricePaise,
      benchmarkRetailPricePaise: c.benchmarkRetailPricePaise,
      deadlineAt: c.deadlineAt.toISOString(),
      imageUrl: c.imageUrl,
      description: c.description,
      status: c.status,
      percentage,
      isExpired,
      savingsPaise,
      savingsPercentage,
      participantCount: c.participants.length,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <HarvestDropsClient initialCampaigns={serializedCampaigns} />
    </div>
  );
}

