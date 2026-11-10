import { NextResponse } from "next/server";
import { prisma } from "@/core/db/prisma";

export async function GET() {
  try {
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

    const enriched = campaigns.map((c) => {
      const percentage = Math.min(100, Math.round((c.currentGrams / c.targetGrams) * 100));
      const isExpired = new Date() > new Date(c.deadlineAt);
      const savingsPaise = Math.max(0, c.benchmarkRetailPricePaise - c.unitPricePaise);
      const savingsPercentage = Math.round((savingsPaise / c.benchmarkRetailPricePaise) * 100);

      return {
        ...c,
        percentage,
        isExpired,
        savingsPaise,
        savingsPercentage,
        participantCount: c.participants.length,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load harvest drops." },
      { status: 500 }
    );
  }
}

