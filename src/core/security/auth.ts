import { cookies } from "next/headers";
import { signSessionToken, verifySessionToken, normalizeRole, UserRole } from "./rbac";

export const ADMIN_COOKIE_NAME = "fresh_harvest_admin_session";

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Creates an admin session cookie with HMAC cryptographic signature.
 */
export async function createAdminSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}) {
  const cookieStore = await cookies();
  const normalized = normalizeRole(user.role);

  if (normalized !== "ADMIN") {
    throw new Error("Cannot create admin session for non-admin role.");
  }

  const sessionData: AdminSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: "ADMIN",
  };

  const token = signSessionToken(sessionData, 60 * 60 * 24 * 7); // 7 days

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return sessionData;
}

/**
 * Validates the admin session from cookies and verifies role === 'ADMIN'.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const session = verifySessionToken<AdminSession>(token);
    if (!session) {
      return null;
    }

    if (session.role !== "ADMIN") {
      return null;
    }

    return {
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: "ADMIN",
    };
  } catch (e) {
    return null;
  }
}

/**
 * Clears the admin session cookie.
 */
export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

/**
 * Server guard: throws if user is not an authenticated ADMIN.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED_ADMIN");
  }
  return session;
}
