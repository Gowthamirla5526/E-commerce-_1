export type UserRole =
  | "CUSTOMER"
  | "ADMIN"
  | "INVENTORY_MANAGER"
  | "QUALITY_MANAGER"
  | "PICKING_STAFF"
  | "DELIVERY_STAFF"
  | "FINANCE";

export type ReadinessStage =
  | "RAW"
  | "TURNING"
  | "READY_TO_EAT"
  | "PEAK"
  | "OVERRIPE";

export type UnitType = "GRAMS" | "KILOGRAMS" | "PIECES" | "BUNCH";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "ACCEPTED"
  | "PICKING"
  | "PACKING"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "PARTIALLY_FULFILLED";

export type PaymentStatus =
  | "UNPAID"
  | "AUTHORIZED"
  | "PAID"
  | "REFUNDED"
  | "FAILED";

export type StorageMethod = "REFRIGERATE" | "ROOM_TEMPERATURE" | "COOL_DARK_PLACE";

export type DefectCategory =
  | "BRUISED"
  | "OVERRIPE"
  | "PEST_DAMAGE"
  | "MOULD_ROT"
  | "INCORRECT_SIZE"
  | "OTHER";

export interface PerfectPickPreference {
  preferredFirmness: "CRISP" | "MEDIUM" | "SOFT" | "ANY";
  preferredRipeness: "RAW_FOR_COOKING" | "TURNING" | "READY_TO_EAT" | "ANY";
  preferredSize: "SMALL" | "MEDIUM" | "LARGE" | "ANY";
  specialInstructions?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | null;
  meta?: {
    timestamp: string;
    [key: string]: unknown;
  };
}

/**
 * Format integer paise to display INR string.
 * Example: 4500 -> "₹45" or 4550 -> "₹45.50"
 */
export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Format weight in grams to user-friendly string.
 * Example: 500 -> "500 g", 1000 -> "1 kg", 1500 -> "1.5 kg"
 */
export function formatGrams(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg % 1 === 0 ? kg : kg.toFixed(1)} kg`;
  }
  return `${grams} g`;
}

