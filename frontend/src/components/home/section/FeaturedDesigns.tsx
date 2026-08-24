"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import DesignCard from "./DesignCard";
import {
  Reveal,
  FloatGlow,
  luxeEase,
} from "@/components/common/motion";
import {
  STOREY_CATEGORIES,
  StoreyCategory,
} from "@/app/lib/filters";
import type { HomeDesignListItem } from "@/types/home";

const TABS: ("All" | StoreyCategory)[] = [
  "All",
  ...STOREY_CATEGORIES,
];

type Props = {
  designs: HomeDesignListItem[];
};

/**
 * Fallback image used only when the backend does not provide an image.
 * This does not require a file inside /public.
 */
const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1200"
      height="800"
      viewBox="0 0 1200 800"
    >
      <rect width="1200" height="800" fill="#0A1628"/>
      <text
        x="600"
        y="400"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#D8C7A4"
        font-family="Arial, sans-serif"
        font-size="42"
      >
        REY HOMES
      </text>
    </svg>
  `);

export default function FeaturedDesigns({
  designs: homeDesigns,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const [activeTab, setActiveTab] =
    useState<"All" | StoreyCategory>("All");

  const CARD_WIDTH = 592;

  /**
   * Filter designs according to the selected category.
   */
  const filteredDesigns =
    activeTab === "All"
      ? homeDesigns
      : homeDesigns.filter(
          (home) => home.category === activeTab
        );

  /**
   * Scroll carousel.
   */
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left:
        direction === "left"
          ? -CARD_WIDTH
          : CARD_WIDTH,
      behavior: "smooth",
    });
  };

  /**
   * Reset carousel whenever category changes.
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: 0,
        behavior: "auto",
      });
    }

    setActiveIndex(0);
  }, [activeTab]);

  /**
   * Track current carousel position.
   */
  useEffect(() => {
    const el = scrollRef.current;

    if (!el) return;

    const handleScroll = () => {
      setActiveIndex(
        Math.round(el.scrollLeft / CARD_WIDTH)
      );
    };

    el.addEventListener("scroll", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [activeTab]);

  return (
    <section className="rh-section relative overflow-hidden bg-gradient-to-b from-[#0A1420] via-[#0F1C2E] to-[#0A1420] pt-32 pb-40">
      {/* Soft animated silver/navy gradient orbs */}
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
          AMBIENT GLOWS
      ====================================================== */}

      <FloatGlow
        className="pointer-events-none absolute -left-32 top-0 h-[600px] w-[600px] rounded-full bg-[#F8F5F0]/[0.03] blur-[160px]"
        duration={18}
        x={30}
        y={20}
      />

      <FloatGlow
        className="pointer-events-none absolute -right-24 bottom-0 h-[520px] w-[520px] rounded-full bg-[#1E2A44]/[0.4] blur-[160px]"
        duration={22}
        x={-24}
        y={-16}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F8F5F0]/15 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <Reveal className="mb-16 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 flex items-center gap-4">
              <span className="h-px w-10 bg-gradient-to-r from-[#F8F5F0]/60 to-transparent" />

              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#F8F5F0]/70">
                Featured Designs
              </p>
            </div>

            <h2 className="max-w-3xl text-5xl font-light leading-tight text-[#F8F5F0] md:text-6xl">
              Discover Homes Designed
              <br />
              Around Your Lifestyle
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#F8F5F0]/55">
              Explore premium home designs created for
              modern Australian families with exceptional
              craftsmanship and timeless elegance.
            </p>
          </div>

          <Link
            href="/home-designs"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[#F8F5F0]/25 bg-[#F8F5F0]/5 px-8 py-4 text-center font-medium text-[#F8F5F0] backdrop-blur-md transition-colors duration-500 hover:text-[#0F1C2E]"
          >
            <span className="absolute inset-0 -translate-x-full bg-[#F8F5F0] transition-transform duration-500 ease-out group-hover:translate-x-0" />

            <span className="relative">
              View All Designs
            </span>
          </Link>
        </Reveal>

        {/* =====================================================
            CATEGORY TABS
        ====================================================== */}

        <Reveal
          delay={0.12}
          className="mb-14 flex flex-wrap gap-3"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative overflow-hidden rounded-full px-6 py-3 text-[13px] font-medium transition-all duration-500 ${
                activeTab === tab
                  ? "bg-[#F8F5F0] text-[#0F1C2E] shadow-[0_10px_28px_rgba(248,245,240,0.15)]"
                  : "bg-[#1E2A44]/60 text-[#F8F5F0]/70 shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:bg-[#1E2A44] hover:text-[#F8F5F0]"
              }`}
            >
              {tab}
            </button>
          ))}
        </Reveal>

        {/* =====================================================
            CAROUSEL
        ====================================================== */}

        <div className="relative">
          {/* LEFT ARROW */}

          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 z-20 hidden h-12 w-12 -translate-x-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#1E2A44] text-[#F8F5F0] shadow-[0_10px_30px_rgba(0,0,0,0.3)] ring-1 ring-[#F8F5F0]/10 transition-all duration-300 hover:-translate-y-[52%] hover:bg-[#F8F5F0] hover:text-[#0F1C2E] lg:flex"
          >
            <ChevronLeft size={18} />
          </button>

          {/* RIGHT ARROW */}

          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 z-20 hidden h-12 w-12 translate-x-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#1E2A44] text-[#F8F5F0] shadow-[0_10px_30px_rgba(0,0,0,0.3)] ring-1 ring-[#F8F5F0]/10 transition-all duration-300 hover:-translate-y-[52%] hover:bg-[#F8F5F0] hover:text-[#0F1C2E] lg:flex"
          >
            <ChevronRight size={18} />
          </button>

          {/* =====================================================
              DESIGNS
          ====================================================== */}

          {filteredDesigns.length > 0 ? (
            <>
              <div
                ref={scrollRef}
                className="no-scrollbar flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth pb-6"
              >
                {filteredDesigns.map((home, index) => {
                  /**
                   * Backend may return:
                   *
                   * baths: number
                   * baths: string
                   *
                   * DesignCard requires number.
                   */
                  const baths = Number(home.baths);

                  /**
                   * Backend may return:
                   *
                   * image: string
                   * image: null
                   * image: undefined
                   *
                   * DesignCard requires string.
                   */
                  const image =
                    home.image ??
                    home.hero_image_url ??
                    FALLBACK_IMAGE;

                  return (
                    <motion.div
                      key={home.id}
                      initial={{
                        opacity: 0,
                        y: 36,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.2,
                      }}
                      transition={{
                        duration: 0.7,
                        delay:
                          Math.min(index, 4) * 0.08,
                        ease: luxeEase,
                      }}
                      className="w-[560px] max-w-[86vw] flex-shrink-0 snap-center"
                    >
                      <DesignCard
                        id={home.id}
                        name={home.name}
                        slug={home.slug}
                        beds={home.beds}
                        baths={baths}
                        garage={home.garage}
                        image={image}
                        price={home.price}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* =================================================
                  PROGRESS INDICATORS
              ================================================== */}

              <div className="mt-10 flex justify-center gap-2">
                {filteredDesigns.map((_, index) => (
                  <div
                    key={index}
                    className={`h-[3px] rounded-full transition-all duration-500 ${
                      activeIndex === index
                        ? "w-12 bg-[#F8F5F0]"
                        : "w-3 bg-[#F8F5F0]/25"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : (
            /* ===================================================
               EMPTY STATE
            ==================================================== */

            <p className="py-16 text-center text-[#F8F5F0]/50">
              No designs found in this category yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}