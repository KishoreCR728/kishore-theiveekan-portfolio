"use client";
import { useEffect } from "react";

/**
 * Development only. `next dev` hydrates the page with React, while the published site has no React at all
 * (scripts/strip-react.mjs). The home page's own browser module waits for this signal in dev, so it never
 * changes the DOM while React is still hydrating it.
 */
export default function HydrationSignal() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "1";
    dispatchEvent(new Event("home:hydrated"));
  }, []);
  return null;
}
