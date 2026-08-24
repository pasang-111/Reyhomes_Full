"use client";

import { motion } from "framer-motion";
import { Reveal, FloatGlow, luxeEase } from "@/components/common/motion";

interface EnquiryCTAProps {
  onEnquire?: () => void;
  href?: string;
  heading?: string;
  subheading?: string;
}

export default function EnquiryCTA({
  onEnquire,
  href = "/contact",
  heading = "Your Horizon",
  subheading = "Speak with our team and begin crafting a home built entirely around you.",
}: EnquiryCTAProps) {
  return (
    <section className="relative overflow-hidden bg-[#0A1628] py-28 sm:py-36 text-[#F5F0E6]">
      <FloatGlow
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D8C7A4]/10 blur-[130px]"
        duration={20}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-[size:28px_28px]" />

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#D8C7A4]">
            Private Consultation
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mt-6 font-display text-4xl font-light tracking-tight sm:text-5xl md:text-6xl">
            Ready to Build{" "}
            <span className="italic text-[#D8C7A4]">{heading}</span>
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-8 h-px w-16 bg-[#D8C7A4]/50" />
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/55">
            {subheading}
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <a
            href={href}
            onClick={onEnquire}
            className="group mt-12 inline-flex items-center gap-3 rounded-full border border-[#D8C7A4]/60 px-10 py-4 text-sm font-medium uppercase tracking-wider text-[#D8C7A4] transition-all duration-500 hover:bg-[#D8C7A4] hover:text-[#0A1628]"
          >
            Enquire Now
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}