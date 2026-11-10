import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline Mode | Fresh Harvest",
  description: "You are currently browsing Fresh Harvest in offline mode.",
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

