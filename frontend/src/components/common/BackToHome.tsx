"use client";

import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";

type BackToHomeProps = {
  label?: string;
};

export default function BackToHome({
  label = "Back to Home",
}: BackToHomeProps) {
  return (
    <div className="fixed right-5 top-5 z-[100000] sm:right-8 sm:top-8">
      <Link
        href="/"
        aria-label={label}
        className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[#07111f]/90 text-[#F8F5F0] shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-500 hover:w-[220px] hover:border-[#D8C7A4]/60 hover:bg-[#0b1726]/95 sm:h-[72px] sm:w-[72px]"
      >
        {/* Ambient glow */}
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,199,164,0.16),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* X icon */}
        <span className="absolute flex items-center justify-center transition-all duration-500 group-hover:-translate-x-20 group-hover:rotate-90 group-hover:opacity-0">
          <X
            size={28}
            strokeWidth={1.2}
          />
        </span>

        {/* Back to home content */}
        <span className="absolute flex translate-x-10 items-center gap-3 whitespace-nowrap opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C7A4]/30 bg-[#D8C7A4]/10">
            <ArrowLeft
              size={18}
              className="text-[#D8C7A4]"
              strokeWidth={1.5}
            />
          </span>

          <span className="flex flex-col text-left">
            <span className="text-[8px] uppercase tracking-[0.3em] text-white/40">
              ReyHomes
            </span>

            <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F8F5F0]">
              {label}
            </span>
          </span>
        </span>
      </Link>

      {/* Decorative line */}
      <div className="absolute right-0 top-full mt-3 h-px w-16 origin-right scale-x-50 bg-gradient-to-l from-[#D8C7A4]/50 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
    </div>
  );
}