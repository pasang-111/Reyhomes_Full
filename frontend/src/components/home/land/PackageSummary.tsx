"use client";

import {
  BedDouble,
  Bath,
  CarFront,
  Home,
  Map,
  ArrowRight,
} from "lucide-react";
import { HomeLandPackage } from "@/types/land";

type Props = {
  land: HomeLandPackage;
};

export default function PackageSummary({ land }: Props) {
  return (
    <section className="bg-[#F8F6F3] py-20 sm:py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-12 text-center sm:mb-16 md:mb-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8C1D2C] sm:text-xs sm:tracking-[0.45em]">
            Package Overview
          </p>

          <h2 className="mt-4 font-display text-3xl text-neutral-900 sm:mt-5 sm:text-4xl md:text-5xl">
            Luxury Home & Land Package
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:mt-6 sm:text-lg sm:leading-8">
            Carefully designed to deliver exceptional value with premium
            inclusions, quality finishes and contemporary family living.
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid gap-5 sm:gap-6 md:gap-8 lg:grid-cols-3">

          {/* Price */}
          <div className="rounded-[24px] bg-gradient-to-br from-[#8C1D2C] to-[#2C4870] p-6 text-white shadow-2xl sm:rounded-[34px] sm:p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70 sm:text-sm sm:tracking-[0.35em]">
              Package From
            </p>

            <h2 className="mt-4 break-words font-display text-3xl sm:mt-5 sm:text-4xl md:text-6xl">
              {land.price ?? "—"}
            </h2>

            <p className="mt-4 text-sm leading-6 text-white/80 sm:mt-6 sm:text-base sm:leading-8">
              Fixed-price turnkey package including premium inclusions
              and professional site preparation.
            </p>

            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-105 sm:mt-8 sm:w-auto sm:gap-3 sm:px-6 sm:py-3.5 sm:text-base md:mt-10 md:px-7 md:py-4"
            >
              Enquire Now
              <ArrowRight
                size={16}
                className="sm:h-[18px] sm:w-[18px]"
              />
            </button>
          </div>

          {/* Specifications */}
          <div className="rounded-[24px] border border-neutral-200 bg-white p-6 shadow-sm sm:rounded-[34px] sm:p-8 md:p-10">
            <h3 className="font-display text-xl text-neutral-900 sm:text-2xl md:text-3xl">
              Home Features
            </h3>

            <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5 md:mt-10 md:space-y-7">
              <Spec
                icon={<BedDouble size={20} />}
                title="Bedrooms"
                value={land.beds ?? "—"}
              />

              <Spec
                icon={<Bath size={20} />}
                title="Bathrooms"
                value={land.baths ?? "—"}
              />

              <Spec
                icon={<CarFront size={20} />}
                title="Garage"
                value={land.garage ?? "—"}
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="rounded-[24px] border border-neutral-200 bg-white p-6 shadow-sm sm:rounded-[34px] sm:p-8 md:p-10">
            <h3 className="font-display text-xl text-neutral-900 sm:text-2xl md:text-3xl">
              Dimensions
            </h3>

            <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5 md:mt-10 md:space-y-7">
              <Spec
                icon={<Map size={20} />}
                title="Land Size"
                value={land.landSize ?? "—"}
              />

              <Spec
                icon={<Home size={20} />}
                title="House Size"
                value={land.houseSize ?? "—"}
              />

              {land.frontage && (
                <Spec
                  icon={<Map size={20} />}
                  title="Frontage"
                  value={land.frontage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Spec({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-4 sm:pb-5">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8C1D2C]/10 text-[#8C1D2C] sm:h-12 sm:w-12">
          {icon}
        </div>

        <span className="truncate text-sm text-neutral-600 sm:text-base">
          {title}
        </span>
      </div>

      <span className="shrink-0 text-right text-base font-semibold text-neutral-900 sm:text-lg md:text-xl">
        {value}
      </span>
    </div>
  );
}