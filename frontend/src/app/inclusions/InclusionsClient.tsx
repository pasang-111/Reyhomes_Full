"use client";

import { useMemo, useState, useEffect } from "react";
import type { ComponentType } from "react";
import {
  Download,
  ExternalLink,
  FileArchive,
  FileText,
  ChefHat,
  Bath,
  Lightbulb,
  PanelsTopLeft,
  Home,
  Sofa,
  Trees,
  Sparkles,
  X,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Inclusion } from "@/lib/api/inclusions";
import { luxeEase } from "@/components/common/motion";

const TIER_LABELS: Record<string, string> = {
  all: "All tiers",
  standard: "Standard",
  signature: "Signature",
  atelier: "Atelier",
};

const CATEGORY_LABELS: Record<string, string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  electrical: "Electrical",
  flooring: "Flooring",
  facade: "Facade",
  living: "Living",
  exterior: "Exterior",
  other: "Other",
};

const CATEGORY_ICONS: Record<
  string,
  ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
> = {
  kitchen: ChefHat,
  bathroom: Bath,
  electrical: Lightbulb,
  flooring: PanelsTopLeft,
  facade: Home,
  living: Sofa,
  exterior: Trees,
  other: Sparkles,
};

/* High-quality cover images for each category */
const CATEGORY_COVERS: Record<string, string> = {
  kitchen:
    "https://images.unsplash.com/photo-1696986681606-b156ccd761c5?auto=format&fit=crop&w=800&q=80",
  bathroom:
    "https://images.unsplash.com/photo-1754788358645-d6e6cca12e25?auto=format&fit=crop&w=800&q=80",
  electrical:
    "https://images.unsplash.com/photo-1531762948975-73032b7b61f4?auto=format&fit=crop&w=800&q=80",
  flooring:
    "https://images.unsplash.com/photo-1635603498472-bd44fd7b0735?auto=format&fit=crop&w=800&q=80",
  facade:
    "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=800&q=80",
  living:
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
  exterior:
    "https://images.unsplash.com/photo-1706808849780-7a04fbac83ef?auto=format&fit=crop&w=800&q=80",
  other:
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
};

type Props = {
  inclusions: Inclusion[];
};

export default function InclusionsClient({ inclusions }: Props) {
  const [tier, setTier] = useState("all");
  const [active, setActive] = useState("all");
  const [selected, setSelected] = useState<Inclusion | null>(null);

  const categories = useMemo(() => {
    const set = new Set(inclusions.map((item) => item.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [inclusions]);

  // Public marketing fields only (title, tier, category, description, features, pdf).
  // Never surface supplier cost / internal pricing — those are not on the Inclusion type.
  const filtered = useMemo(() => {
    return inclusions.filter((item) => {
      const tierOk = tier === "all" || !item.tier || item.tier === tier;
      const catOk = active === "all" || item.category === active;
      return tierOk && catOk;
    });
  }, [inclusions, active, tier]);

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#0A1628]">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="rh-section relative overflow-hidden px-5 pb-20 pt-36 sm:px-8 lg:px-10 lg:pb-28 lg:pt-44">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#D8C7A4]/20 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-white/60 blur-[110px]" />
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-a"
            style={{ top: "-10%", left: "10%", opacity: 0.3 }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.45em] text-[#806D48]">
              The ReyHomes Standard
            </p>

            <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.035em] sm:text-6xl lg:text-8xl">
              Inclusions
              <span className="block text-[#0A1628]/25">Library.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-[#0A1628]/55 sm:text-lg">
              Explore the materials, finishes and specifications curated for our
              residential collection. Each volume documents the details that
              define the ReyHomes standard.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          TIER + CATEGORY FILTER
      ===================================================== */}
      <section className="sticky top-0 z-40 border-y border-[#0A1628]/08 bg-[#F5F0E6]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl space-y-3 px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex flex-wrap gap-2">
            {Object.entries(TIER_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTier(key)}
                className={`rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] transition ${
                  tier === key
                    ? "bg-[#D8C7A4] text-[#0C2A44]"
                    : "border border-[#0A1628]/12 text-[#0A1628]/55 hover:border-[#D8C7A4]/60 hover:text-[#0A1628]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((category) => {
              const label =
                category === "all"
                  ? "All Volumes"
                  : CATEGORY_LABELS[category] || category;
              const isActive = active === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActive(category)}
                  className={`shrink-0 rounded-full border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                    isActive
                      ? "border-[#0A1628] bg-[#0A1628] text-[#F5F0E6] shadow-lg"
                      : "border-[#0A1628]/10 bg-white/70 text-[#0A1628]/50 hover:border-[#0A1628]/25 hover:text-[#0A1628]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          LIBRARY
      ===================================================== */}
      <section className="rh-section py-20 sm:py-24 lg:py-32">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--navy rh-orb--lg rh-orb--drift-b"
            style={{ bottom: "-15%", right: "-10%", opacity: 0.2 }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-16 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#806D48]">
                Curated library
              </p>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl">
                Details matter.
              </h2>
            </div>

            <div className="hidden items-center gap-2 text-xs text-[#0A1628]/40 sm:flex">
              <FileArchive size={15} />
              {filtered.length} volumes
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-[32px] border border-[#0A1628]/08 bg-white/70 p-16 text-center">
              <FileText className="mx-auto opacity-30" size={36} />
              <p className="mt-5 text-[#0A1628]/45">
                No brochures are available in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-x-10 gap-y-24 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item, index) => {
                const typeLabel =
                  CATEGORY_LABELS[item.category] || item.category || "Inclusion";
                const Icon = CATEGORY_ICONS[item.category] || FileText;

                // Prefer item image if it exists, otherwise use category cover
                const coverUrl =
                  (item as any).image_url ||
                  (item as any).cover_url ||
                  (item as any).image ||
                  CATEGORY_COVERS[item.category] ||
                  CATEGORY_COVERS.other;

                return (
                  <article key={item.id} className="group">
                    {/* BOOK */}
                    <div className="relative mx-auto w-full max-w-[380px]">
                      {/* Soft shadow */}
                      <div className="absolute -bottom-7 left-[10%] right-[4%] h-10 rounded-[50%] bg-black/25 blur-2xl transition-all duration-700 group-hover:scale-110 group-hover:opacity-60" />

                      {/* Page edges */}
                      <div className="absolute inset-y-3 right-[-12px] w-[calc(100%-6px)] rounded-r-[12px] border-y border-r border-black/10 bg-[#d9d5cb]" />
                      <div className="absolute inset-y-2 right-[-7px] w-[calc(100%-6px)] rounded-r-[12px] border-y border-r border-black/10 bg-[#e6e2d9]" />

                      {/* Main Cover */}
                      <button
                        type="button"
                        onClick={() => item.pdf_url && setSelected(item)}
                        className="relative aspect-[0.72] w-full overflow-hidden rounded-[6px_18px_18px_6px] border border-black/15 bg-[#0A1628] text-left shadow-[14px_24px_50px_rgba(0,0,0,0.22)] transition-all duration-700 ease-out group-hover:-translate-x-1 group-hover:-translate-y-3 group-hover:rotate-[-1.5deg] group-hover:shadow-[22px_40px_70px_rgba(0,0,0,0.3)]"
                      >
                        {/* Cover Image */}
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                          style={{ backgroundImage: `url(${coverUrl})` }}
                        />

                        {/* Dark overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/50" />

                        {/* Gold accent light */}
                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#D8C7A4]/20 blur-[90px]" />

                        {/* Spine */}
                        <div className="absolute inset-y-0 left-0 w-[14px] bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

                        {/* Frames */}
                        <div className="absolute inset-5 rounded-[4px] border border-[#D8C7A4]/25" />
                        <div className="absolute inset-7 rounded-[3px] border border-white/10" />

                        {/* Content */}
                        <div className="relative flex h-full flex-col p-7 sm:p-8">
                          {/* Top */}
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[8px] font-semibold uppercase tracking-[0.35em] text-[#D8C7A4]">
                                ReyHomes
                              </p>
                              <p className="mt-1 text-[7px] uppercase tracking-[0.25em] text-white/40">
                                Residential Collection
                              </p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8C7A4]/30 bg-[#D8C7A4]/15">
                              <Icon size={16} strokeWidth={1.3} className="text-[#D8C7A4]" />
                            </div>
                          </div>

                          {/* Center title */}
                          <div className="my-auto">
                            <div className="mb-4 h-px w-12 bg-[#D8C7A4]" />
                            <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#D8C7A4]">
                              {typeLabel}
                            </p>
                            <h3 className="mt-3 font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl">
                              {item.title}
                            </h3>
                          </div>

                          {/* Bottom */}
                          <div className="flex items-end justify-between border-t border-white/15 pt-5">
                            <div>
                              <p className="text-[7px] uppercase tracking-[0.3em] text-white/35">
                                Inclusion Volume
                              </p>
                              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-white/75">
                                2026 Edition
                              </p>
                            </div>
                            <span className="text-[8px] uppercase tracking-[0.25em] text-[#D8C7A4]">
                              No. {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>
                        </div>

                        {/* Shine */}
                        <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-[40%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000 group-hover:left-[130%] group-hover:opacity-100" />
                      </button>
                    </div>

                    {/* Book info + actions */}
                    <div className="mx-auto mt-9 max-w-[380px]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#806D48]">
                            {typeLabel}
                          </p>
                          <h3 className="mt-2 font-display text-2xl text-[#0A1628]">
                            {item.title}
                          </h3>
                        </div>
                        <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#0A1628]/25">
                          PDF
                        </span>
                      </div>

                      {item.pdf_url ? (
                        <div className="mt-5 flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSelected(item)}
                            className="inline-flex items-center gap-2 rounded-full bg-[#0A1628] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0A1628]/90"
                          >
                            <Maximize2 size={13} />
                            Open Volume
                          </button>

                          <a
                            href={item.pdf_url}
                            download
                            className="inline-flex items-center gap-2 rounded-full border border-[#0A1628]/12 bg-white/70 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A1628] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0A1628]/25 hover:bg-white"
                          >
                            <Download size={13} />
                            Download
                          </a>
                        </div>
                      ) : (
                        <p className="mt-5 text-sm text-[#0A1628]/35">
                          This volume has not been published yet.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          CLOSING
      ===================================================== */}
      <section className="rh-section relative border-t border-[#0A1628]/08 bg-[#0A1628] px-5 py-24 text-[#F5F0E6] sm:px-8 lg:px-10 lg:py-32">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-c"
            style={{ top: "-15%", right: "5%" }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#D8C7A4]">
            The ReyHomes Standard
          </p>
          <h2 className="mt-5 max-w-3xl font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Designed around the details
            <span className="text-white/30">
              {" "}
              that make a home feel exceptional.
            </span>
          </h2>
        </div>
      </section>

      {/* =====================================================
          PDF DIALOG
      ===================================================== */}
      <AnimatePresence>
        {selected && selected.pdf_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#0A1628]/90 p-4 backdrop-blur-md sm:p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.35, ease: luxeEase }}
              className="relative flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[24px] bg-[#F5F0E6] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#0A1628]/08 px-5 py-4 sm:px-7">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#806D48]">
                    {CATEGORY_LABELS[selected.category] || selected.category}
                  </p>
                  <h3 className="mt-1 font-display text-xl text-[#0A1628] sm:text-2xl">
                    {selected.title}
                  </h3>
                  {selected.tier ? (
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#806D48]">
                      {TIER_LABELS[selected.tier] || selected.tier}
                    </p>
                  ) : null}
                  {selected.subtitle ? (
                    <p className="mt-2 text-sm text-[#0A1628]/60">{selected.subtitle}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={selected.pdf_url}
                    download
                    className="hidden items-center gap-2 rounded-full border border-[#0A1628]/12 bg-white px-4 py-2 text-xs font-medium text-[#0A1628] transition hover:border-[#0A1628]/25 sm:inline-flex"
                  >
                    <Download size={14} />
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1628]/08 text-[#0A1628] transition hover:bg-[#0A1628]/15"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Public detail (same fields as inclusionSection — no cost/pricing) */}
              {(selected.description || (selected.features && selected.features.length > 0)) && (
                <div className="border-b border-[#0A1628]/08 bg-[#F8F5F0] px-5 py-4 sm:px-6">
                  {selected.description ? (
                    <p className="text-sm leading-relaxed text-[#0A1628]/70">
                      {selected.description}
                    </p>
                  ) : null}
                  {selected.features && selected.features.length > 0 ? (
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {selected.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-[#0A1628]/80"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#806D48]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}

              {/* PDF Viewer */}
              <div className="relative flex-1 bg-[#e8e4db]">
                <iframe
                  src={`${selected.pdf_url}#toolbar=1&navpanes=0`}
                  title={selected.title}
                  className="h-full w-full"
                />
              </div>

              {/* Mobile download bar */}
              <div className="flex items-center justify-between border-t border-[#0A1628]/08 px-5 py-3 sm:hidden">
                <a
                  href={selected.pdf_url}
                  download
                  className="inline-flex items-center gap-2 rounded-full bg-[#0A1628] px-5 py-2.5 text-xs font-semibold text-white"
                >
                  <Download size={14} />
                  Download PDF
                </a>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-sm text-[#0A1628]/60"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}