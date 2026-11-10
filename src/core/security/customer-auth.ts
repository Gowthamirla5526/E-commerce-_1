import { cookies } from "next/headers";
import { signSessionToken, verifySessionToken, normalizeRole, UserRole } from "./rbac";

export const CUSTOMER_COOKIE_NAME = "fresh_harvest_customer_session";

export interface CustomerSession {
  userId: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
}

/**
 * Creates a customer session cookie with HMAC cryptographic signature.
 */
export async function createCustomerSession(user: {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role?: string | null;
}) {
  const cookieStore = await cookies();
  const normalized = normalizeRole(user.role);

  const sessionData: CustomerSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone || null,
    role: normalized, // Typically "USER"
  };

  const token = signSessionToken(sessionData, 60 * 60 * 24 * 30); // 30 days

  cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return sessionData;
}

/**
 * Validates the customer session from cookies.
 */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const session = verifySessionToken<CustomerSession>(token);
    if (!session) {
      return null;
    }

    return {
      userId: session.userId,
      email: session.email,
      name: session.name,
      phone: session.phone || null,
      role: session.role || "USER",
    };
  } catch (e) {
    return null;
  }
}

/**
 * Clears the customer session cookie.
 */
export async function clearCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE_NAME);
}

/**
 * Server guard: throws if user is not an authenticated customer/user.
 */
export async function requireCustomerSession(): Promise<CustomerSession> {
  const session = await getCustomerSession();
  if (!session) {
    throw new Error("UNAUTHORIZED_CUSTOMER");
  }
  return session;
}
