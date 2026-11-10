import { prisma } from "@/core/db/prisma";

export interface SlotAvailability {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
  maxCapacity: number;
  currentBookings: number;
}

export interface ZoneServiceabilityResult {
  serviceable: boolean;
  zoneName?: string;
  deliveryFeePaise?: number;
  minOrderPaise?: number;
  slots: SlotAvailability[];
}

/**
 * Checks serviceability for a delivery pincode and computes live slot availability.
 */
export async function getAvailableSlotsForPincode(
  pincode: string,
  targetDate = new Date()
): Promise<ZoneServiceabilityResult> {
  const zones = await prisma.deliveryZone.findMany({
    where: { active: true },
    include: {
      deliverySlots: {
        where: { active: true },
      },
    },
  });

  const cleanPincode = pincode.trim();
  const matchedZone = zones.find((z) => {
    try {
      const pins: string[] = JSON.parse(z.pincodesJson);
      return pins.includes(cleanPincode);
    } catch (e) {
      return false;
    }
  });

  if (!matchedZone) {
    return {
      serviceable: false,
      slots: [],
    };
  }

  // Count existing orders booked for this date & slot
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const ordersForDay = await prisma.order.findMany({
    where: {
      deliveryDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { notIn: ["CANCELLED"] },
    },
    select: { deliverySlotId: true },
  });

  const slotBookingCounts: Record<string, number> = {};
  ordersForDay.forEach((o) => {
    slotBookingCounts[o.deliverySlotId] = (slotBookingCounts[o.deliverySlotId] || 0) + 1;
  });

  const now = new Date();
  const isToday =
    targetDate.getDate() === now.getDate() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getFullYear() === now.getFullYear();

  const slotAvailabilities: SlotAvailability[] = matchedZone.deliverySlots.map((slot) => {
    const bookings = slotBookingCounts[slot.id] || 0;
    let isAvailable = true;
    let reason: string | undefined;

    // Check capacity
    if (bookings >= slot.maxCapacityOrders) {
      isAvailable = false;
      reason = "Slot capacity full";
    }

    // Check cutoff time if ordering for today
    if (isToday && isAvailable) {
      const [slotHours, slotMinutes] = slot.startTime.split(":").map(Number);
      const slotStartTime = new Date(now);
      slotStartTime.setHours(slotHours, slotMinutes, 0, 0);

      const cutoffTime = new Date(
        slotStartTime.getTime() - slot.cutoffHoursBefore * 60 * 60 * 1000
      );

      if (now > cutoffTime) {
        isAvailable = false;
        reason = `Cutoff passed (${slot.cutoffHoursBefore} hrs before slot)`;
      }
    }

    return {
      id: slot.id,
      name: slot.name,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable,
      reason,
      maxCapacity: slot.maxCapacityOrders,
      currentBookings: bookings,
    };
  });

  return {
    serviceable: true,
    zoneName: matchedZone.name,
    deliveryFeePaise: matchedZone.deliveryFeePaise,
    minOrderPaise: matchedZone.minOrderPaise,
    slots: slotAvailabilities,
  };
}

