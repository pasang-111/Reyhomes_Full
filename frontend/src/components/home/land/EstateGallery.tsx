"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, X, ChevronLeft, ChevronRight } from "lucide-react";
import { HomeLandPackage } from "@/types/land";
import { Reveal } from "@/components/common/motion";

type Props = { land: HomeLandPackage };

function getImageSrc(
  item: string | { url?: string; src?: string; image?: string; image_url?: string } | null | undefined
): string | null {
  if (!item) return null;
  if (typeof item === "string") return item;
  return item.image_url || item.url || item.src || item.image || null;
}

export default function EstateGallery({ land }: Props) {
  const raw =
    land.gallery && land.gallery.length > 0
      ? land.gallery
      : [land.heroImage || land.hero_image_url];

  const images = raw
    .map(getImageSrc)
    .filter((src): src is string => Boolean(src));

  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!images.length) return null;

  const open = (i: number) => {
    setIndex(i);
    setIsOpen(true);
  };

  return (
    <section className="bg-[#F5F0E6] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mb-14 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#806D48]">
              Estate Gallery
            </p>
            <h2 className="mt-4 font-display text-4xl text-[#0A1628] sm:text-5xl">
              Discover The Community
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#0A1628]/60">
              Experience premium living through beautifully planned streets,
              landscaped parks and contemporary homes.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex items-center gap-3 rounded-full border border-[#0A1628]/10 bg-white px-5 py-3 shadow-sm">
              <Camera className="text-[#806D48]" size={18} />
              <span className="text-sm font-medium text-[#0A1628]/70">
                {images.length} Photos
              </span>
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* Large */}
          <Reveal className="col-span-12 lg:col-span-7">
            <button
              onClick={() => open(0)}
              className="group relative h-[420px] w-full overflow-hidden rounded-[28px] sm:h-[520px] lg:h-[620px]"
            >
              <Image
                src={images[0]}
                alt={land.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
            </button>
          </Reveal>

          {/* Side */}
          <div className="col-span-12 grid gap-5 lg:col-span-5">
            {images.slice(1, 3).map((img, i) => (
              <Reveal key={i} delay={0.08 + i * 0.06}>
                <button
                  onClick={() => open(i + 1)}
                  className="group relative h-[200px] w-full overflow-hidden rounded-[24px] sm:h-[250px] lg:h-[297px]"
                >
                  <Image
                    src={img}
                    alt={`${land.title}-${i}`}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </button>
              </Reveal>
            ))}
          </div>

          {/* Bottom row */}
          <Reveal className="col-span-12 lg:col-span-6" delay={0.15}>
            <button
              onClick={() => open(3)}
              className="group relative h-[320px] w-full overflow-hidden rounded-[24px] sm:h-[380px]"
            >
              <Image
                src={images[3] || images[0]}
                alt={land.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            </button>
          </Reveal>

          <Reveal className="col-span-12 lg:col-span-6" delay={0.2}>
            <div className="flex h-full flex-col justify-center rounded-[24px] border border-[#0A1628]/08 bg-white p-8 sm:p-12">
              <p className="text-[11px] uppercase tracking-[0.4em] text-[#806D48]">
                Estate Lifestyle
              </p>
              <h3 className="mt-4 font-display text-3xl text-[#0A1628] sm:text-4xl">
                Premium Living Starts Here
              </h3>
              <p className="mt-5 text-base leading-7 text-[#0A1628]/60">
                Positioned within one of the region’s most desirable estates,
                this community offers landscaped parks, quality schools and
                excellent transport links.
              </p>

              <div className="mt-8 flex items-center gap-3 text-[#0A1628]">
                <MapPin size={18} className="text-[#806D48]" />
                <span className="text-lg">
                  {land.suburb}, {land.state}
                </span>
              </div>

              <div className="mt-10 flex gap-12">
                <div>
                  <p className="font-display text-3xl text-[#0A1628]">
                    {land.landSize}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-[#0A1628]/45">
                    Land Size
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl text-[#0A1628]">
                    {land.houseSize}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-[#0A1628]/45">
                    House Size
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-[#0A1628]/96 p-4 sm:p-6"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="mb-4 flex items-center justify-between text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-lg font-medium">
                {land.title} — {index + 1} / {images.length}
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-white/10"
              >
                <X size={24} />
              </button>
            </div>

            <div
              className="relative flex flex-1 items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[index]}
                alt=""
                width={1600}
                height={1000}
                className="max-h-[80vh] w-auto object-contain"
                unoptimized
                priority
              />
            </div>

            {images.length > 1 && (
              <div
                className="mt-5 flex justify-center gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() =>
                    setIndex((p) => (p - 1 + images.length) % images.length)
                  }
                  className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm text-white hover:bg-white/20"
                >
                  <ChevronLeft size={18} /> Prev
                </button>
                <button
                  onClick={() => setIndex((p) => (p + 1) % images.length)}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm text-white hover:bg-white/20"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}