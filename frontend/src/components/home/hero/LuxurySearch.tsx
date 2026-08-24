"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronDown,
  ArrowRight,
  AlertCircle,
  SlidersHorizontal,
  MapPin,
  Bath,
  Search,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { HomeDesignListItem } from "@/types/home";
import type { HomeLandPackageListItem } from "@/types/land";
import { expandSpring, softSpring, magneticSpring } from "@/lib/spring";

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */
const currency = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const parsePrice = (price: string): number =>
  Number(price.replace(/[^0-9.]/g, "")) || 0;

type PriceBracket = { label: string; min: number; max: number };

const DESIGN_PRICE_BRACKETS: PriceBracket[] = [
  { label: "Under $450k", min: 0, max: 450000 },
  { label: "$450k – $550k", min: 450000, max: 550000 },
  { label: "Above $550k", min: 550000, max: Infinity },
];

function buildPriceBrackets(prices: number[]): PriceBracket[] {
  if (prices.length === 0) return [];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return [{ label: currency.format(min), min, max }];

  const step = (max - min) / 3;
  return Array.from({ length: 3 }, (_, i) => {
    const bMin = Math.round(min + step * i);
    const bMax = i === 2 ? max : Math.round(min + step * (i + 1));
    return {
      label: `${currency.format(bMin)} – ${currency.format(bMax)}`,
      min: bMin,
      max: bMax,
    };
  });
}

type Filters = {
  bedrooms: string;
  baths: string;
  category: string;
  priceIndex: string;
  location: string;
};

const EMPTY_FILTERS: Filters = {
  bedrooms: "",
  baths: "",
  category: "",
  priceIndex: "",
  location: "",
};

type Props = {
  designs: HomeDesignListItem[];
  packages: HomeLandPackageListItem[];
};

export default function LuxurySearch({
  designs: homeDesigns,
  packages: homeLandPackages,
}: Props) {
  const router = useRouter();
  const islandRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"designs" | "land">("designs");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [expanded, setExpanded] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showError, setShowError] = useState(false);

  /* -------------------------------------------------------
     PARALLAX (mouse) — hooks must stay at top level
  ------------------------------------------------------- */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, magneticSpring);
  const springY = useSpring(mouseY, magneticSpring);

  const rotateX = useTransform(springY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);
  const glowX = useTransform(springX, [-0.5, 0.5], ["30%", "70%"]);
  const glowY = useTransform(springY, [-0.5, 0.5], ["30%", "70%"]);

  // ✅ Fixed: useTransform called at top level, not inside JSX
  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(420px circle at ${x} ${y}, rgba(248,245,240,0.08), transparent 65%)`
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!islandRef.current || expanded) return;
    const rect = islandRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  /* -------------------------------------------------------
     OUTSIDE CLICK + ESC
  ------------------------------------------------------- */
  useEffect(() => {
    if (!expanded) return;
    const handleOutside = (e: MouseEvent) => {
      if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setAdvancedOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [expanded]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setExpanded(false);
        setAdvancedOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    setFilters(EMPTY_FILTERS);
    setShowError(false);
  }, [activeTab]);

  /* -------------------------------------------------------
     DERIVED DATA
  ------------------------------------------------------- */
  const categories = useMemo(() => {
    if (activeTab === "designs") {
      return [...new Set(homeDesigns.map((d) => d.category))];
    }
    return [
      ...new Set(homeLandPackages.map((p) => p.estate_name).filter(Boolean)),
    ] as string[];
  }, [activeTab, homeDesigns, homeLandPackages]);

  const locations = useMemo(() => {
    if (activeTab === "land") {
      return [...new Set(homeLandPackages.map((p) => p.suburb))];
    }
    return [];
  }, [activeTab, homeLandPackages]);

  const bedroomOptions = useMemo(() => {
    const beds =
      activeTab === "designs"
        ? homeDesigns.map((d) => d.beds)
        : homeLandPackages.map((p) => p.beds);
    return [...new Set(beds)].sort((a, b) => a - b);
  }, [activeTab, homeDesigns, homeLandPackages]);

  const bathOptions = useMemo(() => {
    const baths =
      activeTab === "designs"
        ? homeDesigns.map((d) => Number(d.baths) || 0)
        : homeLandPackages.map((p) => Number(p.baths) || 0);
    return [...new Set(baths)].sort((a, b) => a - b);
  }, [activeTab, homeDesigns, homeLandPackages]);

  const priceBrackets = useMemo(() => {
    if (activeTab === "designs") return DESIGN_PRICE_BRACKETS;
    return buildPriceBrackets(homeLandPackages.map((p) => parsePrice(p.price)));
  }, [activeTab, homeLandPackages]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (showError) setShowError(false);
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  const handleFilter = () => {
    if (activeCount === 0) {
      setShowError(true);
      return;
    }
    setShowError(false);
    const params = new URLSearchParams();

    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
    if (filters.baths) params.set("baths", filters.baths);
    if (filters.category) params.set("category", filters.category);
    if (filters.location) {
      params.set(activeTab === "land" ? "suburb" : "location", filters.location);
    }
    if (filters.priceIndex !== "") {
      const bracket = priceBrackets[Number(filters.priceIndex)];
      if (bracket) {
        params.set("minPrice", String(bracket.min));
        if (bracket.max !== Infinity) params.set("maxPrice", String(bracket.max));
      }
    }

    const path = activeTab === "designs" ? "/home-designs" : "/home-land";
    const query = params.toString();
    router.push(query ? `${path}?${query}` : path);
    setExpanded(false);
    setAdvancedOpen(false);
  };

  const resetSearch = () => {
    setFilters(EMPTY_FILTERS);
    setShowError(false);
  };

  const selectedBedrooms = filters.bedrooms
    ? `${filters.bedrooms}+ Beds`
    : "Any Beds";
  const selectedCategory =
    filters.category || (activeTab === "designs" ? "Any Style" : "Any Estate");
  const selectedBudget =
    filters.priceIndex !== ""
      ? priceBrackets[Number(filters.priceIndex)]?.label || "Any Price"
      : "Any Price";

  return (
    <div
      ref={islandRef}
      className="relative z-30 w-full max-w-5xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1200 }}
    >
      <motion.div
        layout
        initial={false}
        animate={{
          width: expanded ? "100%" : "min(560px, 100%)",
          borderRadius: expanded ? 28 : 999,
        }}
        transition={expandSpring}
        style={{
          rotateX: expanded ? 0 : rotateX,
          rotateY: expanded ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`luxury-search-shell relative overflow-hidden border ${
          showError ? "border-[#F8F5F0]/40" : "border-[#F8F5F0]/12"
        }`}
      >
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(15,28,46,0.97) 0%, rgba(10,20,32,0.96) 45%, rgba(8,14,24,0.98) 100%)",
            backdropFilter: "blur(32px) saturate(160%)",
            WebkitBackdropFilter: "blur(32px) saturate(160%)",
          }}
        />

        {/* Dynamic cream glow (fixed) */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: glowBackground }}
        />

        {/* Edge highlight */}
        <div
          className="pointer-events-none absolute -inset-[1px] rounded-[inherit] opacity-80"
          style={{
            background:
              "linear-gradient(135deg, rgba(248,245,240,0.18), transparent 35%, transparent 65%, rgba(248,245,240,0.08))",
          }}
        />

        {/* Scan line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
          <div
            className="search-scan h-full w-2/5"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(248,245,240,0.7), transparent)",
            }}
          />
        </div>

        {/* Corner accents */}
        <div className="pointer-events-none absolute top-3 left-3 h-5 w-5 rounded-tl-lg border-l border-t border-[#F8F5F0]/25" />
        <div className="pointer-events-none absolute top-3 right-3 h-5 w-5 rounded-tr-lg border-r border-t border-[#F8F5F0]/20" />

        <AnimatePresence mode="wait" initial={false}>
          {!expanded ? (
            /* ================= COLLAPSED ================= */
            <motion.button
              key="collapsed"
              type="button"
              onClick={() => {
                setExpanded(true);
                setShowError(false);
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="group relative flex w-full items-center gap-4 px-3.5 py-3 text-left"
            >
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#F8F5F0]/35 bg-gradient-to-br from-[#F8F5F0]/20 to-[#F8F5F0]/05 text-[#F8F5F0] shadow-[0_0_28px_-8px_rgba(248,245,240,0.45)]">
                <Search size={18} strokeWidth={1.7} />
                <span className="absolute inset-0 animate-ping rounded-full bg-[#F8F5F0]/15 opacity-25" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-[#F8F5F0]/85">
                  <Zap size={10} className="text-[#F8F5F0]" />
                  Intelligent Search
                </span>
                <span className="mt-1 block truncate text-[14px] font-light tracking-wide text-[#F8F5F0]/95">
                  {selectedBedrooms}
                  <span className="mx-2 text-[#F8F5F0]/25">▸</span>
                  {selectedCategory}
                  <span className="mx-2 text-[#F8F5F0]/25">▸</span>
                  {selectedBudget}
                </span>
              </span>

              {activeCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F8F5F0] px-1.5 text-[10px] font-bold text-[#0F1C2E] shadow-[0_0_18px_rgba(248,245,240,0.4)]">
                  {activeCount}
                </span>
              )}

              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F8F5F0] text-[#0F1C2E] shadow-[0_10px_28px_-8px_rgba(248,245,240,0.5)] transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-105">
                <ArrowRight size={17} strokeWidth={2.2} />
              </span>
            </motion.button>
          ) : (
            /* ================= EXPANDED ================= */
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4">
                <div className="flex items-center rounded-full border border-[#F8F5F0]/15 bg-black/30 p-1 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setActiveTab("designs")}
                    className={`rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
                      activeTab === "designs"
                        ? "bg-[#F8F5F0] text-[#0F1C2E] shadow-[0_8px_22px_-8px_rgba(248,245,240,0.35)]"
                        : "text-[#F8F5F0]/60 hover:text-[#F8F5F0]"
                    }`}
                  >
                    Designs
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("land")}
                    className={`rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
                      activeTab === "land"
                        ? "bg-[#F8F5F0] text-[#0F1C2E] shadow-[0_8px_22px_-8px_rgba(248,245,240,0.35)]"
                        : "text-[#F8F5F0]/60 hover:text-[#F8F5F0]"
                    }`}
                  >
                    Home & Land
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {activeCount > 0 && (
                    <button
                      type="button"
                      onClick={resetSearch}
                      className="hidden rounded-full border border-[#F8F5F0]/20 px-3.5 py-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-[#F8F5F0]/55 transition hover:border-[#F8F5F0]/40 hover:text-[#F8F5F0] sm:block"
                    >
                      Reset
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setAdvancedOpen((v) => !v)}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] transition-all ${
                      advancedOpen
                        ? "border-[#F8F5F0]/50 bg-[#F8F5F0]/10 text-[#F8F5F0]"
                        : "border-[#F8F5F0]/20 text-[#F8F5F0]/55 hover:border-[#F8F5F0]/40 hover:text-[#F8F5F0]"
                    }`}
                  >
                    <SlidersHorizontal size={12} />
                    <span className="hidden sm:inline">Advanced</span>
                    {activeCount > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F8F5F0] text-[9px] font-bold text-[#0F1C2E]">
                        {activeCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setExpanded(false);
                      setAdvancedOpen(false);
                    }}
                    aria-label="Close"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#F8F5F0]/20 text-[#F8F5F0]/55 transition hover:border-[#F8F5F0]/40 hover:bg-white/[0.06] hover:text-[#F8F5F0]"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Main fields */}
              <div className="mx-3 mb-3 flex flex-col divide-y divide-[#F8F5F0]/08 overflow-hidden rounded-2xl border border-[#F8F5F0]/12 bg-black/40 backdrop-blur-sm sm:flex-row sm:divide-x sm:divide-y-0">
                {/* Beds */}
                <div className="group relative flex min-w-0 flex-1 items-center gap-2 px-4 py-4 text-left transition-colors hover:bg-white/[0.04]">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[8px] font-medium uppercase tracking-[0.2em] text-[#F8F5F0]/45">
                      Beds
                    </span>
                    <select
                      value={filters.bedrooms}
                      onChange={(e) => updateFilter("bedrooms", e.target.value)}
                      className="mt-1 w-full cursor-pointer appearance-none bg-transparent text-[14px] font-light tracking-wide text-[#F8F5F0] focus:outline-none"
                    >
                      <option value="" className="bg-[#0A1420] text-white">
                        Any
                      </option>
                      {bedroomOptions.map((b) => (
                        <option key={b} value={b} className="bg-[#0A1420] text-white">
                          {b}+ Beds
                        </option>
                      ))}
                    </select>
                  </div>
                  <ChevronDown
                    size={14}
                    className="shrink-0 text-[#F8F5F0]/35 group-focus-within:text-[#F8F5F0]"
                  />
                </div>

                {/* Style / Estate */}
                <div className="group relative flex min-w-0 flex-1 items-center gap-2 px-4 py-4 text-left transition-colors hover:bg-white/[0.04]">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[8px] font-medium uppercase tracking-[0.2em] text-[#F8F5F0]/45">
                      {activeTab === "designs" ? "Style" : "Estate"}
                    </span>
                    <select
                      value={filters.category}
                      onChange={(e) => updateFilter("category", e.target.value)}
                      className="mt-1 w-full cursor-pointer appearance-none truncate bg-transparent text-[14px] font-light tracking-wide text-[#F8F5F0] focus:outline-none"
                    >
                      <option value="" className="bg-[#0A1420] text-white">
                        All
                      </option>
                      {categories.map((c) => (
                        <option key={c} value={c} className="bg-[#0A1420] text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ChevronDown size={14} className="shrink-0 text-[#F8F5F0]/35" />
                </div>

                {/* Budget */}
                <div className="group relative flex min-w-0 flex-1 items-center gap-2 px-4 py-4 text-left transition-colors hover:bg-white/[0.04]">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[8px] font-medium uppercase tracking-[0.2em] text-[#F8F5F0]/45">
                      Budget
                    </span>
                    <select
                      value={filters.priceIndex}
                      onChange={(e) => updateFilter("priceIndex", e.target.value)}
                      className="mt-1 w-full cursor-pointer appearance-none truncate bg-transparent text-[14px] font-light tracking-wide text-[#F8F5F0] focus:outline-none"
                    >
                      <option value="" className="bg-[#0A1420] text-white">
                        Any Price
                      </option>
                      {priceBrackets.map((br, i) => (
                        <option
                          key={br.label}
                          value={i}
                          className="bg-[#0A1420] text-white"
                        >
                          {br.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ChevronDown size={14} className="shrink-0 text-[#F8F5F0]/35" />
                </div>

                {/* Search CTA */}
                <button
                  type="button"
                  onClick={handleFilter}
                  className="group/search relative flex min-h-[60px] items-center justify-center gap-2.5 overflow-hidden px-7 text-[#0F1C2E] transition-all active:scale-[0.98] sm:min-h-0 sm:w-[22%]"
                  style={{
                    background:
                      "linear-gradient(135deg, #F8F5F0 0%, #F0EBE3 55%, #E8E2D6 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.5), 0 12px 36px rgba(248,245,240,0.25)",
                  }}
                >
                  <span className="relative z-10 text-[11px] font-bold uppercase tracking-[0.18em]">
                    Search
                  </span>
                  <ArrowRight
                    size={15}
                    strokeWidth={2.4}
                    className="relative z-10 transition-transform duration-300 group-hover/search:translate-x-1"
                  />
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover/search:translate-x-full" />
                </button>
              </div>

              {/* Advanced panel */}
              <AnimatePresence>
                {advancedOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={softSpring}
                    className="overflow-hidden"
                  >
                    <div className="mx-3 mb-3 flex flex-col divide-y divide-[#F8F5F0]/08 overflow-hidden rounded-2xl border border-[#F8F5F0]/12 bg-white/[0.04] sm:flex-row sm:divide-x sm:divide-y-0">
                      <div className="group relative flex min-w-0 flex-1 items-center gap-2 px-4 py-4 text-left transition-colors hover:bg-white/[0.04]">
                        <div className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.2em] text-[#F8F5F0]/45">
                            <Bath size={11} /> Bathrooms
                          </span>
                          <select
                            value={filters.baths}
                            onChange={(e) => updateFilter("baths", e.target.value)}
                            className="mt-1 w-full cursor-pointer appearance-none bg-transparent text-[14px] font-light tracking-wide text-[#F8F5F0] focus:outline-none"
                          >
                            <option value="" className="bg-[#0A1420] text-white">
                              Any
                            </option>
                            {bathOptions.map((b) => (
                              <option
                                key={b}
                                value={b}
                                className="bg-[#0A1420] text-white"
                              >
                                {b}+ Baths
                              </option>
                            ))}
                          </select>
                        </div>
                        <ChevronDown size={14} className="shrink-0 text-[#F8F5F0]/35" />
                      </div>

                      <div className="group relative flex min-w-0 flex-1 items-center gap-2 px-4 py-4 text-left transition-colors hover:bg-white/[0.04]">
                        <div className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.2em] text-[#F8F5F0]/45">
                            <MapPin size={11} />
                            {activeTab === "land" ? "Suburb" : "Preferred Area"}
                          </span>
                          {activeTab === "land" ? (
                            <select
                              value={filters.location}
                              onChange={(e) =>
                                updateFilter("location", e.target.value)
                              }
                              className="mt-1 w-full cursor-pointer appearance-none truncate bg-transparent text-[14px] font-light tracking-wide text-[#F8F5F0] focus:outline-none"
                            >
                              <option value="" className="bg-[#0A1420] text-white">
                                Any Suburb
                              </option>
                              {locations.map((l) => (
                                <option
                                  key={l}
                                  value={l}
                                  className="bg-[#0A1420] text-white"
                                >
                                  {l}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              value={filters.location}
                              onChange={(e) =>
                                updateFilter("location", e.target.value)
                              }
                              placeholder="Suburb or region"
                              className="mt-1 w-full bg-transparent text-[14px] font-light tracking-wide text-[#F8F5F0] placeholder:text-[#F8F5F0]/30 focus:outline-none"
                            />
                          )}
                        </div>
                        {activeTab === "land" && (
                          <ChevronDown
                            size={14}
                            className="shrink-0 text-[#F8F5F0]/35"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {showError && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl border border-[#F8F5F0]/30 bg-[#F8F5F0]/[0.07] px-4 py-2.5 text-[11px] text-[#F8F5F0]">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>Select at least one filter to continue.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style jsx>{`
        .search-scan {
          animation: scanLine 5.5s ease-in-out infinite;
        }
        @keyframes scanLine {
          0% {
            transform: translateX(-140%);
          }
          50% {
            transform: translateX(320%);
          }
          100% {
            transform: translateX(320%);
          }
        }
        select option {
          background: #0a1420;
          color: #f8f5f0;
        }
      `}</style>
    </div>
  );
}