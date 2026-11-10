import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";

const addressSchema = z.object({
  recipientName: z.string().min(2, "Recipient name must be at least 2 characters."),
  phone: z.string().min(8, "Phone number must be at least 8 digits."),
  streetLine1: z.string().min(5, "House / Flat and street are required."),
  streetLine2: z.string().optional().nullable(),
  locality: z.string().min(2, "Locality / Area is required."),
  city: z.string().default("Bengaluru"),
  state: z.string().default("Karnataka"),
  pincode: z.string().min(6).max(6, "Pincode must be 6 digits."),
  label: z.string().default("Home"),
  isDefault: z.boolean().default(true),
});

const updateAddressSchema = addressSchema.extend({
  id: z.string().min(1, "Address ID is required."),
});

export async function GET() {
  const session = await getCustomerSession();
  const userId = session?.userId || (await prisma.user.findFirst({ where: { role: "CUSTOMER" } }))?.id;

  if (!userId) {
    return NextResponse.json({ success: true, data: [] });
  }

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ success: true, data: addresses });
}

export async function POST(req: Request) {
  const session = await getCustomerSession();
  let userId = session?.userId;

  if (!userId) {
    const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (demo) userId = demo.id;
  }

  if (!userId) {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = addressSchema.parse(body);

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        recipientName: data.recipientName,
        phone: data.phone,
        streetLine1: data.streetLine1,
        streetLine2: data.streetLine2 || null,
        locality: data.locality,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        label: data.label,
        isDefault: data.isDefault,
      },
    });

    return NextResponse.json({ success: true, message: "Address saved successfully.", data: address });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create address." },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getCustomerSession();
  let userId = session?.userId;

  if (!userId) {
    const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (demo) userId = demo.id;
  }

  if (!userId) {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = updateAddressSchema.parse(body);

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id: data.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Address not found." }, { status: 404 });
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: data.id },
      data: {
        recipientName: data.recipientName,
        phone: data.phone,
        streetLine1: data.streetLine1,
        streetLine2: data.streetLine2 || null,
        locality: data.locality,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        label: data.label,
        isDefault: data.isDefault,
      },
    });

    return NextResponse.json({ success: true, message: "Address updated successfully.", data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update address." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getCustomerSession();
  let userId = session?.userId;

  if (!userId) {
    const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (demo) userId = demo.id;
  }

  if (!userId) {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Address ID required." }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Address not found." }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id },
    });

    // If default was deleted, promote another address if one exists
    if (existing.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Address deleted successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete address." },
      { status: 400 }
    );
  }
}
