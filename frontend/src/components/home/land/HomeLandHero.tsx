"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Bath,
  CarFront,
  MapPin,
} from "lucide-react";
import { HomeLandPackage } from "@/types/land";
import WishlistButton from "@/components/auth/WishlistButton";
import ImageSpotlight from "@/components/effects/ImageSpotlight";

type Props = {
  land: HomeLandPackage;
};

export default function HomeLandHero({ land }: Props) {
  const heroSrc =
    land.heroImage ||
    land.hero_image_url ||
    land.image ||
    "/placeholder-hero.jpg";

  return (
    <section className="relative h-[92dvh] min-h-[560px] sm:min-h-[680px] md:min-h-[760px] overflow-hidden">
      <ImageSpotlight className="absolute inset-0" radius={260}>
        <Image
          src={heroSrc}
          alt={land.title}
          fill
          priority
          className="object-cover"
          unoptimized
        />
      </ImageSpotlight>

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-5 pb-10 pt-28 sm:px-8 sm:pb-14 lg:px-10 lg:pb-20">
        <div className="w-full max-w-3xl">
          <span className="inline-block rounded-full border border-[#C8CCD4]/35 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C8CCD4]">
            {land.category || "Home & Land"}
          </span>

          <h1 className="mt-4 sm:mt-5 font-display text-[clamp(2.2rem,5.5vw,4.4rem)] leading-[1.05] tracking-tight text-white">
            {land.title}
          </h1>

          {(land.suburb || land.state) && (
            <p className="mt-3 flex items-center gap-2 text-sm text-white/60">
              <MapPin size={16} className="text-[#C8CCD4]" />
              {[land.suburb, land.state].filter(Boolean).join(", ")}
            </p>
          )}

          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
            <SpecCard icon={<BedDouble size={18} />} title="Beds" value={land.beds ?? "—"} />
            <SpecCard icon={<Bath size={18} />} title="Baths" value={land.baths ?? "—"} />
            <SpecCard icon={<CarFront size={18} />} title="Garage" value={land.garage ?? "—"} />
            <SpecCard icon={<MapPin size={18} />} title="Land" value={land.landSize ?? "—"} />
          </div>

          <div className="mt-6 sm:mt-10 md:mt-14 flex flex-wrap items-center gap-3 sm:gap-5">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.35em] text-white/40">
                Package From
              </p>
              <h2 className="mt-1 sm:mt-2 font-display text-2xl sm:text-3xl md:text-5xl text-[#C8CCD4]">
                {land.price}
              </h2>
            </div>

            <Link
              href={`/enquire?package=${land.slug}`}
              className="sm:ml-4 flex items-center gap-2 sm:gap-3 rounded-full bg-gradient-to-r from-[#E8EAED] via-[#C8CCD4] to-[#9CA3AF] px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base font-medium text-[#0A1628] shadow-[0_10px_28px_rgba(200,204,212,0.25)] transition duration-300 hover:scale-105"
            >
              Enquire Now
              <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
            </Link>

            <WishlistButton
              size="lg"
              entry={{
                kind: "land",
                id: land.id,
                slug: land.slug,
                name: land.title,
                image: heroSrc,
                price: land.price || "",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-3.5 sm:px-5 md:px-6 py-2.5 sm:py-3.5 md:py-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-[#C8CCD4] shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 truncate">
            {title}
          </p>
          <p className="text-sm sm:text-lg md:text-xl font-semibold text-white truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
