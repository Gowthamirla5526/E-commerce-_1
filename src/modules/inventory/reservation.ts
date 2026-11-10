import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/core/db/prisma";

export interface StockReservationRequest {
  skuId: string;
  quantityGrams: number;
  preferredBatchId?: string;
  freshnessDate?: string;
}

export interface ReservationResult {
  success: boolean;
  reservationId?: string;
  allocatedBatchId?: string;
  batchNumber?: string;
  error?: string;
}

/**
 * Concurrency-Safe FEFO Batch Stock Reservation Engine.
 * Uses atomic conditional updates to prevent overselling on perishable produce batches.
 */
export async function reserveBatchStock(
  client: Prisma.TransactionClient | PrismaClient,
  params: {
    skuId: string;
    quantityGrams: number;
    cartSessionId?: string;
    orderId?: string;
    preferredBatchId?: string;
    reservationTtlMinutes?: number;
  }
): Promise<ReservationResult> {
  const ttl = params.reservationTtlMinutes || 15;
  const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

  // 1. Locate suitable active batch via FEFO (Earliest Best Before Date first)
  const batchWhere: Prisma.InventoryBatchWhereInput = {
    skuId: params.skuId,
    status: "ACTIVE",
    availableQuantityGrams: { gte: params.quantityGrams },
  };

  if (params.preferredBatchId) {
    batchWhere.id = params.preferredBatchId;
  }

  const eligibleBatch = await client.inventoryBatch.findFirst({
    where: batchWhere,
    orderBy: { bestBeforeDate: "asc" }, // Strict FEFO
  });

  if (!eligibleBatch) {
    return {
      success: false,
      error: `Insufficient available stock for produce SKU ${params.skuId}. Requested: ${params.quantityGrams}g`,
    };
  }

  // 2. Perform atomic conditional stock decrement
  // In SQLite/Postgres via Prisma, we update where id and availableQuantityGrams >= requested
  const updateResult = await client.inventoryBatch.updateMany({
    where: {
      id: eligibleBatch.id,
      availableQuantityGrams: { gte: params.quantityGrams },
      status: "ACTIVE",
    },
    data: {
      availableQuantityGrams: {
        decrement: params.quantityGrams,
      },
      reservedQuantityGrams: {
        increment: params.quantityGrams,
      },
    },
  });

  if (updateResult.count === 0) {
    // Another concurrent transaction claimed the stock between findFirst and update!
    return {
      success: false,
      error: `Concurrency race: Produce batch ${eligibleBatch.batchNumber} was claimed by a concurrent checkout.`,
    };
  }

  // 3. Create StockReservation entry
  const reservation = await client.stockReservation.create({
    data: {
      skuId: params.skuId,
      batchId: eligibleBatch.id,
      quantityGrams: params.quantityGrams,
      cartSessionId: params.cartSessionId,
      orderId: params.orderId,
      status: "ACTIVE",
      expiresAt,
    },
  });

  // 4. Log to immutable Stock Ledger
  await client.stockLedgerEntry.create({
    data: {
      batchId: eligibleBatch.id,
      skuId: params.skuId,
      entryType: "ORDER_RESERVATION",
      quantityDeltaGrams: -params.quantityGrams,
      balanceAfterGrams: eligibleBatch.availableQuantityGrams - params.quantityGrams,
      referenceType: "RESERVATION",
      referenceId: reservation.id,
      notes: `Temporary reservation hold (${ttl} min) for order/cart.`,
    },
  });

  return {
    success: true,
    reservationId: reservation.id,
    allocatedBatchId: eligibleBatch.id,
    batchNumber: eligibleBatch.batchNumber,
  };
}

/**
 * Commits an active reservation once payment is verified.
 */
export async function commitStockReservation(
  client: Prisma.TransactionClient | PrismaClient,
  reservationId: string,
  orderId: string
) {
  const reservation = await client.stockReservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation || reservation.status !== "ACTIVE") {
    throw new Error(`Reservation ${reservationId} is not in ACTIVE state to commit.`);
  }

  // Mark reservation committed
  await client.stockReservation.update({
    where: { id: reservationId },
    data: {
      status: "COMMITTED",
      orderId,
    },
  });

  // Release from reservedQuantityGrams
  await client.inventoryBatch.update({
    where: { id: reservation.batchId },
    data: {
      reservedQuantityGrams: {
        decrement: reservation.quantityGrams,
      },
    },
  });

  // Log fulfillment to stock ledger
  await client.stockLedgerEntry.create({
    data: {
      batchId: reservation.batchId,
      skuId: reservation.skuId,
      entryType: "ORDER_FULFILLMENT",
      quantityDeltaGrams: 0, // already decremented during reservation
      balanceAfterGrams: 0,
      referenceType: "ORDER",
      referenceId: orderId,
      notes: `Reservation converted to confirmed order ${orderId}.`,
    },
  });
}

/**
 * Releases an active reservation back to available batch stock.
 */
export async function releaseStockReservation(
  client: Prisma.TransactionClient | PrismaClient,
  reservationId: string,
  reason = "USER_CANCELLED"
) {
  const reservation = await client.stockReservation.findUnique({
    where: { id: reservationId },
    include: { batch: true },
  });

  if (!reservation || reservation.status !== "ACTIVE") {
    return;
  }

  // Atomically return quantity to availableQuantityGrams
  await client.inventoryBatch.update({
    where: { id: reservation.batchId },
    data: {
      availableQuantityGrams: {
        increment: reservation.quantityGrams,
      },
      reservedQuantityGrams: {
        decrement: reservation.quantityGrams,
      },
    },
  });

  // Mark reservation status RELEASED
  await client.stockReservation.update({
    where: { id: reservationId },
    data: {
      status: "RELEASED",
    },
  });

  // Log release to stock ledger
  await client.stockLedgerEntry.create({
    data: {
      batchId: reservation.batchId,
      skuId: reservation.skuId,
      entryType: "RESERVATION_RELEASE",
      quantityDeltaGrams: reservation.quantityGrams,
      balanceAfterGrams: reservation.batch.availableQuantityGrams + reservation.quantityGrams,
      referenceType: "RESERVATION",
      referenceId: reservation.id,
      notes: `Reservation hold released: ${reason}`,
    },
  });
}

/**
 * Expired Reservation Reaper Worker.
 * Scans for active reservations past their TTL and restores batch stock.
 */
export async function reapExpiredReservations(): Promise<number> {
  const expired = await prisma.stockReservation.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lt: new Date() },
    },
  });

  for (const res of expired) {
    await prisma.$transaction(async (tx) => {
      await releaseStockReservation(tx, res.id, "EXPIRED_TTL_TIMEOUT");
    });
  }

  return expired.length;
}

