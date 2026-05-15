"use client";

import Analytics from "@/fe/pages/analytics";

export default function AnalyticsPage() {
  const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";

  if (isProduction) {
    return null;
  }

  return <Analytics />;
}
