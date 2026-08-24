"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import PackageCard from "./PackageCard";
import {
  Reveal,
  FloatGlow,
  luxeEase,
} from "@/components/common/motion";

import type { HomeLandPackage } from "@/types/land";

type Props = {
  packages: HomeLandPackage[];
};

const CARD_WIDTH = 460 + 32; // card width + gap-8

export default function HomeLandPackages({
  packages,
}: Props) {
  const [activeCategory, setActiveCategory] =
    useState<string>("All");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const categories = [
    "All",
    ...Array.from(
      new Set(
        packages
          .map((pkg) => pkg.category)
          .filter(Boolean)
      )
    ),
  ];

  const filteredPackages =
    activeCategory === "All"
      ? packages
      : packages.filter(
          (pkg) => pkg.category === activeCategory
        );

  /**
   * Scroll the package row by one card.
   */
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -CARD_WIDTH : CARD_WIDTH,
      behavior: "smooth",
    });
  };

  /**
   * Reset the row whenever the category changes.
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
    setActiveIndex(0);
  }, [activeCategory]);

  /**
   * Track the current scroll position for the progress dots.
   */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      setActiveIndex(Math.round(el.scrollLeft / CARD_WIDTH));
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [activeCategory]);

  return (
    <section className="rh-section relative overflow-hidden bg-gradient-to-b from-white via-[#FDF4F4] to-white pt-32 pb-40">
      {/* Soft animated blush/red gradient orbs */}
      <div className="rh-orbs" aria-hidden="true">
        <div
          className="rh-orb rh-orb--silver rh-orb--lg rh-orb--drift-a"
          style={{ top: "-12%", left: "-8%" }}
        />
        <div
          className="rh-orb rh-orb--navy rh-orb--md rh-orb--drift-b"
          style={{ bottom: "-14%", right: "-6%" }}
        />
      </div>

      {/* =====================================================
          AMBIENT GLOWS — warm red pooling light, on white
      ====================================================== */}

      <FloatGlow
        className="pointer-events-none absolute -left-32 top-0 h-[600px] w-[600px] rounded-full bg-[#B3202F]/[0.07] blur-[160px]"
        duration={18}
        x={30}
        y={20}
      />

      <FloatGlow
        className="pointer-events-none absolute -right-24 bottom-0 h-[520px] w-[520px] rounded-full bg-[#7A1220]/[0.06] blur-[160px]"
        duration={22}
        x={-24}
        y={-16}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B3202F]/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <Reveal className="mb-16 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 flex items-center gap-4">
              <span className="h-px w-10 bg-gradient-to-r from-[#B3202F]/70 to-transparent" />

              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#B3202F]">
                Home &amp; Land Packages
              </p>
            </div>

            <h2 className="max-w-3xl font-display text-5xl font-light leading-tight text-[#1A1013] md:text-6xl">
              Complete Living.
              <br />
              Beautifully Planned.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#1A1013]/55">
              Discover carefully selected home and land packages
              designed to make premium family living simple,
              seamless and achievable.
            </p>
          </div>

          <Link
            href="/home-land-packages"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[#B3202F]/30 bg-[#B3202F]/5 px-8 py-4 text-center font-medium text-[#B3202F] backdrop-blur-md transition-colors duration-500 hover:text-white"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-[#B3202F] to-[#7A1220] transition-transform duration-500 ease-out group-hover:translate-x-0" />

            <span className="relative flex items-center gap-2">
              View All Packages
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </Link>
        </Reveal>

        {/* =====================================================
            CATEGORY TABS
        ====================================================== */}

        {categories.length > 1 && (
          <Reveal delay={0.12} className="mb-14 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`relative overflow-hidden rounded-full px-6 py-3 text-[13px] font-medium transition-all duration-500 ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-[#B3202F] to-[#7A1220] text-white shadow-[0_10px_28px_rgba(179,32,47,0.25)]"
                    : "bg-[#B3202F]/[0.05] text-[#1A1013]/60 shadow-[0_6px_20px_rgba(179,32,47,0.06)] hover:bg-[#B3202F]/10 hover:text-[#1A1013]"
                }`}
              >
                {category}
              </button>
            ))}
          </Reveal>
        )}

        {/* =====================================================
            CAROUSEL
        ====================================================== */}

        <div className="relative">
          {/* LEFT ARROW */}

          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 z-20 hidden h-12 w-12 -translate-x-6 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#B3202F] shadow-[0_10px_30px_rgba(179,32,47,0.15)] ring-1 ring-[#B3202F]/20 transition-all duration-300 hover:-translate-y-[52%] hover:bg-gradient-to-r hover:from-[#B3202F] hover:to-[#7A1220] hover:text-white lg:flex"
          >
            <ChevronLeft size={18} />
          </button>

          {/* RIGHT ARROW */}

          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 z-20 hidden h-12 w-12 translate-x-6 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#B3202F] shadow-[0_10px_30px_rgba(179,32,47,0.15)] ring-1 ring-[#B3202F]/20 transition-all duration-300 hover:-translate-y-[52%] hover:bg-gradient-to-r hover:from-[#B3202F] hover:to-[#7A1220] hover:text-white lg:flex"
          >
            <ChevronRight size={18} />
          </button>

          {/* =====================================================
              PACKAGES
          ====================================================== */}

          {filteredPackages.length > 0 ? (
            <>
              <div
                ref={scrollRef}
                className="no-scrollbar flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth pb-6"
              >
                {filteredPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.7,
                      delay: Math.min(index, 4) * 0.08,
                      ease: luxeEase,
                    }}
                    className="w-[86vw] max-w-[420px] flex-shrink-0 snap-center sm:w-[420px] lg:w-[460px]"
                  >
                    {/*
                      PackageCard carries its own hover treatment
                      (ambient glow, hairline sweep, corner marks) —
                      it's the display case here, so this wrapper
                      only handles entrance and layout.
                    */}
                    <PackageCard
                      {...pkg}
                      suburb={pkg.suburb ?? "—"}
                    />
                  </motion.div>
                ))}
              </div>

              {/* =================================================
                  PROGRESS INDICATORS
              ================================================== */}

              <div className="mt-10 flex justify-center gap-2">
                {filteredPackages.map((_, index) => (
                  <div
                    key={index}
                    className={`h-[3px] rounded-full transition-all duration-500 ${
                      activeIndex === index
                        ? "w-12 bg-gradient-to-r from-[#B3202F] to-[#7A1220]"
                        : "w-3 bg-[#B3202F]/20"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : (
            /* ===================================================
               EMPTY STATE
            ==================================================== */

            <Reveal className="mt-4">
              <div className="rounded-[28px] border border-[#B3202F]/15 bg-white px-6 py-16 text-center shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-[#B3202F]">
                  Coming Soon
                </p>

                <h3 className="mt-3 font-display text-2xl text-[#1A1013] sm:text-3xl">
                  No packages available
                </h3>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#1A1013]/55 sm:text-base">
                  We currently don't have any home and land
                  packages available in this category.
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </section>
  );
}