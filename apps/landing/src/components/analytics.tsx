"use client";

import dynamic from "next/dynamic";

const Analytics = dynamic(
  async () => {
    const mod = await import("@vercel/analytics/react");
    return { default: mod.Analytics };
  },
  { ssr: false },
);

const AnalyticsWrapper = () => {
  return <Analytics />;
};

export { AnalyticsWrapper };
