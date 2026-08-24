"use client";

import Image from "next/image";

import Link from "next/link";

import {
  motion,
} from "framer-motion";

import {
  MapPin,
  BedDouble,
  Bath,
  CarFront,
  Ruler,
  ArrowRight,
} from "lucide-react";

import WishlistButton from "@/components/auth/WishlistButton";

import SlugHoverPreview from "@/components/home/section/SlugHoverPreview";

import {
  luxeEase,
} from "@/components/common/motion";

type Props = {
  id?: number;

  slug: string;

  title: string;

  suburb?: string | null;

  state?: string | null;

  image?: string | null;

  badge?: string | null;

  price: string;

  landSize?: string | number | null;

  houseSize?: string | number | null;

  beds: number | string;

  baths: number | string;

  garage: number | string;
};

/**
 * Open corner bracket — same signature mark as DesignCard,
 * so the two card families read as one family of drawings.
 */
function CornerBracket({
  position,
}: {
  position: "tl" | "tr" | "bl" | "br";
}) {
  const base =
    "absolute h-7 w-7 border-[#D8C7A4]/40 transition-colors duration-700 group-hover:border-[#D8C7A4]/90";

  const map = {
    tl: "left-4 top-4 border-l border-t",
    tr: "right-4 top-4 border-r border-t",
    bl: "left-4 bottom-4 border-l border-b",
    br: "right-4 bottom-4 border-r border-b",
  } as const;

  const dotMap = {
    tl: "left-4 top-4",
    tr: "right-4 top-4",
    bl: "left-4 bottom-4",
    br: "right-4 bottom-4",
  } as const;

  return (
    <>
      <span className={`${base} ${map[position]}`} />
      {/* jeweller's mark — a hairline dot at the bracket's joint, only visible on hover */}
      <span
        className={`absolute h-[3px] w-[3px] rounded-full bg-[#D8C7A4] opacity-0 shadow-[0_0_6px_1px_rgba(216,199,164,.7)] transition-opacity duration-700 group-hover:opacity-90 ${dotMap[position]}`}
      />
    </>
  );
}

export default function PackageCard({
  id,
  slug,
  title,
  suburb,
  state,
  image,
  badge,
  price,
  landSize,
  houseSize,
  beds,
  baths,
  garage,
}: Props) {
  const safeSuburb = suburb ?? "—";
  const safeState = state ?? "—";

  const safeImage =
    image ||
    "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
          <rect width="1200" height="800" fill="#0A1628"/>
          <text x="600" y="400"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#C5CAD3"
            font-family="Arial"
            font-size="42">
            REY HOMES
          </text>
        </svg>
      `);

  const validId = Number(id) > 0 ? Number(id) : null;

  const valueOrDash = (value?: string | number | null) =>
    value === null || value === undefined || value === "" ? "—" : value;

  const specs = [
    { icon: BedDouble, value: valueOrDash(beds), label: "Beds" },
    { icon: Bath, value: valueOrDash(baths), label: "Baths" },
    { icon: CarFront, value: valueOrDash(garage), label: "Garage" },
    { icon: Ruler, value: valueOrDash(landSize), label: "Land" },
  ];

  return (
    <SlugHoverPreview
      kind="package"
      slug={slug}
      href={`/home-land/${slug}`}
    >
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ duration: 0.7, ease: luxeEase }}
        className="group relative flex h-full flex-col overflow-visible rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.015] shadow-[0_1px_0_rgba(255,255,255,.06)_inset] backdrop-blur-sm transition-shadow duration-700 hover:shadow-[0_30px_70px_-25px_rgba(0,0,0,.65)]"
      >
        {/* ambient glow — reads like a piece lit inside a display case */}
        <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] bg-[radial-gradient(closest-side,rgba(216,199,164,.16),transparent)] opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />

        <CornerBracket position="tl" />
        <CornerBracket position="br" />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-[#D8C7A4] to-transparent transition-transform duration-700 ease-out group-hover:scale-x-100" />

        {/* Hero image — full-width, up top, the first thing anyone sees, set in a fine gold mount */}
        <div className="relative aspect-[16/11] w-full shrink-0 overflow-hidden rounded-t-[28px] bg-[#07111f]">
          <Image
            src={safeImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.045]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/20 to-[#0A1628]/5" />

          <div className="pointer-events-none absolute inset-3 rounded-[20px] border border-[#D8C7A4]/0 transition-colors duration-700 group-hover:border-[#D8C7A4]/25" />

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_25%,rgba(255,255,255,.09)_45%,transparent_60%)] opacity-0 transition-all duration-[1300ms] group-hover:translate-x-[35%] group-hover:opacity-100" />

          <div className="absolute inset-x-5 top-5 z-20 flex items-start justify-between gap-3">
            {badge ? (
              <span className="rounded-full border border-[#D8C7A4]/35 bg-[#0A1628]/80 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D8C7A4] backdrop-blur-sm">
                {badge}
              </span>
            ) : (
              <span />
            )}

            {validId && (
              <WishlistButton
                size="sm"
                entry={{
                  kind: "land",
                  id: validId,
                  slug,
                  name: title,
                  image: image || "",
                  price: price || "",
                }}
              />
            )}
          </div>

          {/* Price tag — a tactile pill hanging off the image's bottom corner, cast in gold */}
          <div className="absolute bottom-5 right-5 z-20 rounded-2xl border border-[#D8C7A4]/30 bg-[#0A1628]/85 px-4 py-2.5 text-right shadow-[0_8px_30px_rgba(0,0,0,.5)] backdrop-blur-md">
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#F8F5F0]/45">
              From
            </p>
            <p className="bg-gradient-to-br from-[#F3E7C9] via-[#D8C7A4] to-[#B79762] bg-clip-text font-display text-lg font-semibold leading-tight text-transparent">
              {price}
            </p>
          </div>

          <div className="absolute bottom-5 left-5 z-20 max-w-[60%]">
            <div className="flex items-center gap-2">
              <span className="h-px w-4 bg-[#D8C7A4]/70" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D8C7A4]">
                Home &amp; Land
              </p>
            </div>

            <h3 className="mt-2 text-balance font-display text-xl leading-[1.15] text-[#F8F5F0] drop-shadow-[0_2px_10px_rgba(0,0,0,.5)] sm:text-2xl">
              {title}
            </h3>
          </div>
        </div>

        {/* Specs dock — floats half over the image edge like an inset brass plate */}
        <div className="relative z-20 mx-5 -mt-6 rounded-2xl border border-[#D8C7A4]/20 bg-[#0A1628]/90 px-5 py-4 shadow-[0_10px_35px_rgba(0,0,0,.45),0_1px_0_rgba(216,199,164,.12)_inset] backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 divide-x divide-[#D8C7A4]/15">
            {specs.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 ${i > 0 ? "pl-6" : ""}`}
              >
                <item.icon
                  size={18}
                  strokeWidth={1.4}
                  className="shrink-0 text-[#D8C7A4]"
                />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-[#F8F5F0]">
                    {item.value}
                  </p>
                  <span className="text-[9px] uppercase tracking-wider text-[#F8F5F0]/45">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content — location, house size, CTA */}
        <div className="relative flex flex-1 flex-col gap-5 p-6 pt-5 sm:p-7 sm:pt-5">
          <div className="flex items-center gap-1.5 text-[#F8F5F0]/55">
            <MapPin
              size={14}
              strokeWidth={1.5}
              className="shrink-0 text-[#D8C7A4]"
            />
            <span className="text-sm">
              {safeSuburb}, {safeState}
            </span>
          </div>

          {houseSize !== null && houseSize !== undefined && houseSize !== "" && (
            <div className="flex items-center justify-between border-t border-[#D8C7A4]/12 pt-4 text-sm">
              <span className="text-[#F8F5F0]/50">House Size</span>
              <span className="font-medium text-[#F8F5F0]">{houseSize}</span>
            </div>
          )}

          {/* CTA — a brushed-gold plaque rather than a ghost outline */}
          <div className="mt-auto">
            <Link
              href={`/home-land/${slug}`}
              onClick={(event) => {
                event.stopPropagation();
              }}
              className="group/btn relative flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#EFE0BC] via-[#D8C7A4] to-[#C2A876] py-3.5 text-sm font-semibold text-[#0A1628] shadow-[0_10px_25px_-8px_rgba(216,199,164,.55)] transition-all duration-500 hover:shadow-[0_14px_32px_-8px_rgba(216,199,164,.75)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
              <span className="relative">Explore Package</span>
              <ArrowRight
                size={16}
                className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </motion.article>
    </SlugHoverPreview>
  );
}