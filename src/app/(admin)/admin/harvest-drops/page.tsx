import React from "react";
import { prisma } from "@/core/db/prisma";
import { HarvestDropsAdminClient } from "./HarvestDropsAdminClient";

export const revalidate = 0; // Live admin data

export default async function AdminHarvestDropsPage() {
  const campaigns = await prisma.harvestCampaign.findMany({
    include: {
      participants: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = campaigns.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    farmName: c.farmName,
    location: c.location,
    harvestDate: c.harvestDate.toISOString(),
    targetGrams: c.targetGrams,
    currentGrams: c.currentGrams,
    unitPricePaise: c.unitPricePaise,
    benchmarkRetailPricePaise: c.benchmarkRetailPricePaise,
    deadlineAt: c.deadlineAt.toISOString(),
    status: c.status,
    participantCount: c.participants.length,
    percentage: Math.min(100, Math.round((c.currentGrams / c.targetGrams) * 100)),
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <HarvestDropsAdminClient initialCampaigns={serialized} />
    </div>
  );
}

