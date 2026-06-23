"use client";

declare global {
  interface Window { fbq?: (...args: unknown[]) => void; }
}

export type MarketingEvent = "PageView" | "Lead" | "CompleteRegistration" | "InitiateCheckout" | "Purchase";

export function trackEvent(event: MarketingEvent, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", event, data || {});
}
