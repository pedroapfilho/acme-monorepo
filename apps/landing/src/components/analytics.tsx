"use client";

import dynamic from "next/dynamic";

const Analytics = dynamic(
  () => import("@vercel/analytics/react").then((mod) => ({ default: mod.Analytics })),
  { ssr: false },
);

const AnalyticsWrapper = () => {
  return <Analytics />;
};

export { AnalyticsWrapper };
