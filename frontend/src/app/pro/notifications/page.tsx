"use client";

import { useEffect, useState } from "react";
import {
  getProNotifications,
  markProNotificationRead,
  type ProNotification,
} from "@/lib/api/pro";

export default function ProNotificationsPage() {
  const [items, setItems] = useState<ProNotification[]>([]);
  const [error, setError] = useState("");

  async function reload() {
    setItems(await getProNotifications());
  }

  useEffect(() => {
    reload().catch((e) =>
      setError(e?.message || "Unable to load notifications.")
    );
  }, []);

  async function markRead(id: number) {
    try {
      await markProNotificationRead(id);
      await reload();
    } catch (e: any) {
      setError(e?.message || "Could not mark as read.");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#D8C7A4]">
          Alerts
        </p>
        <h1 className="mt-2 font-display text-4xl text-white">Notifications</h1>
      </header>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <ul className="space-y-2">
        {items.map((n) => (
          <li
            key={n.id}
            className={`rounded-xl border px-4 py-3 ${
              n.read
                ? "border-white/10 bg-white/[0.02] text-white/50"
                : "border-[#D8C7A4]/30 bg-[#D8C7A4]/10 text-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{n.title || "Update"}</p>
                <p className="mt-1 text-sm text-white/60">{n.message}</p>
              </div>
              {!n.read ? (
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  className="shrink-0 text-xs text-[#D8C7A4] hover:underline"
                >
                  Mark read
                </button>
              ) : null}
            </div>
          </li>
        ))}
        {!items.length ? (
          <p className="text-sm text-white/40">No notifications yet.</p>
        ) : null}
      </ul>
    </div>
  );
}
