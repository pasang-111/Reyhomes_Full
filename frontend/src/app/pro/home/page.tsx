"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HardHat, MessageCircle, Sparkles, Bell, ArrowRight } from "lucide-react";
import {
  getProDashboard,
  getProNotifications,
  type ProBuild,
  type ProNotification,
} from "@/lib/api/pro";

export default function ProHomePage() {
  const [build, setBuild] = useState<ProBuild | null>(null);
  const [notifications, setNotifications] = useState<ProNotification[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getProDashboard(), getProNotifications()])
      .then(([dash, notes]) => {
        setBuild(dash.build);
        setNotifications(notes);
      })
      .catch((e) => setError(e?.message || "Unable to load Pro home."));
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#D8C7A4]">
          Client portal
        </p>
        <h1 className="mt-2 font-display text-4xl text-white sm:text-5xl">
          Your build, at a glance
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/50">
          Track progress, messages, inclusions and alerts — all in one place.
        </p>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            href: "/pro/build",
            label: "Build progress",
            value: build ? `${build.progress}%` : "—",
            icon: HardHat,
          },
          {
            href: "/pro/messages",
            label: "Messages",
            value: "Open",
            icon: MessageCircle,
          },
          {
            href: "/pro/inclusions",
            label: "Inclusions",
            value: "Manage",
            icon: Sparkles,
          },
          {
            href: "/pro/notifications",
            label: "Alerts",
            value: unread ? `${unread} new` : "All clear",
            icon: Bell,
          },
        ].map(({ href, label, value, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#D8C7A4]/40"
          >
            <Icon className="h-5 w-5 text-[#D8C7A4]" />
            <p className="mt-4 text-[10px] uppercase tracking-wider text-white/40">
              {label}
            </p>
            <p className="mt-1 flex items-center justify-between text-xl text-white">
              {value}
              <ArrowRight className="h-4 w-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-[#D8C7A4]" />
            </p>
          </Link>
        ))}
      </div>

      {build ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[10px] uppercase tracking-wider text-white/40">
            Current stage
          </p>
          <h2 className="mt-2 text-2xl capitalize text-white">
            {build.current_stage?.replace(/_/g, " ") || "Planning"}
          </h2>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#D8C7A4]"
              style={{ width: `${Math.min(100, build.progress || 0)}%` }}
            />
          </div>
          <Link
            href="/pro/build"
            className="mt-4 inline-flex text-sm text-[#D8C7A4] hover:underline"
          >
            View full timeline →
          </Link>
        </section>
      ) : (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/50">
          Your build details will appear here once your agent links a contract.
        </section>
      )}
    </div>
  );
}
