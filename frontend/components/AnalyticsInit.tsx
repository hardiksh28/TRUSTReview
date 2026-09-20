"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

/** Initializes PostHog once, client-side. No-ops entirely if no API key is set. */
export function AnalyticsInit() {
  useEffect(() => {
    initAnalytics();
  }, []);
  return null;
}
