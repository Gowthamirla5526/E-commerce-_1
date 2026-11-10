import React from "react";
import { FreshPlanClient } from "@/shared/components/plan/FreshPlanClient";

export const metadata = {
  title: "Seven-Day Fresh Plan | Fresh Harvest",
  description:
    "Organize a full week of fresh fruits and vegetables. Stock-aware, zero-waste kitchen meal planning engine.",
};

export default function FreshPlanPage() {
  return <FreshPlanClient />;
}

