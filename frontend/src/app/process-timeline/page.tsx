"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import { Reveal } from "@/components/common/motion";
import { softSpring } from "@/lib/spring";

const steps = [
  {
    number: "01",
    title: "Consultation",
    short: "The beginning",
    desc: "We start by understanding your block, your lifestyle, your vision and your budget. This conversation becomes the foundation for everything that follows.",
  },
  {
    number: "02",
    title: "Design & Documentation",
    short: "Bring it to life",
    desc: "Our team refines your floor plan, finishes, facade and selections before preparing the detailed drawings and specifications required for your build.",
  },
  {
    number: "03",
    title: "Approvals & Contracts",
    short: "Make it official",
    desc: "We coordinate approvals, finalise your fixed-price contract and establish a clear construction schedule so you know exactly what comes next.",
  },
  {
    number: "04",
    title: "Construction",
    short: "Watch it rise",
    desc: "From the first slab to the final fit-out, your dedicated team keeps the project moving while keeping you informed throughout the journey.",
  },
  {
    number: "05",
    title: "Handover",
    short: "Your new beginning",
    desc: "We complete the final inspection, walk you through your new home and hand over the keys. Our relationship continues beyond move-in.",
  },
];

function TimelineStep({
  step,
  index,
  isEven,
}: {
  step: (typeof steps)[0];
  index: number;
  isEven: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35, margin: "-10% 0px" });

  return (
    <div ref={ref} className="relative md:grid md:min-h-[260px] md:grid-cols-2">
      {/* Desktop left / right content */}
      <motion.div
        className={`hidden md:flex ${
          isEven ? "justify-end pr-20" : "order-2 justify-start pl-20"
        }`}
        initial={{ opacity: 0, x: isEven ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ ...softSpring, delay: 0.1 }}
      >
        <div className={`max-w-md self-center ${isEven ? "text-right" : "text-left"}`}>
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.35em] text-[#F8F5F0]/45">
            {step.short}
          </p>
          <h3 className="font-display text-3xl font-light text-[#F8F5F0]">
            {step.title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-[#F8F5F0]/40">{step.desc}</p>
        </div>
      </motion.div>

      {/* Center node */}
      <div className="absolute left-0 top-0 z-20 md:left-1/2 md:-translate-x-1/2">
        <motion.div
          className="flex h-14 w-14 items-center justify-center rounded-full border border-[#F8F5F0]/15 bg-[#0A1420] shadow-[0_0_0_8px_rgba(10,20,32,0.95)] md:h-[72px] md:w-[72px]"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ ...softSpring, delay: 0.05 }}
        >
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-full font-display text-sm md:h-12 md:w-12"
            animate={
              inView
                ? {
                    backgroundColor: "#F8F5F0",
                    color: "#0F1C2E",
                    boxShadow: "0 0 24px rgba(248,245,240,0.25)",
                  }
                : {
                    backgroundColor: "rgba(248,245,240,0.12)",
                    color: "rgba(248,245,240,0.5)",
                    boxShadow: "0 0 0 rgba(0,0,0,0)",
                  }
            }
            transition={{ duration: 0.45 }}
          >
            {step.number}
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile content + desktop connector */}
      <div
        className={`pl-20 md:flex ${
          isEven
            ? "md:order-2 md:items-center md:pl-20"
            : "md:items-center md:justify-end md:pr-20"
        }`}
      >
        <motion.div
          className="max-w-md py-4 md:hidden"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...softSpring, delay: 0.12 }}
        >
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.35em] text-[#F8F5F0]/45">
            {step.short}
          </p>
          <h3 className="font-display text-2xl font-light text-[#F8F5F0]">
            {step.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[#F8F5F0]/40">{step.desc}</p>
        </motion.div>

        <motion.div
          className="hidden md:block"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ originX: isEven ? 0 : 1 }}
        >
          <div
            className={`h-px w-20 ${
              isEven
                ? "bg-gradient-to-r from-[#F8F5F0]/20 to-transparent"
                : "bg-gradient-to-l from-[#F8F5F0]/20 to-transparent"
            }`}
          />
        </motion.div>
      </div>
    </div>
  );
}

function TimelineTrack() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 28,
    mass: 0.4,
  });

  // SVG path length ≈ 1000 units — pathLength draws as user scrolls
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 30,
    mass: 0.45,
  });

  return (
    <div ref={ref} className="relative">
      {/* Track background */}
      <div className="absolute bottom-0 left-[27px] top-0 w-px bg-[#F8F5F0]/10 md:left-1/2 md:-translate-x-1/2" />

      {/* Scroll-drawn SVG path (desktop center + mobile left) */}
      <svg
        className="pointer-events-none absolute bottom-0 left-[27px] top-0 h-full w-8 -translate-x-1/2 md:left-1/2"
        viewBox="0 0 8 1000"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M4 0 C4 80, 4 120, 4 200 S4 320, 4 400 S4 520, 4 600 S4 760, 4 1000"
          fill="none"
          stroke="rgba(248,245,240,0.12)"
          strokeWidth="2"
        />
        <motion.path
          d="M4 0 C4 80, 4 120, 4 200 S4 320, 4 400 S4 520, 4 600 S4 760, 4 1000"
          fill="none"
          stroke="url(#rey-path-gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ pathLength }}
        />
        <defs>
          <linearGradient id="rey-path-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D8C7A4" />
            <stop offset="55%" stopColor="#F8F5F0" />
            <stop offset="100%" stopColor="#D8C7A4" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      {/* Scroll-filled progress line (fallback thickness) */}
      <motion.div
        className="absolute left-[27px] top-0 w-px origin-top bg-gradient-to-b from-[#D8C7A4] via-[#F8F5F0]/70 to-[#F8F5F0]/15 md:left-1/2 md:-translate-x-1/2"
        style={{
          height: "100%",
          scaleY,
        }}
      />

      <div className="space-y-10 md:space-y-0">
        {steps.map((step, index) => (
          <TimelineStep
            key={step.number}
            step={step}
            index={index}
            isEven={index % 2 === 0}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProcessTimelinePage() {
  return (
    <main className="min-h-screen bg-[#0A1420] text-[#F8F5F0]">
      {/* HERO */}
      <section className="rh-section relative min-h-[88vh] overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#F8F5F0]/[0.06] blur-[150px]" />
        <div className="pointer-events-none absolute right-[-180px] top-[20%] h-[600px] w-[600px] rounded-full bg-[#1E2A44]/50 blur-[180px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(248,245,240,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(248,245,240,.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl items-center px-6 pb-20 pt-36 lg:px-10">
          <div className="max-w-5xl">
            <Reveal>
              <div className="mb-8 flex items-center gap-4">
                <span className="h-px w-12 bg-gradient-to-r from-[#F8F5F0]/50 to-transparent" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#F8F5F0]/55">
                  The ReyHomes Journey
                </span>
                <Sparkles size={13} className="text-[#F8F5F0]/60" />
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="max-w-5xl font-display text-5xl font-light leading-[0.95] tracking-[-0.04em] sm:text-6xl md:text-8xl">
                Your Home.
                <br />
                <span className="text-[#F8F5F0]/65">Your Journey.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-10 max-w-2xl text-base font-light leading-8 text-[#F8F5F0]/45 sm:text-lg">
                Building a home should feel exciting, not overwhelming. From the
                first conversation to the moment you turn the key, our process is
                designed to make every stage clear, considered and beautifully
                simple.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-14 flex flex-wrap gap-10 border-t border-[#F8F5F0]/10 pt-8">
                {[
                  ["05", "Key stages"],
                  ["01", "Dedicated journey"],
                  ["∞", "Possibilities"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="font-display text-3xl text-[#F8F5F0]">{value}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-[#F8F5F0]/35">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0A1420] to-transparent" />
      </section>

      {/* INTRO */}
      <section className="rh-section relative overflow-hidden bg-[#F8F5F0] py-28 text-[#0F1C2E]">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-c"
            style={{ top: "-15%", right: "-8%", opacity: 0.35 }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#0F1C2E]/50">
                A considered process
              </p>
              <h2 className="mt-5 max-w-md font-display text-4xl font-light leading-tight md:text-5xl">
                Every detail has a place.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-xl font-light leading-9 text-[#0F1C2E]/55">
                We believe a premium building experience starts with clarity.
                That’s why every stage is carefully structured, professionally
                managed and communicated with you.
              </p>
              <div className="mt-8 flex items-center gap-3 text-sm font-medium text-[#0F1C2E]">
                <Check size={16} />
                A transparent journey from beginning to end
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TIMELINE — scroll animated */}
      <section className="rh-section relative overflow-hidden bg-[#0A1420] py-32">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F8F5F0]/[0.03] blur-[180px]" />
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--navy rh-orb--lg rh-orb--drift-a"
            style={{ bottom: "-20%", left: "-10%" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-10">
          <Reveal className="mb-20 max-w-2xl">
            <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.4em] text-[#F8F5F0]/50">
              <span className="h-px w-8 bg-[#F8F5F0]/40" />
              The Process
            </p>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight md:text-6xl">
              From first idea
              <br />
              to front door.
            </h2>
          </Reveal>

          <TimelineTrack />
        </div>
      </section>

      {/* CTA */}
      <section className="rh-section relative overflow-hidden bg-[#0A1420] py-36 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[550px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F8F5F0]/[0.05] blur-[160px]" />
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-b"
            style={{ top: "-10%", right: "5%" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#F8F5F0]/15 bg-[#F8F5F0]/[0.04]">
              <Sparkles size={18} className="text-[#F8F5F0]/70" />
            </div>
            <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.5em] text-[#F8F5F0]/50">
              Ready when you are
            </p>
            <h2 className="mt-5 font-display text-5xl font-light leading-[1.05] md:text-7xl">
              Let’s create
              <br />
              something remarkable.
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-base font-light leading-7 text-[#F8F5F0]/40">
              Every great home starts with a conversation. Tell us what you’re
              imagining and we’ll help turn it into a plan.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/enquire"
                className="group inline-flex items-center gap-3 rounded-full bg-[#F8F5F0] px-7 py-4 text-xs font-semibold tracking-wide text-[#0F1C2E] transition-all duration-500 hover:-translate-y-1 hover:bg-white"
              >
                Start a conversation
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F1C2E]/10 transition-transform duration-500 group-hover:translate-x-1">
                  <ArrowRight size={14} />
                </span>
              </Link>
              <Link
                href="/home-designs"
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#F8F5F0]/70 underline-offset-4 hover:text-[#D8C7A4] hover:underline"
              >
                Explore designs
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}