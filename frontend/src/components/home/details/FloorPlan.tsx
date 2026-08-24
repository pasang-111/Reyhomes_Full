"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Expand, Download, Plus, Minus, X, FileText } from "lucide-react";
import type { HomeDesign } from "@/types/home";
import { Reveal, luxeEase } from "@/components/common/motion";
import { formatArea, formatMetres } from "@/lib/units";
import { API_BASE } from "@/lib/api/client";
import ReviewTrigger from "@/components/review/ReviewTrigger";

type Props = {
  home: HomeDesign;
};

function absUrl(url?: string | null) {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const base = (API_BASE || "").replace(/\/$/, "");

  return url.startsWith("/")
    ? `${base}${url}`
    : `${base}/${url}`;
}

export default function FloorPlan({ home }: Props) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);

  const planSrc = absUrl(
    home.floor_plan_url || home.floorplan || null
  );

  const packUrl = home.slug
    ? `${(API_BASE || "").replace(
        /\/$/,
        ""
      )}/api/designs/${encodeURIComponent(
        home.slug
      )}/review-pdf/`
    : "";

  const rows = [
    {
      label: "House size",
      value: formatArea(home.houseSize || home.house_size),
    },
    {
      label: "Land size",
      value: formatArea(home.land_size),
    },
    {
      label: "Width",
      value: formatMetres(home.width || home.frontage),
    },
    {
      label: "Length",
      value: formatMetres(home.length || home.depth),
    },
    {
      label: "Min. lot width",
      value: formatMetres(
        home.minLotWidth || home.min_lot_width
      ),
    },
  ].filter((r) => r.value && r.value !== "—");

  return (
    <section
      id="floorplan"
      className="scroll-mt-24 bg-white py-24 sm:py-32"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
        {/* LEFT CONTENT */}
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#806D48]">
            Floor plan
          </p>

          <h2 className="mt-4 font-display text-4xl text-[#0A1628] sm:text-5xl">
            Smart design.
            <br />
            Beautiful living.
          </h2>

          <p className="mt-6 max-w-md text-lg leading-8 text-[#0A1628]/60">
            Dimensions and plan for{" "}
            {home.name || home.title}. No account needed to
            view or download.
          </p>

          {/* DIMENSIONS */}
          <div className="mt-10 space-y-4">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex justify-between border-b border-[#0A1628]/10 pb-3"
              >
                <span className="text-[#0A1628]/50">
                  {row.label}
                </span>

                <strong className="text-[#0A1628]">
                  {row.value}
                </strong>
              </div>
            ))}

            <div className="flex justify-between border-b border-[#0A1628]/10 pb-3">
              <span className="text-[#0A1628]/50">
                Beds / baths / garage
              </span>

              <strong className="text-[#0A1628]">
                {home.beds} / {home.baths} / {home.garage}
              </strong>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-10 flex flex-wrap gap-3">
            {/* VIEW FLOOR PLAN */}
            {planSrc ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-3 rounded-full bg-[#0A1628] px-7 py-3.5 text-sm font-medium text-[#F5F0E6] transition hover:bg-[#0A1628]/90"
              >
                <Expand size={17} />
                View full floor plan
              </button>
            ) : null}

            {/* DESIGN PACK PDF */}
            {packUrl ? (
              <a
                href={packUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-[#0A1628]/20 px-7 py-3.5 text-sm font-medium text-[#0A1628] transition hover:border-[#D8C7A4] hover:text-[#806D48]"
              >
                <Download size={17} />
                Design pack PDF
              </a>
            ) : null}

            {/* REVIEW & SHARE */}
            {home.slug ? (
              <ReviewTrigger
                kind="design"
                slug={home.slug}
              />
            ) : null}
          </div>
        </Reveal>

        {/* FLOOR PLAN PREVIEW */}
        <Reveal delay={0.08}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#0A1628]/10 bg-[#F5F0E6]">
            {planSrc ? (
              <Image
                src={planSrc}
                alt={`${home.name} floor plan`}
                fill
                sizes="(max-width:768px) 100vw, 60vw"
                className="object-contain p-4"
                unoptimized
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-[#0A1628]/40">
                <FileText size={40} />

                <p className="text-sm">
                  Floor plan image coming soon
                </p>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* FULLSCREEN FLOOR PLAN MODAL */}
      <AnimatePresence>
        {open && planSrc && (
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0A1628]/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{
                scale: 0.96,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.98,
                opacity: 0,
              }}
              transition={{
                duration: 0.35,
                ease: luxeEase,
              }}
              className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-display text-xl text-[#0A1628]">
                  {home.name} — plan
                </p>

                <div className="flex items-center gap-2">
                  {/* ZOOM IN */}
                  <button
                    type="button"
                    onClick={() =>
                      setScale((s) =>
                        Math.min(3, s + 0.25)
                      )
                    }
                    className="rounded-full border border-[#0A1628]/15 p-2"
                    aria-label="Zoom in"
                  >
                    <Plus size={16} />
                  </button>

                  {/* ZOOM OUT */}
                  <button
                    type="button"
                    onClick={() =>
                      setScale((s) =>
                        Math.max(0.5, s - 0.25)
                      )
                    }
                    className="rounded-full border border-[#0A1628]/15 p-2"
                    aria-label="Zoom out"
                  >
                    <Minus size={16} />
                  </button>

                  {/* CLOSE */}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-[#0A1628]/15 p-2"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* LARGE FLOOR PLAN */}
              <Image
                src={planSrc}
                alt=""
                width={1400}
                height={1800}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                }}
                className="mx-auto h-auto max-w-full transition-transform duration-300"
                unoptimized
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
