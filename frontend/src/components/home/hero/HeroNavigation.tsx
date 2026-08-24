"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { motion } from "framer-motion";
import { snappySpring } from "@/lib/spring";

type Slide = { id?: string; title: string };

type Props = {
  slides: Slide[];
  active: number;
  onChange: (index: number) => void;
  autoplayMs?: number;
  paused?: boolean;
  onTogglePause?: () => void;
};

export default function HeroNavigation({
  slides,
  active,
  onChange,
  autoplayMs = 9000,
  paused = false,
  onTogglePause,
}: Props) {
  if (!slides.length) return null;

  return (
    <div className="flex items-center gap-2.5 sm:gap-4">
      <button
        type="button"
        onClick={() => onChange((active - 1 + slides.length) % slides.length)}
        aria-label="Previous hero slide"
        className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C7A4]/25 bg-black/35 text-[#F8F5F0]/70 backdrop-blur-xl transition-all duration-300 hover:border-[#D8C7A4]/60 hover:bg-[#D8C7A4]/10 hover:text-[#F8F5F0] hover:shadow-[0_0_22px_-4px_rgba(216,199,164,0.55)] sm:h-11 sm:w-11"
      >
        <ChevronLeft
          size={15}
          strokeWidth={1.5}
          className="transition-transform duration-300 group-hover:-translate-x-0.5"
        />
        <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/5" />
      </button>

      <div className="hidden items-center gap-5 md:flex">
        {slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <button
              key={slide.id ?? index}
              type="button"
              onClick={() => onChange(index)}
              aria-label={`Go to slide ${index + 1}: ${slide.title}`}
              aria-current={isActive ? "true" : undefined}
              className="group flex items-center gap-2.5"
            >
              <span
                className={`text-[8px] font-medium tracking-[0.2em] transition-colors duration-500 ${
                  isActive ? "text-[#D8C7A4]" : "text-white/25 group-hover:text-white/55"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <span
                className={`relative h-px overflow-hidden transition-all duration-500 ${
                  isActive ? "w-14 bg-white/15 sm:w-16" : "w-6 bg-white/10"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="hero-nav-progress"
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#D8C7A4] to-[#F8F5F0]"
                    initial={{ width: "0%" }}
                    animate={{ width: paused ? "45%" : "100%" }}
                    transition={{
                      duration: paused ? 0.3 : autoplayMs / 1000,
                      ease: "linear",
                    }}
                  />
                )}
              </span>

              <span
                className={`hidden max-w-[11ch] truncate text-[8px] font-light tracking-wide lg:inline ${
                  isActive ? "text-white/60" : "text-white/20 group-hover:text-white/40"
                }`}
              >
                {slide.title}
              </span>
            </button>
          );
        })}
      </div>

      {onTogglePause && (
        <button
          type="button"
          onClick={onTogglePause}
          aria-label={paused ? "Resume hero slides" : "Pause hero slides"}
          className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C7A4]/25 bg-black/35 text-[#F8F5F0]/70 backdrop-blur-xl transition-all duration-300 hover:border-[#D8C7A4]/60 hover:bg-[#D8C7A4]/10 hover:text-[#F8F5F0] hover:shadow-[0_0_22px_-4px_rgba(216,199,164,0.55)] sm:h-11 sm:w-11"
        >
          {paused ? (
            <Play size={11} fill="currentColor" strokeWidth={1.5} />
          ) : (
            <Pause size={11} strokeWidth={1.5} />
          )}
          <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/5" />
        </button>
      )}

      <button
        type="button"
        onClick={() => onChange((active + 1) % slides.length)}
        aria-label="Next hero slide"
        className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C7A4]/25 bg-black/35 text-[#F8F5F0]/70 backdrop-blur-xl transition-all duration-300 hover:border-[#D8C7A4]/60 hover:bg-[#D8C7A4]/10 hover:text-[#F8F5F0] hover:shadow-[0_0_22px_-4px_rgba(216,199,164,0.55)] sm:h-11 sm:w-11"
      >
        <ChevronRight
          size={15}
          strokeWidth={1.5}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
        <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/5" />
      </button>

      <div className="ml-1 hidden items-baseline sm:flex">
        <span className="bg-gradient-to-b from-[#F8F5F0] to-[#D8C7A4]/70 bg-clip-text text-2xl font-extralight tracking-[-0.05em] text-transparent">
          {String(active + 1).padStart(2, "0")}
        </span>
        <span className="ml-1 text-[9px] text-[#F8F5F0]/25">
          / {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}