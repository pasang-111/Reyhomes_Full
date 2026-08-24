"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/common/motion";

const ITEMS = [
  { value: "15+", label: "Years of practice" },
  { value: "NSW", label: "Build regions" },
  { value: "Atelier", label: "Curated designs" },
];

export default function PracticeStrip() {
  return (
    <section className="rh-section border-y border-[#D8C7A4]/15 bg-[#0C2A44] text-[#F8F5F0]">
      <div className="rh-orbs" aria-hidden="true">
        <div
          className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-c"
          style={{ top: "-30%", left: "30%" }}
        />
        <div
          className="rh-orb rh-orb--navy rh-orb--md rh-orb--drift-a"
          style={{ bottom: "-40%", right: "10%" }}
        />
      </div>
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-5 py-12 sm:flex-row sm:px-8 lg:px-10">
        <Reveal className="flex flex-wrap items-center justify-center gap-10 sm:justify-start">
          {ITEMS.map((item) => (
            <div key={item.label} className="text-center sm:text-left">
              <p className="font-display text-3xl font-light tracking-tight text-[#D8C7A4]">
                {item.value}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[#F8F5F0]/55">
                {item.label}
              </p>
            </div>
          ))}
        </Reveal>
        <Reveal delay={0.08}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/where-we-build"
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#F8F5F0]/75 underline-offset-4 transition hover:text-[#D8C7A4] hover:underline"
            >
              Where we build
            </Link>
            <Link
              href="/process-timeline"
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#F8F5F0]/75 underline-offset-4 transition hover:text-[#D8C7A4] hover:underline"
            >
              Our process
            </Link>
            <Link
              href="/enquire"
              className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0C2A44]"
              style={{ background: "linear-gradient(135deg, #F5F0E6, #E8D9B8, #D8C7A4)" }}
            >
              Book a consult
              <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
