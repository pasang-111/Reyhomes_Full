"use client";

import { Check, Download, ArrowRight } from "lucide-react";
import { HomeLandPackage } from "@/types/land";
import { inclusionLabel } from "@/types/home";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/motion";
import ReviewTrigger from "@/components/review/ReviewTrigger";

type Props = { land: HomeLandPackage };

export default function PackageInclusions({ land }: Props) {
  const inclusions =
    land.inclusions && land.inclusions.length > 0
      ? land.inclusions
      : [
          "Premium Site Costs Included",
          "Stone Kitchen Benchtops",
          "Designer Kitchen Appliances",
          "LED Downlights Throughout",
          "Quality Flooring Package",
          "Ducted Air Conditioning",
          "Driveway & Landscaping",
          "Fixed Price Contract",
        ];

  return (
    <section className="bg-[#0A1628] py-24 sm:py-32 text-[#F5F0E6]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal className="mb-16 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#D8C7A4]">
            Premium Inclusions
          </p>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl">
            Everything You Need
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/55">
            Our turnkey packages include premium finishes, quality craftsmanship and exceptional value.
          </p>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <RevealGroup className="grid grid-cols-2 gap-4" stagger={0.06}>
            {inclusions.map((item, i) => (
              <RevealItem key={typeof item === "object" ? item.id : i}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#D8C7A4]/40 hover:bg-white/[0.05] sm:p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D8C7A4]/15 text-[#D8C7A4]">
                    <Check size={18} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-sm font-medium leading-snug sm:text-base">{inclusionLabel(item)}</h3>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.15}>
            <div className="flex h-full flex-col justify-center rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-8 sm:p-12">
              <p className="text-[11px] uppercase tracking-[0.4em] text-[#D8C7A4]">
                Download Brochure
              </p>
              <h3 className="mt-4 font-display text-3xl sm:text-4xl">
                Explore Every Detail
              </h3>
              <p className="mt-6 text-base leading-7 text-white/60">
                View the complete specification, premium inclusions, floor plan options and available upgrades.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button className="inline-flex items-center justify-center gap-3 rounded-full bg-[#D8C7A4] px-7 py-3.5 text-sm font-semibold text-[#0A1628] transition hover:bg-[#E8D9B8]">
                  <Download size={17} />
                  Download Brochure
                </button>
                <button className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-7 py-3.5 text-sm transition hover:border-[#D8C7A4] hover:text-[#D8C7A4]">
                  Enquire Now
                  <ArrowRight size={17} />
                </button>
              </div>

              <p className="mt-8 text-xs leading-6 text-white/35">
                * Images are for illustrative purposes only. Inclusions may vary depending on estate and selected upgrades.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
            {land.slug ? (
          <div className="mt-10 flex justify-center">
            <ReviewTrigger kind="package" slug={land.slug} variant="dark" label="Review floor plan & inclusions" />
          </div>
        ) : null}
    </section>
  );
}