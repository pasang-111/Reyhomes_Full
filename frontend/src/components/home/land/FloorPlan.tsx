"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Expand, Download, Plus, Minus, X } from "lucide-react";
import { HomeLandPackage } from "@/types/land";
import { Reveal } from "@/components/common/motion";
import ReviewTrigger from "@/components/review/ReviewTrigger";

type Props = { pkg: HomeLandPackage };

export default function FloorPlan({ pkg }: Props) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);

  // Safe access for optional study field
  const bedroomsLabel = `${pkg.beds}${(pkg as any).study ? " + Study" : ""}`;

  // Use only the typed property
  const floorPlanSrc = pkg.floorPlan || pkg.floor_plan_url || "/placeholder-floorplan.jpg";

  return (
    <section className="bg-[#F5F0E6] py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#806D48]">
            Floor Plan
          </p>
          <h2 className="mt-4 font-display text-4xl text-[#0A1628] sm:text-5xl">
            Smart Design.<br />Perfect for Living.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-[#0A1628]/60">
            This {pkg.title} package includes a thoughtfully designed floor plan that maximises space, light and everyday comfort.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { label: "House Size", value: pkg.houseSize },
              { label: "Land Size", value: pkg.landSize },
              { label: "Frontage", value: pkg.frontage || "—" },
              { label: "Bedrooms", value: bedroomsLabel },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between border-b border-[#0A1628]/10 pb-3"
              >
                <span className="text-[#0A1628]/50">{row.label}</span>
                <strong className="text-[#0A1628]">{row.value}</strong>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-3 rounded-full bg-[#0A1628] px-7 py-3.5 text-sm font-medium text-[#F5F0E6] transition hover:bg-[#0A1628]/90"
            >
              <Expand size={17} /> View Full Floor Plan
            </button>
            <button className="inline-flex items-center gap-3 rounded-full border border-[#0A1628]/20 px-7 py-3.5 text-sm font-medium text-[#0A1628] transition hover:border-[#D8C7A4] hover:text-[#806D48]">
              <Download size={17} /> Download PDF
            </button>
            {pkg.slug ? (
              <ReviewTrigger kind="package" slug={pkg.slug} variant="light" />
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <button onClick={() => setOpen(true)} className="group relative w-full">
            <div className="overflow-hidden rounded-[28px] border border-[#0A1628]/08 bg-white p-6 shadow-xl transition group-hover:shadow-2xl">
              <div className="relative aspect-[16/13]">
                <Image
                  src={floorPlanSrc}
                  alt={`${pkg.title} Floor Plan`}
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
            </div>
            <div className="absolute -bottom-5 left-6 flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm text-[#0A1628]/70 shadow-lg">
              <Expand size={16} /> Click to enlarge
            </div>
          </button>
        </Reveal>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-[#0A1628]/96 p-4 sm:p-6"
            onClick={() => setOpen(false)}
          >
            <div
              className="mb-4 flex items-center justify-between text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-medium">{pkg.title} — Floor Plan</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-white/10"
              >
                <X size={24} />
              </button>
            </div>

            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div style={{ scale }} className="origin-center">
                <Image
                  src={floorPlanSrc}
                  alt=""
                  width={1600}
                  height={1000}
                  className="max-h-[78vh] w-auto object-contain"
                  unoptimized
                  priority
                />
              </motion.div>
            </div>

            <div
              className="mt-5 flex items-center justify-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                className="rounded-full bg-white p-3 shadow-lg"
              >
                <Minus size={20} />
              </button>
              <button
                onClick={() => setScale(1)}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold shadow-lg"
              >
                Reset
              </button>
              <button
                onClick={() => setScale((s) => Math.min(3.5, s + 0.25))}
                className="rounded-full bg-white p-3 shadow-lg"
              >
                <Plus size={20} />
              </button>
              <span className="ml-3 text-sm text-white/70">
                {Math.round(scale * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}