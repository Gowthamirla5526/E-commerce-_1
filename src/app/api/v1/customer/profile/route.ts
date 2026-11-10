import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession, createCustomerSession } from "@/core/security/customer-auth";

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits."),
});

// GET current customer profile details
export async function GET() {
  try {
    const session = await getCustomerSession();
    const userId = session?.userId || (await prisma.user.findFirst({ where: { role: "CUSTOMER" } }))?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load profile." },
      { status: 500 }
    );
  }
}

// PUT update customer profile details (name, email, phone)
export async function PUT(req: Request) {
  try {
    const session = await getCustomerSession();
    let userId = session?.userId;

    if (!userId) {
      const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      if (demo) userId = demo.id;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, phone } = updateProfileSchema.parse(body);

    // Verify email uniqueness if changing email
    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "Another account is already using this email address." },
        { status: 400 }
      );
    }

    // Verify phone uniqueness if changing phone
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone,
        NOT: { id: userId },
      },
    });

    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: "Another account is already using this phone number." },
        { status: 400 }
      );
    }

    // Update user in database (preserve password and role)
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone,
      },
    });

    // Refresh customer auth session cookie
    await createCustomerSession({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone || undefined,
      role: "USER",
    });

    return NextResponse.json({
      success: true,
      message: "Profile details updated successfully.",
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile." },
      { status: 400 }
    );
  }
}
