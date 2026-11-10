import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getAdminSession } from "@/core/security/auth";

const statusSchema = z.object({
  status: z.enum([
    "OPEN",
    "NEAR_TARGET",
    "TARGET_REACHED",
    "CONFIRMED",
    "FULFILLMENT",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = statusSchema.parse(body);

    const updated = await prisma.harvestCampaign.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: `Harvest campaign status transitioned to ${status}`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update campaign status." },
      { status: 400 }
    );
  }
}

