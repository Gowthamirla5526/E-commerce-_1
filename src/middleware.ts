import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "fresh_harvest_admin_session";
const CUSTOMER_COOKIE_NAME = "fresh_harvest_customer_session";

function parseSessionToken(token?: string) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    const rawPayload = parts.length === 2 ? parts[0] : token;
    const jsonStr = Buffer.from(rawPayload, "base64url").toString("utf-8");
    const data = JSON.parse(jsonStr);

    // Verify expiration if present
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const customerToken = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;

  const adminSession = parseSessionToken(adminToken);
  const customerSession = parseSessionToken(customerToken);

  const isAdmin = adminSession?.role === "ADMIN";
  const isCustomer = !!customerSession?.userId;

  // 1. Admin API Protection: /api/v1/admin/* -> Enforce HTTP 403 Forbidden
  if (pathname.startsWith("/api/v1/admin/")) {
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Access Denied: Administrator role required (HTTP 403 Forbidden).",
          authenticatedRole: customerSession?.role || "GUEST",
        },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // 2. Admin UI Protection: /admin/* (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAdmin) {
      // If logged in as customer, redirect to /unauthorized (403 page)
      if (isCustomer) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      // If completely unauthenticated, redirect to admin login
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // If already logged in as ADMIN and tries to visit /admin/login, redirect to /admin/dashboard
  if (pathname === "/admin/login" && isAdmin) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // 3. Customer Protected Routes: /account/* (except /account/login) and /checkout
  if (
    (pathname.startsWith("/account") && pathname !== "/account/login") ||
    pathname.startsWith("/checkout")
  ) {
    if (!isCustomer && !isAdmin) {
      const loginUrl = new URL("/account/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // If already logged in as USER and visits /account/login, redirect to /account
  if (pathname === "/account/login" && isCustomer) {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/v1/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
  ],
};

