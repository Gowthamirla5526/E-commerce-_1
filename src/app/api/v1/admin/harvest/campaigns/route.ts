import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getAdminSession } from "@/core/security/auth";

const campaignSchema = z.object({
  title: z.string().min(5),
  farmName: z.string().min(3),
  location: z.string().min(3),
  targetKg: z.number().positive(),
  unitPricePaise: z.number().int().positive(),
  benchmarkRetailPricePaise: z.number().int().positive(),
  deadlineDays: z.number().int().positive().default(3),
  deliveryDays: z.number().int().positive().default(4),
  imageUrl: z.string().url(),
  description: z.string().min(10),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = campaignSchema.parse(body);

    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

    const deadlineAt = new Date();
    deadlineAt.setDate(deadlineAt.getDate() + data.deadlineDays);

    const harvestDate = new Date();
    harvestDate.setDate(harvestDate.getDate() + data.deliveryDays);

    const deliveryEnd = new Date(harvestDate);
    deliveryEnd.setDate(deliveryEnd.getDate() + 1);

    const campaign = await prisma.harvestCampaign.create({
      data: {
        title: data.title,
        slug,
        farmName: data.farmName,
        location: data.location,
        harvestDate,
        deliveryWindowStart: harvestDate,
        deliveryWindowEnd: deliveryEnd,
        targetGrams: data.targetKg * 1000,
        currentGrams: 0,
        unitPricePaise: data.unitPricePaise,
        benchmarkRetailPricePaise: data.benchmarkRetailPricePaise,
        deadlineAt,
        imageUrl: data.imageUrl,
        description: data.description,
        status: "OPEN",
      },
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create harvest campaign." },
      { status: 400 }
    );
  }
}

