import { NextResponse } from "next/server";
import { getAdminSession } from "@/core/security/auth";
import { getCustomerSession } from "@/core/security/customer-auth";

export async function GET() {
  const adminSession = await getAdminSession();
  if (adminSession) {
    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      role: "ADMIN",
      user: adminSession,
    });
  }

  const customerSession = await getCustomerSession();
  if (customerSession) {
    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      role: "USER",
      user: customerSession,
    });
  }

  return NextResponse.json({
    success: true,
    isAuthenticated: false,
    role: "GUEST",
    user: null,
  });
}

