import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { createCustomerSession } from "@/core/security/customer-auth";
import { checkRateLimit, getClientIp } from "@/core/security/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).optional(),
  password: z.string().min(6),
  role: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Rate Limiting: 10 registrations / minute per IP
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`register:${clientIp}`, 10, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many registration attempts. Please wait ${rateCheck.resetSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Security check: Never allow elevating role to ADMIN via public registration
    if (body.role && body.role.toUpperCase().includes("ADMIN")) {
      return NextResponse.json(
        {
          success: false,
          error: "Security Violation: Public admin registration is strictly prohibited.",
        },
        { status: 403 }
      );
    }

    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account already exists with this email." },
        { status: 400 }
      );
    }

    // Always assign USER role
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        passwordHash: data.password,
        role: "USER",
      },
    });

    const session = await createCustomerSession({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: "USER",
    });

    return NextResponse.json({
      success: true,
      message: "Customer account created successfully.",
      data: { user: session },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register." },
      { status: 400 }
    );
  }
}
