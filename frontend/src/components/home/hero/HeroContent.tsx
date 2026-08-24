"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useSpring, LayoutGroup } from "framer-motion";
import { softSpring, magneticSpring } from "@/lib/spring";

type Props = {
  title: string;
  subtitle: string;
  href: string;
  button: string;
  isActive: boolean;
  reduceMotion: boolean;
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: softSpring,
  },
};

function MagneticButton({
  href,
  children,
  variant,
  reduceMotion,
}: {
  href: string;
  children: React.ReactNode;
  variant: "solid" | "glass";
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, magneticSpring);
  const springY = useSpring(y, magneticSpring);

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.22);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.22);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    variant === "solid"
      ? "border border-[#D8C7A4]/60 bg-gradient-to-b from-[#F8F5F0] to-[#EFE7D8] text-[#0F1C2E] shadow-[0_18px_50px_-16px_rgba(216,199,164,0.55)] hover:shadow-[0_22px_60px_-14px_rgba(216,199,164,0.7)]"
      : "border border-[#F8F5F0]/20 bg-black/25 text-[#F8F5F0]/90 backdrop-blur-xl hover:border-[#D8C7A4]/50 hover:bg-white/[0.08]";

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
      layout
      className={`group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-500 hover:-translate-y-0.5 ${base}`}
    >
      <span className="relative z-10">{children}</span>
      <ArrowUpRight
        size={13}
        strokeWidth={1.8}
        className="relative z-10 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
      {variant === "solid" && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      )}
    </motion.a>
  );
}

export default function HeroContent({
  title,
  subtitle,
  href,
  button,
  isActive,
  reduceMotion,
}: Props) {
  return (
    <LayoutGroup>
      <motion.div
        variants={container}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="max-w-4xl"
      >
        <motion.div variants={item} className="mb-4 flex items-center gap-3 sm:mb-5">
          <span className="h-px w-7 bg-gradient-to-r from-[#D8C7A4] to-transparent sm:w-10" />
          <span className="text-[8px] font-medium uppercase tracking-[0.42em] text-[#D8C7A4]/90 sm:text-[9px]">
            ReyHomes · Bespoke Living
          </span>
        </motion.div>

        <motion.h1
          layout
          variants={item}
          className="max-w-4xl font-serif text-[clamp(2.35rem,4.6vw,5.25rem)] font-extralight leading-[0.98] tracking-[-0.03em] text-[#F8F5F0]"
        >
          {title}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-4 max-w-lg text-[clamp(0.85rem,1vw,1rem)] font-light leading-[1.75] tracking-wide text-[#F8F5F0]/55 sm:mt-5"
        >
          {subtitle}
        </motion.p>

        <motion.div variants={item} className="mt-6 flex flex-wrap gap-2.5 sm:mt-8">
          <MagneticButton href={href} variant="solid" reduceMotion={reduceMotion}>
            {button}
          </MagneticButton>
          <MagneticButton href="/contact" variant="glass" reduceMotion={reduceMotion}>
            Private Consultation
          </MagneticButton>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-6 flex items-center gap-2.5 text-[8px] uppercase tracking-[0.32em] text-[#D8C7A4]/45"
        >
          <span className="h-1 w-1 rounded-full bg-[#D8C7A4]" />
          Architecture · Craft · Legacy
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}