import React from "react";
import { prisma } from "@/core/db/prisma";
import { BatchGuardianAdminClient } from "./BatchGuardianAdminClient";

export const revalidate = 0; // Live admin data

export default async function AdminQualityPage() {
  const [alerts, feedbacks] = await Promise.all([
    prisma.qualityAlert.findMany({
      include: {
        batch: {
          include: {
            sku: {
              include: {
                product: true,
              },
            },
            supplier: true,
          },
        },
        investigation: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.batchQualityFeedback.findMany({
      take: 30,
      include: {
        batch: {
          include: {
            sku: {
              include: {
                product: true,
              },
            },
          },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const serializedAlerts = alerts.map((a) => ({
    id: a.id,
    batchId: a.batchId,
    severity: a.severity,
    currentComplaints: a.currentComplaints,
    triggerReason: a.triggerReason,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
    batch: {
      batchNumber: a.batch.batchNumber,
      status: a.batch.status,
      sku: {
        product: {
          title: a.batch.sku.product.title,
        },
      },
      supplier: {
        name: a.batch.supplier.name,
      },
    },
    investigation: a.investigation
      ? {
          actionTaken: a.investigation.actionTaken,
          physicalInspectionNotes: a.investigation.physicalInspectionNotes,
        }
      : null,
  }));

  const serializedFeedbacks = feedbacks.map((f) => ({
    id: f.id,
    freshnessRating: f.freshnessRating,
    firmnessRating: f.firmnessRating,
    damagePresent: f.damagePresent,
    defectCategory: f.defectCategory,
    comments: f.comments,
    createdAt: f.createdAt.toISOString(),
    batch: {
      batchNumber: f.batch.batchNumber,
      sku: {
        product: {
          title: f.batch.sku.product.title,
        },
      },
    },
    user: {
      name: f.user.name,
    },
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <BatchGuardianAdminClient
        alerts={serializedAlerts}
        recentFeedbacks={serializedFeedbacks}
      />
    </div>
  );
}

