"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import {
  getProThreads,
  sendProMessage,
  startProThread,
  type ProThread,
} from "@/lib/api/pro";

export default function ProMessagesPage() {
  const [threads, setThreads] = useState<ProThread[]>([]);
  const [active, setActive] = useState<ProThread | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function reload() {
    const th = await getProThreads();
    setThreads(th);
    setActive((prev) => th.find((t) => t.id === prev?.id) || th[0] || null);
  }

  useEffect(() => {
    reload().catch((e) => setError(e?.message || "Unable to load messages."));
  }, []);

  async function onSend() {
    if (!message.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (!active) {
        await startProThread("Message", message.trim());
      } else {
        await sendProMessage(active.id, message.trim());
      }
      setMessage("");
      await reload();
    } catch (e: any) {
      setError(e?.message || "Send failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#D8C7A4]">
          Messages
        </p>
        <h1 className="mt-2 font-display text-4xl text-white">Your team</h1>
      </header>
      {error ? (
        <p className="text-sm text-red-300">{error}</p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
          {threads.length === 0 ? (
            <p className="p-3 text-sm text-white/40">No threads yet.</p>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                  active?.id === t.id
                    ? "bg-[#D8C7A4]/20 text-white"
                    : "text-white/60 hover:bg-white/5"
                }`}
              >
                {t.subject || `Thread #${t.id}`}
              </button>
            ))
          )}
        </aside>
        <div className="flex min-h-[360px] flex-col rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {(active?.messages || []).map((m: any) => (
              <div
                key={m.id}
                className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80"
              >
                <p className="text-[10px] text-white/35">
                  {m.sender_name || "Team"} · {m.created_at}
                </p>
                <p className="mt-1">{m.body}</p>
              </div>
            ))}
            {!active?.messages?.length ? (
              <p className="text-sm text-white/40">
                Start the conversation below.
              </p>
            ) : null}
          </div>
          <div className="flex gap-2 border-t border-white/10 p-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message…"
              className="flex-1 rounded-xl border border-white/10 bg-[#111820] px-3 py-2 text-sm text-white"
              onKeyDown={(e) => e.key === "Enter" && onSend()}
            />
            <button
              type="button"
              disabled={saving}
              onClick={onSend}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D8C7A4] px-4 py-2 text-sm font-medium text-[#0A1628] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
