"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { getProDashboard, type ProBuild } from "@/lib/api/pro";

const stages = [
  "planning",
  "foundation",
  "frame",
  "lockup",
  "fixing",
  "completion",
  "handover",
];

export default function ProBuildPage() {
  const [build, setBuild] = useState<ProBuild | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProDashboard()
      .then((d) => setBuild(d.build))
      .catch((e) => setError(e?.message || "Unable to load build."));
  }, []);

  const current = build ? Math.max(0, stages.indexOf(build.current_stage)) : -1;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#D8C7A4]">
          Build
        </p>
        <h1 className="mt-2 font-display text-4xl text-white">Progress timeline</h1>
      </header>
      {error ? (
        <p className="text-sm text-red-300">{error}</p>
      ) : null}
      {!build && !error ? (
        <p className="text-white/50">No active build linked yet.</p>
      ) : null}
      {build ? (
        <>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-white/50">Overall progress</p>
            <p className="mt-1 text-3xl text-white">{build.progress}%</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-[#D8C7A4]"
                style={{ width: `${Math.min(100, build.progress || 0)}%` }}
              />
            </div>
          </div>
          <ol className="space-y-3">
            {stages.map((stage, i) => {
              const done = i <= current;
              return (
                <li
                  key={stage}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                    done
                      ? "border-[#D8C7A4]/30 bg-[#D8C7A4]/10"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-[#D8C7A4]" />
                  ) : (
                    <Circle className="h-5 w-5 text-white/25" />
                  )}
                  <span className="capitalize text-white">
                    {stage.replace(/_/g, " ")}
                  </span>
                  {i === current ? (
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-[#D8C7A4]">
                      Current
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </>
      ) : null}
    </div>
  );
}
