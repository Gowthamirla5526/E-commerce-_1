import { NextResponse } from "next/server";
import { clearCustomerSession } from "@/core/security/customer-auth";

export async function POST() {
  await clearCustomerSession();
  return NextResponse.json({ success: true, message: "Logged out successfully." });
}

