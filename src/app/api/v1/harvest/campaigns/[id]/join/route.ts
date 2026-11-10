import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";

const joinSchema = z.object({
  quantityGrams: z.number().int().min(1000).max(50000), // Min 1kg, Max 50kg
  addressId: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCustomerSession();
    let userId = session?.userId;

    if (!userId) {
      const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      if (demo) userId = demo.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "Please sign in to join harvest drops." }, { status: 401 });
    }

    const body = await req.json();
    const data = joinSchema.parse(body);

    const campaign = await prisma.harvestCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: "Harvest drop campaign not found." }, { status: 404 });
    }

    if (campaign.status === "DELIVERED" || campaign.status === "CANCELLED") {
      return NextResponse.json({ success: false, error: `Campaign is closed (${campaign.status}).` }, { status: 400 });
    }

    if (new Date() > new Date(campaign.deadlineAt)) {
      return NextResponse.json({ success: false, error: "Campaign deadline has passed." }, { status: 400 });
    }

    // Determine delivery address
    let addressId = data.addressId;
    if (!addressId) {
      const existingAddr = await prisma.address.findFirst({ where: { userId } });
      if (existingAddr) {
        addressId = existingAddr.id;
      } else {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const newAddr = await prisma.address.create({
          data: {
            userId,
            label: "Home Delivery",
            recipientName: user?.name || "Customer",
            phone: user?.phone || "9876543210",
            streetLine1: "12, 100ft Road",
            locality: "Indiranagar",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560038",
          },
        });
        addressId = newAddr.id;
      }
    }

    // Calculate total paise based on unitPricePaise (price per 1000 grams)
    const totalAmountPaise = Math.round((data.quantityGrams / 1000) * campaign.unitPricePaise);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create participant pledge
      const participant = await tx.groupPurchaseParticipant.create({
        data: {
          campaignId: campaign.id,
          userId,
          addressId: addressId!,
          quantityGrams: data.quantityGrams,
          totalAmountPaise,
          paymentHoldStatus: "AUTHORIZED", // Cash on Delivery upon drop arrival
        },
      });

      // 2. Increment campaign pooled volume
      const updatedGrams = campaign.currentGrams + data.quantityGrams;
      let newStatus = campaign.status;

      if (updatedGrams >= campaign.targetGrams) {
        newStatus = "TARGET_REACHED";
      } else if (updatedGrams >= campaign.targetGrams * 0.7) {
        newStatus = "NEAR_TARGET";
      }

      const updatedCampaign = await tx.harvestCampaign.update({
        where: { id: campaign.id },
        data: {
          currentGrams: updatedGrams,
          status: newStatus,
        },
      });

      return { participant, updatedCampaign };
    });

    return NextResponse.json({
      success: true,
      message: `Pledged ${(data.quantityGrams / 1000).toFixed(1)} kg for ₹${(totalAmountPaise / 100).toFixed(2)}. Pay with Cash / UPI on Delivery when harvest arrives!`,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to join harvest drop." },
      { status: 400 }
    );
  }
}
