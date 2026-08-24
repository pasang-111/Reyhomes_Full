"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion, LayoutGroup, useScroll, useTransform } from "framer-motion";
import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import DesignCard from "@/components/home/section/DesignCard";
import type { HomeDesignListItem } from "@/types/home";
import { Reveal, FloatGlow, luxeEase } from "@/components/common/motion";
import DragValueRail from "@/components/effects/DragValueRail";
import { SexyPageTitle } from "@/components/filters/AdvancedFilterBox";
import FilterSidebar from "@/components/filters/FilterSidebar";
import Image from "next/image";
import { parseMetres } from "@/lib/units";

const PRICE_BRACKETS = [
  { label: "Any budget", min: 0, max: Infinity },
  { label: "Under $450k", min: 0, max: 450000 },
  { label: "$450k – $550k", min: 450000, max: 550000 },
  { label: "$550k – $750k", min: 550000, max: 750000 },
  { label: "$750k+", min: 750000, max: Infinity },
];

const priceValue = (v: string) => Number(String(v).replace(/[^0-9.]/g, "")) || 0;
const bathValue = (v: number | string) => Number(v) || 0;

const layoutTransition = {
  layout: { duration: 0.48, ease: luxeEase },
  opacity: { duration: 0.32 },
};

export default function HomeDesignsClient({ designs }: { designs: HomeDesignListItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(designs.map((d) => d.category).filter(Boolean)))],
    [designs]
  );
  const beds = useMemo(() => [...new Set(designs.map((d) => d.beds))].sort((a, b) => a - b), [designs]);
  const baths = useMemo(
    () => [...new Set(designs.map((d) => bathValue(d.baths)))].filter(Boolean).sort((a, b) => a - b),
    [designs]
  );

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [minBeds, setMinBeds] = useState(searchParams.get("bedrooms") || "");
  const [minBaths, setMinBaths] = useState(searchParams.get("baths") || "");
  const [garage, setGarage] = useState(searchParams.get("garage") || "");
  const [minLot, setMinLot] = useState(searchParams.get("lot") || "");
  const [price, setPrice] = useState(() => {
    const min = Number(searchParams.get("minPrice") || 0);
    const max = Number(searchParams.get("maxPrice") || Infinity);
    const idx = PRICE_BRACKETS.findIndex((b) => b.min === min && b.max === max);
    return idx >= 0 ? idx : 0;
  });
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");
  const [advanced, setAdvanced] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [debouncedQ, setDebouncedQ] = useState(q);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 280);
    return () => clearTimeout(t);
  }, [q]);

  const filtered = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    const bracket = PRICE_BRACKETS[price];

    const result = designs.filter((d) => {
      if (
        term &&
        ![d.name, d.title, d.subtitle, d.category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      )
        return false;
      if (category !== "All" && d.category !== category) return false;
      if (minBeds && d.beds < Number(minBeds)) return false;
      if (minBaths && bathValue(d.baths) < Number(minBaths)) return false;
      if (garage && d.garage < Number(garage)) return false;
      if (minLot) {
        const w = parseMetres(d.min_lot_width || d.frontage);
        if (w && w > Number(minLot)) return false;
      }
      const p = priceValue(d.price);
      if (p < bracket.min || p > bracket.max) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sort === "price-low") return priceValue(a.price) - priceValue(b.price);
      if (sort === "price-high") return priceValue(b.price) - priceValue(a.price);
      if (sort === "beds") return b.beds - a.beds;
      if (sort === "name") return a.name.localeCompare(b.name);
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [designs, debouncedQ, category, minBeds, minBaths, garage, minLot, price, sort]);

  // Active filter chips for animated display
  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; clear: () => void }[] = [];
    if (q) chips.push({ id: "q", label: `“${q}”`, clear: () => setQ("") });
    if (category !== "All")
      chips.push({ id: "cat", label: category, clear: () => setCategory("All") });
    if (minBeds)
      chips.push({ id: "beds", label: `${minBeds}+ beds`, clear: () => setMinBeds("") });
    if (minBaths)
      chips.push({ id: "baths", label: `${minBaths}+ baths`, clear: () => setMinBaths("") });
    if (garage)
      chips.push({ id: "garage", label: `${garage}+ car`, clear: () => setGarage("") });
    if (minLot)
      chips.push({ id: "lot", label: `Lot ≤${minLot}m min`, clear: () => setMinLot("") });
    if (price !== 0)
      chips.push({
        id: "price",
        label: PRICE_BRACKETS[price].label,
        clear: () => setPrice(0),
      });
    return chips;
  }, [q, category, minBeds, minBaths, garage, minLot, price]);

  const syncUrl = useCallback(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category !== "All") p.set("category", category);
    if (minBeds) p.set("bedrooms", minBeds);
    if (minBaths) p.set("baths", minBaths);
    if (garage) p.set("garage", garage);
    if (minLot) p.set("lot", minLot);
    if (price !== 0) {
      p.set("minPrice", String(PRICE_BRACKETS[price].min));
      if (PRICE_BRACKETS[price].max !== Infinity)
        p.set("maxPrice", String(PRICE_BRACKETS[price].max));
    }
    if (sort !== "featured") p.set("sort", sort);
    const qs = p.toString();
    router.replace(qs ? `/home-designs?${qs}` : "/home-designs", { scroll: false });
  }, [q, category, minBeds, minBaths, garage, minLot, price, sort, router]);

  useEffect(() => {
    syncUrl();
  }, [category, minBeds, minBaths, garage, minLot, price, sort]); // eslint-disable-line

  const clear = () => {
    setQ("");
    setCategory("All");
    setMinBeds("");
    setMinBaths("");
    setGarage("");
    setMinLot("");
    setPrice(0);
    setSort("featured");
    router.replace("/home-designs");
  };

  // Sticky bar morph
  const { scrollY } = useScroll();
  const barPad = useTransform(scrollY, [0, 100], [16, 10]);
  const barShadow = useTransform(
    scrollY,
    [0, 100],
    ["0 0 0 rgba(0,0,0,0)", "0 12px 40px -12px rgba(7,26,46,0.14)"]
  );

  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#0A1628]">
      {/* Deep Hero */}
      <section className="relative min-h-[52vh] overflow-hidden bg-[#071A2E] text-[#F5F0E6] sm:min-h-[58vh]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=80"
            alt="Modern luxury home exterior"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071A2E] via-[#071A2E]/88 to-[#071A2E]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071A2E] via-transparent to-[#071A2E]/45" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(26,90,140,0.2),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_70%,rgba(216,199,164,0.07),transparent_50%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <FloatGlow
          className="pointer-events-none absolute -right-48 -top-48 h-[700px] w-[700px] rounded-full bg-[#1A4A6E]/28 blur-[150px]"
          duration={24}
          x={-40}
          y={30}
        />
        <FloatGlow
          className="pointer-events-none absolute -left-40 bottom-[-10%] h-[480px] w-[480px] rounded-full bg-[#D8C7A4]/08 blur-[120px]"
          duration={28}
          x={25}
          y={-20}
        />

        <Reveal className="relative mx-auto max-w-7xl px-5 pb-20 pt-40 sm:px-8 lg:px-10 lg:pb-28 lg:pt-48">
          <SexyPageTitle
            eyebrow="The Residential Collection"
            title="Home"
            accent="Designs."
            description="Discover considered residences shaped around space, light and enduring architectural character."
          />
        </Reveal>
      </section>

      {/* Filters left + cards right */}
      <section className="relative bg-[#F5F0E6] pb-24 pt-10 sm:pt-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[300px_1fr] lg:gap-10 lg:px-10 xl:grid-cols-[320px_1fr]">
          <FilterSidebar
            activeCount={activeChips.length}
            onClear={clear}
            onApply={syncUrl}
            search={
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0A1628]/35" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && syncUrl()}
                  placeholder="Search designs…"
                  className="h-11 w-full rounded-full border border-[#0A1628]/10 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#D8C7A4] focus:ring-4 focus:ring-[#D8C7A4]/15"
                />
              </div>
            }
            tools={
              <div className="flex flex-col gap-3">
                <div className="flex gap-1 rounded-full border border-[#0A1628]/10 bg-white p-1">
                  <button type="button" onClick={() => setView("grid")} className={`flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-[10px] font-semibold uppercase tracking-wider ${view === "grid" ? "bg-[#0A1628] text-[#F5F0E6]" : "text-[#0A1628]/45"}`}>
                    <LayoutGrid size={13} /> Grid
                  </button>
                  <button type="button" onClick={() => setView("list")} className={`flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-[10px] font-semibold uppercase tracking-wider ${view === "list" ? "bg-[#0A1628] text-[#F5F0E6]" : "text-[#0A1628]/45"}`}>
                    <List size={13} /> List
                  </button>
                </div>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 w-full rounded-full border border-[#0A1628]/10 bg-white px-3 text-xs outline-none">
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: low → high</option>
                  <option value="price-high">Price: high → low</option>
                  <option value="beds">Most bedrooms</option>
                  <option value="name">Name A–Z</option>
                </select>
              </div>
            }
          >
            <Select label="Style" value={category} onChange={setCategory} options={categories} />
            <DragValueRail label="Bedrooms" value={minBeds} options={beds.length ? beds : [1, 2, 3, 4, 5]} onChange={setMinBeds} unit="beds" />
            <DragValueRail label="Bathrooms" value={minBaths} options={baths.length ? baths : [1, 2, 3, 4]} onChange={setMinBaths} unit="baths" />
            <Select label="Garage" value={garage} onChange={setGarage} options={["", "1", "2", "3", "4"]} empty="Any" />
            <Select label="Lot width" value={minLot} onChange={setMinLot} options={["", "10", "12", "14", "16"]} empty="Any lot" labels={["Any lot", "Fits ≤10 m", "Fits ≤12 m", "Fits ≤14 m", "Fits ≤16 m"]} />
            <Select label="Budget" value={String(price)} onChange={(v) => setPrice(Number(v))} options={PRICE_BRACKETS.map((_, i) => String(i))} labels={PRICE_BRACKETS.map((x) => x.label)} />
            <div>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#0A1628]/35">Style chips</p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((item) => (
                  <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${category === item ? "bg-[#0A1628] text-[#F5F0E6]" : "bg-white text-[#0A1628]/45 border border-[#0A1628]/08"}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </FilterSidebar>

          <div className="min-w-0">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0A1628]/40">Collection</p>
                <p className="mt-1 font-display text-2xl text-[#0A1628]">
                  {filtered.length} {filtered.length === 1 ? "residence" : "residences"}
                </p>
              </div>
            </div>

            <LayoutGroup>
              <AnimatePresence mode="popLayout">
                {filtered.length ? (
                  <motion.div
                    key="grid"
                    layout
                    className={view === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-2" : "flex flex-col gap-5"}
                    transition={layoutTransition}
                  >
                    {filtered.map((design, index) => (
                      <motion.div
                        key={design.id}
                        layout
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ ...layoutTransition, delay: Math.min(index, 8) * 0.04 }}
                      >
                        <DesignCard
                          id={design.id}
                          name={design.name}
                          slug={design.slug}
                          beds={design.beds}
                          baths={bathValue(design.baths)}
                          garage={design.garage}
                          image={design.hero_image_url || design.image || "/favicon.ico"}
                          price={design.price}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-[28px] border border-[#0A1628]/08 bg-white/80 px-8 py-20 text-center"
                  >
                    <p className="font-display text-3xl text-[#0A1628]">Nothing matched</p>
                    <p className="mt-2 text-sm text-[#0A1628]/50">Relax a filter to see more of the collection.</p>
                    <button type="button" onClick={clear} className="mt-6 rounded-full bg-[#0A1628] px-7 py-3 text-sm text-[#F5F0E6]">
                      Reset filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </LayoutGroup>
          </div>
        </div>
      </section>

    </main>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  labels,
  empty = "All",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: string[];
  empty?: string;
}) {
  return (
    <label className="relative block">
      <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-[#0A1628]/35">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-2xl border border-[#0A1628]/10 bg-white/80 px-4 pr-9 text-sm outline-none focus:border-[#D8C7A4]"
        >
          {options.map((v, i) => (
            <option key={`${v}-${i}`} value={v}>
              {labels?.[i] ?? (v === "" ? empty : v)}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0A1628]/35"
        />
      </div>
    </label>
  );
}