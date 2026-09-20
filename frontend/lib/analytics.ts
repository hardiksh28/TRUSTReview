import posthog from "posthog-js";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let initialized = false;

export function initAnalytics() {
  if (initialized || !KEY || typeof window === "undefined") return;
  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
  });
  initialized = true;
}

/** No-ops safely if analytics was never initialized (no key set). */
export function track(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function identifyOwner(ownerId: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.identify(ownerId, properties);
}
