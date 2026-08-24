"use client";

/**
 * Premium glass filter shell used on /home-designs and /home-land.
 */

import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, Sparkles, X } from "lucide-react";
import { luxeEase } from "@/components/common/motion";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  onToggle: () => void;
  activeCount: number;
  onClear?: () => void;
  onApply?: () => void;
  children: ReactNode;
  trailing?: ReactNode;
  search?: ReactNode;
  variant?: "light" | "dark";
};

export default function AdvancedFilterBox({
  open,
  onToggle,
  activeCount,
  onClear,
  onApply,
  children,
  trailing,
  search,
  variant = "light",
}: Props) {
  const dark = variant === "dark";
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-4 rounded-[2rem] opacity-60 blur-2xl"
        style={{
          background: dark
            ? "radial-gradient(ellipse at 20% 0%, rgba(216,199,164,0.12), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(140,29,44,0.15), transparent 50%)"
            : "radial-gradient(ellipse at 20% 0%, rgba(216,199,164,0.18), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(140,29,44,0.08), transparent 50%)",
        }}
        aria-hidden
      />

      <div
        className={`relative overflow-hidden rounded-[1.75rem] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] ${
          dark ? "border border-white/12" : "border border-[#0A1628]/10"
        }`}
        style={{
          background: dark
            ? "linear-gradient(165deg, rgba(12,20,36,0.98) 0%, rgba(10,22,40,0.96) 50%, rgba(18,14,20,0.98) 100%)"
            : "linear-gradient(165deg, rgba(255,255,255,0.97) 0%, rgba(245,240,230,0.98) 48%, rgba(255,252,247,0.96) 100%)",
        }}
      >
        <div
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #D8C7A4 20%, #F5F0E6 50%, #D8C7A4 80%, transparent)",
          }}
        />

        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">{search}</div>

            <button
              type="button"
              onClick={onToggle}
              className={`group relative flex shrink-0 items-center gap-2.5 overflow-hidden rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                open
                  ? "bg-[#0A1628] text-[#F5F0E6] shadow-[0_12px_32px_-8px_rgba(10,22,40,0.55)]"
                  : "border border-[#0A1628]/12 bg-white/90 text-[#0A1628] hover:border-[#D8C7A4]/60 hover:shadow-md"
              }`}
            >
              <SlidersHorizontal size={15} className="opacity-90" />
              <span className="hidden sm:inline">Advanced</span>
              <span className="sm:hidden">Filter</span>
              {activeCount > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    open
                      ? "bg-[#D8C7A4] text-[#0A1628]"
                      : "bg-[#8C1D2C] text-white"
                  }`}
                >
                  {activeCount}
                </span>
              )}
            </button>

            {trailing}
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: luxeEase }}
                className="overflow-hidden"
              >
                <div className={`mt-5 border-t pt-5 ${dark ? "border-white/10" : "border-[#0A1628]/08"}`}>
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles size={14} className="text-[#D8C7A4]" />
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.28em] ${
                        dark ? "text-white/40" : "text-[#0A1628]/45"
                      }`}
                    >
                      Refine the collection
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {children}
                  </div>

                  <div
                    className={`mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4 ${
                      dark ? "border-white/10" : "border-[#0A1628]/08"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={onClear}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                        dark
                          ? "text-white/40 hover:text-white"
                          : "text-[#0A1628]/40 hover:text-[#8C1D2C]"
                      }`}
                    >
                      <X size={14} />
                      Clear all
                    </button>
                    <button
                      type="button"
                      onClick={onApply}
                      className="rounded-full px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0A1628] shadow-[0_10px_28px_-10px_rgba(216,199,164,0.7)] transition hover:-translate-y-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, #F5F0E6 0%, #D8C7A4 45%, #C4B090 100%)",
                      }}
                    >
                      Apply filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function SexyPageTitle({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
}) {
  return (
    <div className="relative max-w-4xl">
      <div
        className="absolute -inset-x-4 -inset-y-6 rounded-[2rem] sm:-inset-x-8 sm:-inset-y-8 sm:rounded-[2.5rem]"
        style={{
          background:
            "linear-gradient(145deg, rgba(10,22,40,0.72) 0%, rgba(10,22,40,0.42) 45%, rgba(140,29,44,0.18) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(216,199,164,0.18), 0 40px 80px -30px rgba(0,0,0,0.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-[#D8C7A4]/55" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-[#D8C7A4]/40" />

      <div className="relative px-5 py-6 sm:px-8 sm:py-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px w-12 bg-gradient-to-r from-[#D8C7A4] to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#D8C7A4]">
            {eyebrow}
          </p>
        </div>
        <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-[-0.035em] text-[#F8F5F0]">
          {title}
          {accent ? (
            <>
              <br />
              <span className="italic text-[#D8C7A4]">{accent}</span>
            </>
          ) : null}
        </h1>
        {description ? (
          <p className="mt-7 max-w-xl text-base leading-8 text-white/60 sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
