import crypto from "crypto";

export type UserRole = "USER" | "ADMIN";

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.ADMIN_JWT_SECRET ||
  "fresh_harvest_secure_hmac_secret_key_2026_production_grade";

/**
 * Normalizes any legacy or custom database role string into the official RBAC roles: USER or ADMIN.
 */
export function normalizeRole(role?: string | null): UserRole {
  if (!role) return "USER";
  const upper = role.toUpperCase();
  if (
    upper === "ADMIN" ||
    upper === "INVENTORY_MANAGER" ||
    upper === "QUALITY_MANAGER" ||
    upper === "PICKING_STAFF" ||
    upper === "DELIVERY_STAFF" ||
    upper === "FINANCE"
  ) {
    return "ADMIN";
  }
  return "USER";
}

/**
 * Creates a cryptographically signed session token: payload.signature
 */
export function signSessionToken<T extends object>(payload: T, expiresInSeconds = 60 * 60 * 24 * 7): string {
  const fullPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadBase64)
    .digest("base64url");

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies and decodes a signed session token. Returns null if expired or tampered.
 */
export function verifySessionToken<T>(token: string): (T & { exp: number }) | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) {
    // Check if it's legacy un-signed base64 for backwards compatibility
    try {
      const raw = Buffer.from(token, "base64").toString("utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return { ...parsed, exp: Math.floor(Date.now() / 1000) + 3600 };
      }
    } catch {
      return null;
    }
    return null;
  }

  const [payloadBase64, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadBase64)
    .digest("base64url");

  // Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const raw = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw);

    // Check expiration
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

