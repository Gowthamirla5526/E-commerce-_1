import React from "react";
import { MatchmakerClient } from "@/shared/components/matchmaker/MatchmakerClient";

export const metadata = {
  title: "Freshness Matchmaker | Fresh Harvest",
  description:
    "Buy fruits and vegetables based on when you plan to eat them. Cold-chain batch readiness matching engine.",
};

export default function MatchmakerPage() {
  return <MatchmakerClient />;
}
