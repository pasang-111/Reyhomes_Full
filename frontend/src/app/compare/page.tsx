"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { Reveal } from "@/components/common/motion";
import { formatArea, formatMetres } from "@/lib/units";
import type { HomeDesignListItem } from "@/types/home";
import { getDesigns } from "@/lib/api/designs";

function CompareInner() {
  const searchParams = useSearchParams();
  const [all, setAll] = useState<HomeDesignListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDesigns()
      .then((d) => setAll(d || []))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedSlugs = useMemo(() => {
    const raw = searchParams.get("d") || searchParams.get("designs") || "";
    return raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
  }, [searchParams]);

  const [picks, setPicks] = useState<string[]>(selectedSlugs);

  useEffect(() => {
    if (selectedSlugs.length) setPicks(selectedSlugs);
  }, [selectedSlugs]);

  const compared = useMemo(
    () => picks.map((s) => all.find((d) => d.slug === s)).filter(Boolean) as HomeDesignListItem[],
    [picks, all]
  );

  const toggle = (slug: string) => {
    setPicks((prev) => {
      if (prev.includes(slug)) return prev.filter((x) => x !== slug);
      if (prev.length >= 3) return [...prev.slice(1), slug];
      return [...prev, slug];
    });
  };

  return (
    <main className="min-h-screen bg-[#0A1420] text-[#F8F5F0]">
      <section className="border-b border-white/10 bg-[#0C2A44] px-5 pb-16 pt-36 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-7xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#D8C7A4]">
            Side by side
          </p>
          <h1 className="mt-4 font-display text-4xl font-light sm:text-5xl">Compare designs</h1>
          <p className="mt-4 max-w-xl text-sm text-[#F8F5F0]/55">
            Select up to three residences. Specs use m² and metres for a clear comparison.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        {loading ? (
          <p className="text-sm text-white/50">Loading collection…</p>
        ) : (
          <>
            <div className="mb-10 flex flex-wrap gap-2">
              {all.slice(0, 40).map((d) => {
                const on = picks.includes(d.slug);
                return (
                  <button
                    key={d.slug}
                    type="button"
                    onClick={() => toggle(d.slug)}
                    className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition ${
                      on
                        ? "bg-[#D8C7A4] text-[#0C2A44]"
                        : "border border-white/15 text-white/60 hover:border-[#D8C7A4]/40"
                    }`}
                  >
                    {d.name || d.title || d.slug}
                  </button>
                );
              })}
            </div>

            {compared.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-16 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#D8C7A4]">
                  Compare
                </p>
                <h2 className="mt-4 font-display text-3xl font-light text-[#F8F5F0]">
                  No designs selected yet
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/50">
                  Add up to three home designs from the catalogue to see beds, baths,
                  size and pricing side by side.
                </p>
                <a
                  href="/home-designs"
                  className="mt-8 inline-flex rounded-full border border-[#D8C7A4]/40 bg-[#D8C7A4]/10 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D8C7A4] transition hover:bg-[#D8C7A4]/20"
                >
                  Browse designs
                </a>
              </div>
            ) : (
              <div className={`grid gap-6 ${compared.length === 1 ? "md:grid-cols-1" : compared.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                {compared.map((d) => {
                  const img = d.hero_image_url || d.image || "/favicon.ico";
                  const title = d.name || d.title || d.slug;
                  return (
                    <div
                      key={d.slug}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                    >
                      <div className="relative aspect-[16/10]">
                        <Image src={img} alt={title} fill className="object-cover" sizes="33vw" />
                        <button
                          type="button"
                          onClick={() => toggle(d.slug)}
                          className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white/80"
                          aria-label="Remove"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="p-5">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#D8C7A4]/90">
                          {d.category || "—"}
                        </p>
                        <h2 className="mt-1 font-display text-2xl">{title}</h2>
                        <p className="mt-1 text-sm text-white/50">From {d.price || "—"}</p>
                        <dl className="mt-5 space-y-2 text-sm">
                          <Row label="Beds" value={String(d.beds ?? "—")} />
                          <Row label="Baths" value={String(d.baths ?? "—")} />
                          <Row label="Garage" value={String(d.garage ?? "—")} />
                          <Row label="House" value={formatArea((d as any).house_size || (d as any).houseSize)} />
                          <Row label="Min lot" value={formatMetres(d.min_lot_width || (d as any).frontage)} />
                        </dl>
                        <div className="mt-6 flex flex-wrap gap-3">
                          <Link
                            href={`/home-designs/${d.slug}`}
                            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D8C7A4]"
                          >
                            View <ArrowRight size={12} className="inline" />
                          </Link>
                          <Link
                            href={`/enquire?design=${encodeURIComponent(d.slug)}`}
                            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 hover:text-[#D8C7A4]"
                          >
                            Enquire
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-white/10 py-1.5">
      <dt className="text-white/40">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0A1420] p-20 text-white/50">Loading…</main>}>
      <CompareInner />
    </Suspense>
  );
}
