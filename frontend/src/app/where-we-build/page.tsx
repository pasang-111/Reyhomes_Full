"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/common/motion";

/** Indicative regions only — not CMS-backed. Confirm with sales before treating as contractual coverage. */
const REGIONS = [
  {
    name: "Greater Sydney",
    suburbs: ["Parramatta", "Penrith", "Liverpool", "Blacktown", "Sutherland", "Northern Beaches"],
    postcodes: ["2000-2234", "2745-2770"],
  },
  {
    name: "Hunter & Central Coast",
    suburbs: ["Newcastle", "Maitland", "Gosford", "Wyong", "Lake Macquarie"],
    postcodes: ["2250-2300", "2315-2330"],
  },
  {
    name: "Illawarra & South Coast",
    suburbs: ["Wollongong", "Shellharbour", "Kiama", "Nowra"],
    postcodes: ["2500-2541"],
  },
];

function postcodeInRange(pc: number, ranges: string[]): boolean {
  for (const r of ranges) {
    if (r.includes("-")) {
      const [a, b] = r.split("-").map((x) => parseInt(x, 10));
      if (pc >= a && pc <= b) return true;
    } else if (parseInt(r, 10) === pc) return true;
  }
  return false;
}

export default function WhereWeBuildPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<"yes" | "no" | null>(null);
  const [matched, setMatched] = useState<string | null>(null);

  const allSuburbs = useMemo(
    () => REGIONS.flatMap((r) => r.suburbs.map((s) => ({ suburb: s, region: r.name }))),
    []
  );

  const check = () => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    if (/^\d{4}$/.test(q)) {
      const pc = parseInt(q, 10);
      for (const r of REGIONS) {
        if (postcodeInRange(pc, r.postcodes)) {
          setResult("yes");
          setMatched(r.name);
          return;
        }
      }
      setResult("no");
      setMatched(null);
      return;
    }
    const hit = allSuburbs.find(
      (s) => s.suburb.toLowerCase() === q || s.suburb.toLowerCase().includes(q)
    );
    if (hit) {
      setResult("yes");
      setMatched(hit.region);
      return;
    }
    setResult("no");
    setMatched(null);
  };

  return (
    <main className="min-h-screen bg-[#0A1420] text-[#F8F5F0]">
      <section className="rh-section relative overflow-hidden border-b border-white/10 bg-[#0C2A44] px-5 pb-20 pt-36 sm:px-8 lg:px-10">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--lg rh-orb--drift-a"
            style={{ top: "-20%", right: "-10%" }}
          />
        </div>
        <Reveal className="relative z-10 mx-auto max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#D8C7A4]">
            Service footprint
          </p>
          <h1 className="mt-4 font-display text-4xl font-light tracking-tight sm:text-6xl">
            Where we build
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#F8F5F0]/55">
            Enter a suburb or postcode to see if ReyHomes builds in your area.
          </p>
          <p
            role="status"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#D8C7A4]/35 bg-[#D8C7A4]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D8C7A4]"
          >
            Coverage TBD — indicative regions only, not a live service map
          </p>
        </Reveal>
      </section>

      <section className="rh-section mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--navy rh-orb--md rh-orb--drift-b"
            style={{ bottom: "-15%", left: "-10%" }}
          />
        </div>
        <div className="relative z-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <label className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D8C7A4]/90">
            Suburb or postcode
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setResult(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && check()}
              placeholder="e.g. Parramatta or 2150"
              className="flex-1 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm text-[#F8F5F0] outline-none placeholder:text-white/35 focus:border-[#D8C7A4]/50"
            />
            <button
              type="button"
              onClick={check}
              className="rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0C2A44]"
              style={{ background: "linear-gradient(135deg, #F5F0E6, #E8D9B8, #D8C7A4)" }}
            >
              Check
            </button>
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result + (matched || "")}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-6 flex items-start gap-3 rounded-xl border px-4 py-4 ${
                  result === "yes"
                    ? "border-[#D8C7A4]/35 bg-[#D8C7A4]/10"
                    : "border-white/15 bg-white/[0.04]"
                }`}
              >
                {result === "yes" ? (
                  <Check className="mt-0.5 shrink-0 text-[#D8C7A4]" size={18} />
                ) : (
                  <X className="mt-0.5 shrink-0 text-white/50" size={18} />
                )}
                <div>
                  {result === "yes" ? (
                    <>
                      <p className="text-sm font-medium">Yes — we build in {matched}.</p>
                      <Link
                        href="/enquire"
                        className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D8C7A4]"
                      >
                        Enquire now <ArrowRight size={14} />
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium">Not listed in our current zones.</p>
                      <p className="mt-1 text-sm text-white/50">
                        Still reach out — we expand by project.
                      </p>
                      <Link
                        href="/contact"
                        className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D8C7A4]"
                      >
                        Contact us <ArrowRight size={14} />
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative z-10 mt-16 grid gap-6 sm:grid-cols-3">
          {REGIONS.map((r) => (
            <div key={r.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <MapPin size={16} className="text-[#D8C7A4]" />
              <h2 className="mt-3 font-display text-xl">{r.name}</h2>
              <p className="mt-2 text-xs leading-relaxed text-white/45">{r.suburbs.join(" · ")}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
