import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";

const pickupSchema = z.object({
  packagingAssetId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await getCustomerSession();
    let userId = session?.userId;

    if (!userId) {
      const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      if (demo) userId = demo.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "Please sign in." }, { status: 401 });
    }

    const body = await req.json();
    const { packagingAssetId } = pickupSchema.parse(body);

    const asset = await prisma.packagingAsset.findUnique({
      where: { id: packagingAssetId },
    });

    if (!asset) {
      return NextResponse.json({ success: false, error: "Crate asset not found." }, { status: 404 });
    }

    const returnRequest = await prisma.$transaction(async (tx) => {
      // Create return request
      const req = await tx.packagingReturnRequest.create({
        data: {
          userId,
          packagingAssetId,
          status: "REQUESTED",
        },
      });

      // Update crate asset status
      await tx.packagingAsset.update({
        where: { id: packagingAssetId },
        data: { status: "RETURN_REQUESTED" },
      });

      return req;
    });

    return NextResponse.json({
      success: true,
      message: `Return pickup scheduled for crate ${asset.assetCode}! Our delivery partner will collect it and hand you your ₹50 refund or adjust against your next order.`,
      data: returnRequest,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to schedule return pickup." },
      { status: 400 }
    );
  }
}

