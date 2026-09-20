import mixpanel from "mixpanel-browser";

const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let initialized = false;

export function initAnalytics() {
  if (initialized || !TOKEN || typeof window === "undefined") return;
  mixpanel.init(TOKEN, {
    track_pageview: true,
    persistence: "localStorage",
  });
  initialized = true;
}

/** No-ops safely if analytics was never initialized (no token set). */
export function track(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  mixpanel.track(event, properties);
}

export function identifyOwner(ownerId: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  mixpanel.identify(ownerId);
  if (properties) mixpanel.people.set(properties);
}
