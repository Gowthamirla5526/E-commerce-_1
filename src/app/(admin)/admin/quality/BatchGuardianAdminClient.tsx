"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Package,
  Boxes,
  Eye,
  Check,
} from "lucide-react";

interface AlertItem {
  id: string;
  batchId: string;
  severity: string;
  currentComplaints: number;
  triggerReason: string;
  status: string;
  createdAt: string;
  batch: {
    batchNumber: string;
    status: string;
    sku: {
      product: {
        title: string;
      };
    };
    supplier: {
      name: string;
    };
  };
  investigation?: {
    actionTaken: string;
    physicalInspectionNotes: string;
  } | null;
}

interface FeedbackItem {
  id: string;
  freshnessRating: number;
  firmnessRating: number;
  damagePresent: boolean;
  defectCategory: string | null;
  comments: string | null;
  createdAt: string;
  batch: {
    batchNumber: string;
    sku: {
      product: {
        title: string;
      };
    };
  };
  user: {
    name: string;
  };
}

export const BatchGuardianAdminClient: React.FC<{
  alerts: AlertItem[];
  recentFeedbacks: FeedbackItem[];
}> = ({ alerts: initialAlerts, recentFeedbacks }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [actionTaken, setActionTaken] = useState<"BATCH_QUARANTINED" | "PRICE_DOWNGRADED" | "DISCARDED" | "CLEARED_FALSE_ALARM">("BATCH_QUARANTINED");
  const [auditNotes, setAuditNotes] = useState("Physical darkstore inspection verified: batch quarantined to prevent customer shipment.");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResolveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/v1/admin/quality/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertId: selectedAlert.id,
          actionTaken,
          notes: auditNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to resolve alert.");
      }

      setMessage(`Alert resolved: ${actionTaken}`);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === selectedAlert.id
            ? { ...a, status: "RESOLVED", investigation: { actionTaken, physicalInspectionNotes: auditNotes } }
            : a
        )
      );
      setSelectedAlert(null);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openAlerts = alerts.filter((a) => a.status === "OPEN");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Batch Guardian: Quality Control Tower
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Connect customer satisfaction directly to inventory batches with automated threshold alerts and quarantine controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            openAlerts.length > 0 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
          }`}>
            <span className={`w-2 h-2 rounded-full ${openAlerts.length > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
            {openAlerts.length} Active Quality Incidents
          </span>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Audit Resolution Modal */}
      {selectedAlert && (
        <form onSubmit={handleResolveAlert} className="bg-white border-2 border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                Physical Quality Audit: Batch {selectedAlert.batch.batchNumber}
              </h3>
              <p className="text-xs text-stone-500">
                Produce: {selectedAlert.batch.sku.product.title} • Supplier: {selectedAlert.batch.supplier.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedAlert(null)}
              className="text-xs text-stone-400 hover:text-stone-700"
            >
              Close
            </button>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200">
            <strong>Trigger Reason:</strong> {selectedAlert.triggerReason}
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-stone-700">Audit Action Decision:</label>
            <select
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value as any)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-semibold text-stone-900"
            >
              <option value="BATCH_QUARANTINED">BATCH_QUARANTINED (Hold stock from customer allocations)</option>
              <option value="PRICE_DOWNGRADED">PRICE_DOWNGRADED (Mark down for quick clearance)</option>
              <option value="DISCARDED">DISCARDED (Mark batch depleted / write off)</option>
              <option value="CLEARED_FALSE_ALARM">CLEARED_FALSE_ALARM (Restore batch to active sellable stock)</option>
            </select>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-stone-700">Physical Inspection Audit Notes:</label>
            <textarea
              required
              rows={2}
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedAlert(null)}
              className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#2d6a4f] text-white px-4 py-1.5 rounded-lg text-xs font-bold"
            >
              {isLoading ? "Saving Decision..." : "Commit Quality Decision"}
            </button>
          </div>
        </form>
      )}

      {/* Quality Alerts Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs space-y-3 p-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-stone-900">Active Quality Alerts</h3>
            <p className="text-xs text-stone-500">Triggered automatically when customer feedback crosses defect threshold</p>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500">
            No quality incidents or alerts. All farm batches performing within quality thresholds.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-y border-stone-200 font-semibold text-stone-700">
                <tr>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3">Produce Item</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Complaints</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {alerts.map((a) => (
                  <tr key={a.id} className="hover:bg-stone-50">
                    <td className="py-3 px-3 font-bold text-stone-900">{a.batch.batchNumber}</td>
                    <td className="py-3 px-3 font-sans font-semibold text-stone-900">{a.batch.sku.product.title}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.severity === "CRITICAL" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-800">{a.currentComplaints} reports</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        a.status === "OPEN" ? "bg-red-50 text-red-700 border border-red-200" : "bg-stone-100 text-stone-600"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      {a.status === "OPEN" ? (
                        <button
                          onClick={() => setSelectedAlert(a)}
                          className="bg-[#2d6a4f] text-white hover:bg-[#1b4332] text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Audit & Resolve
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-500 font-mono">
                          {a.investigation?.actionTaken}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Feedback Feed */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-stone-900">Recent Customer Quality Feedback Log</h3>

        {recentFeedbacks.length === 0 ? (
          <div className="py-6 text-center text-xs text-stone-500">
            No post-delivery customer feedback logged yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {recentFeedbacks.map((fb) => (
              <div key={fb.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <div className="flex justify-between font-bold text-stone-900">
                  <span>{fb.batch.sku.product.title}</span>
                  <span className="font-mono text-[10px] text-stone-500">{fb.batch.batchNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-stone-600 font-mono">
                  <span>Freshness: {fb.freshnessRating}/5</span>
                  <span>Firmness: {fb.firmnessRating}/5</span>
                  {fb.damagePresent && <span className="text-red-600 font-bold">Defect: {fb.defectCategory}</span>}
                </div>
                {fb.comments && <p className="text-stone-500 text-[11px] italic">&quot;{fb.comments}&quot;</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

