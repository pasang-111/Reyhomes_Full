"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  FileText,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal, luxeEase } from "@/components/common/motion";
import type { Inclusion } from "@/lib/api/inclusions";

const CATEGORY_LABELS: Record<string, string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  electrical: "Electrical",
  flooring: "Flooring",
  facade: "Facade",
  living: "Living",
  exterior: "Exterior",
  other: "Interiors",
};

const CATEGORY_IMAGES: Record<string, string> = {
  kitchen:
    "https://images.unsplash.com/photo-1696986681606-b156ccd761c5?auto=format&fit=crop&w=1400&q=85",
  bathroom:
    "https://images.unsplash.com/photo-1754788358645-d6e6cca12e25?auto=format&fit=crop&w=1400&q=85",
  electrical:
    "https://images.unsplash.com/photo-1531762948975-73032b7b61f4?auto=format&fit=crop&w=1400&q=85",
  flooring:
    "https://images.unsplash.com/photo-1635603498472-bd44fd7b0735?auto=format&fit=crop&w=1400&q=85",
  facade:
    "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1400&q=85",
  living:
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1400&q=85",
  exterior:
    "https://images.unsplash.com/photo-1706808849780-7a04fbac83ef?auto=format&fit=crop&w=1400&q=85",
  other:
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1400&q=85",
};

type Props = {
  inclusions?: Inclusion[];
};

export default function InclusionsPreview({
  inclusions = [],
}: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const books = useMemo(() => {
    const byCategory = new Map<string, Inclusion[]>();

    for (const item of inclusions) {
      const category = item.category || "other";
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push(item);
    }

    // Public catalogue shelf: show categories even without PDF (link to /inclusions).
    // Same public fields only — never cost/supplier (not on Inclusion type).
    return Array.from(byCategory.entries())
      .map(([category, items]) => ({
        category,
        items,
        featured: items.find((item) => item.pdf_url) || items[0],
      }))
      .filter((book) => Boolean(book.featured))
      .sort((a, b) => b.items.length - a.items.length)
      .slice(0, 4);
  }, [inclusions]);

  if (books.length === 0) {
    return (
      <section className="relative overflow-hidden bg-[#0F1C2E] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-4 flex items-center gap-4">
            <span className="h-px w-10 bg-[#F8F5F0]/40" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#F8F5F0]/70">
              The Collection
            </span>
          </div>

          <h2 className="font-display text-4xl text-[#F8F5F0] md:text-5xl">
            The Rey Homes Book
          </h2>

          <Link
            href="/inclusions"
            className="mt-8 inline-flex items-center gap-2 text-sm text-[#F8F5F0]/80"
          >
            Explore the collection
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="rh-section relative overflow-hidden bg-[#0F1C2E] py-24 sm:py-28 lg:py-36"
    >
      <div className="rh-orbs" aria-hidden="true">
        <div
          className="rh-orb rh-orb--silver rh-orb--lg rh-orb--drift-a"
          style={{ top: "-14%", right: "-10%" }}
        />
        <div
          className="rh-orb rh-orb--navy rh-orb--md rh-orb--drift-b"
          style={{ bottom: "-12%", left: "-6%" }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#1E2A44]/[0.25] blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-white/[0.02] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #F8F5F0 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <Reveal className="mb-16 flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-4">
              <span className="h-px w-12 bg-gradient-to-r from-[#F8F5F0]/50 to-transparent" />
              <p className="text-[10px] font-medium uppercase tracking-[0.45em] text-[#F8F5F0]/70">
                The Rey Homes Collection
              </p>
            </div>

            <h2 className="font-display text-4xl font-light leading-[1.05] tracking-[-0.025em] text-[#F8F5F0] sm:text-5xl lg:text-6xl">
              Designed to be
              <span className="block text-[#F8F5F0]/45">
                experienced.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-sm font-light leading-7 text-[#F8F5F0]/50 sm:text-base">
              Explore the materials, finishes and architectural details
              selected for every Rey Homes residence.
            </p>
          </div>

          <Link
            href="/inclusions"
            className="group inline-flex shrink-0 items-center gap-3 text-sm font-medium text-[#F8F5F0]/80 transition-all duration-500 hover:text-white"
          >
            <span>View complete collection</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F8F5F0]/25 transition-all duration-500 group-hover:border-[#F8F5F0] group-hover:bg-[#F8F5F0] group-hover:text-[#0F1C2E]">
              <ArrowRight
                size={15}
                className="transition-transform duration-500 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </Reveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book, index) => {
            const typeLabel =
              CATEGORY_LABELS[book.category] ||
              book.category ||
              "Collection";

            const image =
              CATEGORY_IMAGES[book.category] ||
              CATEGORY_IMAGES.other;

            const count = book.items.length;

            return (
              <InclusionBook
                key={book.category}
                index={index}
                href={book.featured?.pdf_url || "/inclusions"}
                typeLabel={typeLabel}
                image={image}
                count={count}
              />
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .rotate-y-\\[-4deg\\] {
          transform: rotateY(-4deg);
        }
        @media (prefers-reduced-motion: reduce) {
          .rotate-y-\\[-4deg\\] {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}

/**
 * A single book cover — bold cinematic reveal with a per-index scroll
 * parallax depth offset, so the row of covers drifts at slightly
 * different rates as the section scrolls through view.
 */
function InclusionBook({
  index,
  href,
  typeLabel,
  image,
  count,
}: {
  index: number;
  href: string;
  typeLabel: string;
  image: string;
  count: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Alternate depth per column for a subtle "staggered shelf" cinematic feel.
  const depth = 26 + (index % 2) * 18;
  const y = useTransform(scrollYProgress, [0, 1], [depth, -depth]);

  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${typeLabel} collection`}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay: index * 0.12, ease: luxeEase }}
      className="group relative block"
    >
      <motion.div style={{ y }}>
        <div className="absolute -bottom-5 left-[8%] right-[8%] h-10 rounded-full bg-black/60 blur-2xl transition-all duration-700 group-hover:scale-110 group-hover:bg-[#1E2A44]/30" />

        <div className="relative mx-auto aspect-[0.69] w-full max-w-[310px] [perspective:1200px]">
          <div
            className="relative h-full w-full overflow-hidden rounded-r-[8px] rounded-l-[3px] border border-white/10 bg-[#0A1420] shadow-[15px_25px_50px_rgba(0,0,0,0.55)] transition-all duration-700 ease-out group-hover:-translate-y-3 group-hover:rotate-y-[-4deg] group-hover:shadow-[25px_40px_80px_rgba(0,0,0,0.7)]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[1400ms] ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${image})` }}
            />

            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/25 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />

            <div className="absolute inset-y-0 left-0 w-[14px] border-r border-black/40 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
            <div className="absolute inset-y-0 left-[13px] w-px bg-white/10" />

            <div className="pointer-events-none absolute inset-3 rounded-[2px] border border-white/15 transition-all duration-700 group-hover:border-[#F8F5F0]/50" />

            <div className="absolute left-7 right-7 top-8 flex items-center justify-between">
              <span className="text-[8px] font-medium uppercase tracking-[0.35em] text-white/65">
                REY HOMES
              </span>
              <BookOpen size={14} strokeWidth={1.3} className="text-[#F8F5F0]/80" />
            </div>

            <div className="absolute inset-x-7 top-1/2 -translate-y-1/2 text-center">
              <div className="mx-auto mb-5 h-px w-10 bg-[#F8F5F0]/60" />
              <p className="text-[9px] uppercase tracking-[0.4em] text-[#F8F5F0]/70">
                Volume
              </p>
              <h3 className="mt-3 font-display text-3xl font-light tracking-[-0.02em] text-white sm:text-4xl">
                {typeLabel}
              </h3>
              <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-white/45">
                Collection
              </p>
              <div className="mx-auto mt-5 h-px w-10 bg-[#F8F5F0]/50" />
            </div>

            <div className="absolute bottom-7 left-7 right-7">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.3em] text-white/40">
                    Edition
                  </p>
                  <p className="mt-1 text-[11px] tracking-[0.15em] text-white/80">
                    01 / {String(count).padStart(2, "0")}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-sm transition-all duration-500 group-hover:border-[#F8F5F0] group-hover:bg-[#F8F5F0] group-hover:text-[#0F1C2E]">
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent transition-transform duration-[1200ms] group-hover:translate-x-full" />
          </div>

          <div className="pointer-events-none absolute right-[-5px] top-[3%] bottom-[3%] w-[6px] rounded-r-sm bg-gradient-to-b from-[#d7d0bd]/40 via-[#807967]/20 to-[#d7d0bd]/30 opacity-70" />
          <div className="pointer-events-none absolute bottom-[-3px] left-[3%] right-[2%] h-[5px] rounded-full bg-black/60 blur-[1px]" />
        </div>

        <div className="mx-auto mt-6 max-w-[310px] text-center">
          <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.28em] text-white/35">
            <FileText size={11} />
            <span>{count} selected inclusions</span>
          </div>

          <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-white/60 transition-colors duration-500 group-hover:text-[#F8F5F0]">
            Open volume
            <ExternalLink
              size={12}
              className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>
      </motion.div>
    </motion.a>
  );
}