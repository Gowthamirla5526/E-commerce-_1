import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getAdminSession } from "@/core/security/auth";

const supplierSchema = z.object({
  code: z.string().min(3),
  name: z.string().min(3),
  contactName: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().nullable(),
  district: z.string().min(2),
  state: z.string().min(2),
  active: z.boolean().default(true),
});

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      _count: {
        select: { inventoryBatches: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: suppliers });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = supplierSchema.parse(body);

    const supplier = await prisma.supplier.create({
      data,
    });

    return NextResponse.json({ success: true, data: supplier });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register supplier." },
      { status: 400 }
    );
  }
}

