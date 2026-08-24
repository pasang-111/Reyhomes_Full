"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, luxeEase } from "@/components/common/motion";
import Magnetic from "@/components/effects/Magnetic";

const VALUES = [
  {
    n: "01",
    title: "Designed around you",
    desc: "Every project begins with how you live — block, lifestyle, and the home you want to grow into.",
  },
  {
    n: "02",
    title: "Craft without compromise",
    desc: "Considered materials, refined proportions, and detailing that still feels right in ten years.",
  },
  {
    n: "03",
    title: "A personal process",
    desc: "From first conversation to handover, the path stays clear, transparent, and genuinely human.",
  },
];

export default function AboutPreview() {
  return (
    <section className="relative overflow-hidden bg-[#0A1628] px-5 py-24 text-[#F8F5F0] sm:px-8 lg:px-10 lg:py-32">
      <div
        className="pointer-events-none absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full bg-[#D8C7A4]/[0.06] blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-cyan-400/[0.05] blur-[140px]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#D8C7A4]">
            About ReyHomes
          </p>
          <h2 className="mt-5 max-w-xl font-display text-4xl font-light leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Homes shaped by craft,
            <br />
            not convention.
          </h2>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-white/55">
            ReyHomes is a premium new-home builder for NSW families who want
            architecture that feels considered — from the first plan through to
            the keys in your hand.
          </p>
          <Magnetic className="mt-10">
            <Link
              href="/about"
              className="group inline-flex items-center gap-3 rounded-full border border-[#D8C7A4]/35 bg-[#D8C7A4]/10 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#D8C7A4] transition hover:border-[#D8C7A4]/70 hover:bg-[#D8C7A4]/20"
            >
              Our story
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Magnetic>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-1">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.n}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: luxeEase }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#D8C7A4]/30 hover:bg-white/[0.05]"
            >
              <div className="flex items-start gap-4">
                <span className="font-display text-2xl font-light text-[#D8C7A4]/80">
                  {v.n}
                </span>
                <div>
                  <h3 className="text-[15px] font-medium tracking-wide text-[#F8F5F0]">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {v.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
