"use client";

import { motion } from "framer-motion";
import { snappySpring } from "@/lib/spring";

type Props = {
  total: number;
  active: number;
  onChange: (index: number) => void;
};

export default function HeroDots({ total, active, onChange }: Props) {
  if (total <= 1) return null;

  return (
    <div className="flex items-center gap-2.5" aria-label="Hero slide navigation">
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === active;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={isActive ? "true" : undefined}
            className="group relative flex h-7 items-center justify-center focus:outline-none"
          >
            <span
              className={`relative h-px overflow-hidden rounded-full transition-all duration-500 ${
                isActive
                  ? "w-12 bg-white/25"
                  : "w-5 bg-white/15 group-hover:w-7 group-hover:bg-white/30"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="hero-dot-progress"
                  className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#D8C7A4] to-[#F8F5F0]"
                  transition={snappySpring}
                />
              )}
            </span>
            {isActive && (
              <motion.span
                layoutId="hero-dot-glow"
                className="absolute -right-1 h-1.5 w-1.5 rounded-full bg-[#D8C7A4] shadow-[0_0_12px_rgba(216,199,164,0.85)]"
                transition={snappySpring}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}