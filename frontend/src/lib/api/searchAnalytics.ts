/**
 * Fire-and-forget search analytics → POST /api/search-events/
 */

import { API_BASE } from "./client";

export type SearchEventPayload = {
  event_type: "query" | "click";
  query: string;
  result_type?: string;
  result_id?: string | number;
  result_label?: string;
  result_count?: number;
  path?: string;
};

export function trackSearchEvent(payload: SearchEventPayload) {
  if (typeof window === "undefined") return;
  const query = (payload.query || "").trim();
  if (!query) return;

  const body = {
    event_type: payload.event_type,
    query: query.slice(0, 200),
    result_type: payload.result_type || "",
    result_id: payload.result_id != null ? String(payload.result_id) : "",
    result_label: (payload.result_label || "").slice(0, 200),
    result_count: payload.result_count ?? 0,
    path: payload.path || window.location.pathname,
  };

  const url = `${API_BASE}/api/search-events/`;
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], {
        type: "application/json",
      });
      navigator.sendBeacon(url, blob);
      return;
    }
  } catch {
    /* fall through */
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}
