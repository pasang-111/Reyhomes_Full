"use client";

/**
 * Left-column advanced filter panel (desktop sticky).
 * Always expanded on lg+; collapsible drawer on mobile.
 */

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X, Sparkles } from "lucide-react";
import { luxeEase } from "@/components/common/motion";

type Props = {
  children: ReactNode;
  activeCount: number;
  onClear: () => void;
  onApply?: () => void;
  variant?: "light" | "dark";
  search?: ReactNode;
  /** Extra tools under search (sort, view toggle) */
  tools?: ReactNode;
};

export default function FilterSidebar({
  children,
  activeCount,
  onClear,
  onApply,
  variant = "light",
  search,
  tools,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dark = variant === "dark";

  const panel = (
    <div
      className={`overflow-hidden rounded-[1.5rem] border shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] ${
        dark ? "border-white/10" : "border-[#0A1628]/10"
      }`}
      style={{
        background: dark
          ? "linear-gradient(165deg, rgba(12,20,36,0.98), rgba(10,22,40,0.95))"
          : "linear-gradient(165deg, #fff 0%, #F5F0E6 55%, #FFFCFA 100%)",
      }}
    >
      <div
        className="h-[2px] w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, #D8C7A4 25%, #F5F0E6 50%, #D8C7A4 75%, transparent)",
        }}
      />
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#D8C7A4]" />
            <p
              className={`text-[10px] font-semibold uppercase tracking-[0.28em] ${
                dark ? "text-white/45" : "text-[#0A1628]/45"
              }`}
            >
              Filters
            </p>
          </div>
          {activeCount > 0 && (
            <span className="rounded-full bg-[#8C1D2C] px-2 py-0.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>

        {search && <div className="mb-4">{search}</div>}
        {tools && <div className="mb-5">{tools}</div>}

        <div className="flex flex-col gap-4">{children}</div>

        <div
          className={`mt-6 flex flex-col gap-2 border-t pt-4 ${
            dark ? "border-white/10" : "border-[#0A1628]/08"
          }`}
        >
          <button
            type="button"
            onClick={onApply}
            className="w-full rounded-full py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0A1628] transition hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(135deg, #F5F0E6 0%, #D8C7A4 50%, #C4B090 100%)",
            }}
          >
            Apply
          </button>
          <button
            type="button"
            onClick={onClear}
            className={`w-full py-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${
              dark ? "text-white/40 hover:text-white" : "text-[#0A1628]/40 hover:text-[#8C1D2C]"
            }`}
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
            dark
              ? "border border-white/15 bg-white/5 text-white"
              : "border border-[#0A1628]/12 bg-white text-[#0A1628]"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-[#8C1D2C] px-2 py-0.5 text-[10px] text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
        {panel}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[9200] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              aria-label="Close filters"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: luxeEase }}
              className="absolute bottom-0 left-0 top-0 w-[min(100%,360px)] overflow-y-auto p-4"
            >
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-white/10 p-2 text-white"
                >
                  <X size={18} />
                </button>
              </div>
              {panel}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="mt-4 w-full rounded-full bg-[#D8C7A4] py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0A1628]"
              >
                Show results
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
