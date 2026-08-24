"use client";

import { useEffect, useState, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { softSpring, magneticSpring } from "@/lib/spring";

type Stat = {
  number: string;
  title: string;
  subtitle?: string;
};

const stats: Stat[] = [
  { number: "500+", title: "Homes Built", subtitle: "Across Victoria" },
  { number: "15+", title: "Years Experience", subtitle: "Of craft" },
  { number: "98%", title: "Client Satisfaction", subtitle: "Verified" },
  { number: "50+", title: "Designs Available", subtitle: "Ready to build" },
];

function splitNumber(raw: string): { value: number; suffix: string } {
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return { value: 0, suffix: raw };
  return { value: parseInt(match[1], 10), suffix: match[2] };
}

function CountUp({ raw, active }: { raw: string; active: boolean }) {
  const { value, suffix } = splitNumber(raw);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) {
      setDisplay(0);
      return;
    }

    let frame: number;
    const duration = 1600;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo — snappier finish
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, value]);

  return (
    <span className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

function StatCell({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, magneticSpring);
  const springY = useSpring(mouseY, magneticSpring);
  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-6, 6]);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...softSpring, delay: index * 0.1 }}
      className="group relative px-6 py-12 text-center sm:px-8 sm:py-14"
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-4 rounded-2xl bg-[#0F1C2E]/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Top accent line */}
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-[#0F1C2E] to-transparent transition-transform duration-500 ease-out group-hover:scale-x-100" />

      {/* Index mark */}
      <motion.span
        className="mb-5 block text-[10px] font-medium uppercase tracking-[0.35em] text-[#0F1C2E]/30"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.15 + index * 0.1 }}
      >
        {String(index + 1).padStart(2, "0")}
      </motion.span>

      {/* Number — solid navy, always visible */}
      <motion.h3
        className="font-display text-5xl font-semibold tracking-tight text-[#0F1C2E] sm:text-6xl md:text-7xl"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ ...softSpring, delay: 0.08 + index * 0.1 }}
        style={{ transform: "translateZ(24px)" }}
      >
        <CountUp raw={stat.number} active={inView} />
      </motion.h3>

      {/* Title */}
      <motion.p
        className="mt-5 text-sm font-medium uppercase tracking-[0.28em] text-[#0F1C2E]/70"
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45, delay: 0.3 + index * 0.1 }}
      >
        {stat.title}
      </motion.p>

      {/* Subtitle */}
      {stat.subtitle && (
        <motion.p
          className="mt-2 text-xs tracking-wide text-[#0F1C2E]/40"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
        >
          {stat.subtitle}
        </motion.p>
      )}

      {/* Bottom pulse when active */}
      <motion.span
        className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#0F1C2E]/20"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
      />
    </motion.div>
  );
}

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="rh-section relative overflow-hidden bg-gradient-to-b from-[#F8F5F0] via-[#F5F0E6] to-[#F0EBE3] py-24 sm:py-28 md:py-32"
      style={{ perspective: 1200 }}
    >
      <div className="rh-orbs" aria-hidden="true">
        <div
          className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-c"
          style={{ top: "20%", left: "40%" }}
        />
        <div
          className="rh-orb rh-orb--navy rh-orb--lg rh-orb--drift-a"
          style={{ bottom: "-16%", right: "20%" }}
        />
      </div>
      {/* Ambient */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-[#0F1C2E]/[0.035] blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-[380px] w-[380px] rounded-full bg-[#1E2A44]/[0.04] blur-[140px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0F1C2E]/12 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6">
        {/* Header */}
        <motion.div
          className="mb-12 text-center sm:mb-16"
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-4 flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#0F1C2E]/35 sm:w-12" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#0F1C2E]/65 sm:text-xs sm:tracking-[0.45em]">
              The Portfolio
            </p>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#0F1C2E]/35 sm:w-12" />
          </div>

          <h2 className="font-display text-3xl tracking-tight text-[#0F1C2E] sm:text-4xl md:text-5xl">
            A Record That Speaks for Itself
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#0F1C2E]/50 sm:text-base">
            Numbers that reflect years of considered building and lasting client
            trust.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative overflow-hidden rounded-[1.75rem] border border-[#0F1C2E]/[0.08] bg-white/75 shadow-[0_30px_90px_rgba(15,28,46,0.07)] backdrop-blur-xl sm:rounded-[2rem]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0F1C2E]/10 to-transparent" />

          {/* Soft inner light */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[60%] -translate-x-1/2 rounded-full bg-[#F8F5F0]/80 blur-3xl" />

          <div className="relative grid divide-y divide-[#0F1C2E]/[0.07] md:grid-cols-4 md:divide-x md:divide-y-0">
            {stats.map((stat, index) => (
              <StatCell key={stat.title} stat={stat} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}