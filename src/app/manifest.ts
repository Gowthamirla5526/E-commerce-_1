import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fresh Harvest | Fresh Fruits & Vegetables",
    short_name: "Fresh Harvest",
    description:
      "Commercial e-commerce platform dedicated exclusively to fresh fruits and vegetables. Featuring Freshness Matchmaker, My Fridge Intelligence, Seven-Day Meal Planning, and Community Harvest Drops.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf9f5",
    theme_color: "#1b4332",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
      {
        src: "/icons/maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Freshness Matchmaker",
        short_name: "Matchmaker",
        description: "Buy produce based on consumption timeline",
        url: "/matchmaker",
        icons: [{ src: "/icons/icon-192.svg", sizes: "192x192" }],
      },
      {
        name: "My Fridge Intelligence",
        short_name: "My Fridge",
        description: "Household produce tracker",
        url: "/fridge",
        icons: [{ src: "/icons/icon-192.svg", sizes: "192x192" }],
      },
      {
        name: "Community Harvest Drops",
        short_name: "Harvest Drops",
        description: "Neighbourhood bulk farm pooling",
        url: "/harvest-drops",
        icons: [{ src: "/icons/icon-192.svg", sizes: "192x192" }],
      },
      {
        name: "Market Pulse Mandi Index",
        short_name: "Market Pulse",
        description: "Transparent APMC Mandi pricing comparison",
        url: "/market-pulse",
        icons: [{ src: "/icons/icon-192.svg", sizes: "192x192" }],
      },
    ],
    categories: ["shopping", "food", "lifestyle"],
  };
}

