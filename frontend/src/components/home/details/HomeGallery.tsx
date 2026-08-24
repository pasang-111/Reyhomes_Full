"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Reveal, luxeEase } from "@/components/common/motion";
import { galleryUrls } from "@/lib/media";

type Props = { home: any };

export default function HomeGallery({ home }: Props) {
  // API returns [{ id, image_url, ... }] — extract URL strings
  const gallery: string[] = galleryUrls(home.gallery, [
    home.hero_image_url,
    home.image,
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(1);

  if (gallery.length === 0) return null;

  const open = (i: number) => {
    setIndex(i);
    setScale(1);
    setIsOpen(true);
  };

  const next = () => {
    setIndex((p) => (p + 1) % gallery.length);
    setScale(1);
  };
  const prev = () => {
    setIndex((p) => (p - 1 + gallery.length) % gallery.length);
    setScale(1);
  };

  return (
    <section className="bg-[#F5F0E6] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#806D48]">
            Facade & Gallery
          </p>
          <h2 className="mt-4 font-display text-4xl text-[#0A1628] sm:text-5xl">
            Every Angle Considered
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {gallery.map((img, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <button
                onClick={() => open(i)}
                className="group relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-[#0A1628]/08 bg-white"
              >
                <Image
          src={img}
          alt={`${home.name} – view ${i + 1}`}
          fill
          sizes="(max-width:768px) 100vw, 50vw"
          className="object-cover transition duration-700 group-hover:scale-105"
          unoptimized
        />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                  <span className="translate-y-4 text-sm font-medium uppercase tracking-widest text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                    Enlarge
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-[#0A1628]/97 p-4 sm:p-6"
            onClick={() => setIsOpen(false)}
          >
            <div className="mb-4 flex items-center justify-between text-[#F5F0E6]" onClick={(e) => e.stopPropagation()}>
              <p className="text-lg font-medium">
                {home.name} — {index + 1} / {gallery.length}
              </p>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-white/10">
                <X size={26} />
              </button>
            </div>

            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-black/40"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale }}
                transition={{ duration: 0.35, ease: luxeEase }}
                className="relative max-h-full max-w-full"
                style={{ scale }}
              >
                <Image
          src={gallery[index]}
          alt=""
          width={1800}
          height={1200}
          className="max-h-[80vh] w-auto object-contain"
          priority
          unoptimized
        />
              </motion.div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
              {gallery.length > 1 && (
                <>
                  <button onClick={prev} className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm text-white hover:bg-white/20">
                    <ChevronLeft size={18} /> Prev
                  </button>
                  <button onClick={next} className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm text-white hover:bg-white/20">
                    Next <ChevronRight size={18} />
                  </button>
                </>
              )}
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <button onClick={() => setScale((s) => Math.max(0.6, s - 0.25))} className="p-1.5 text-white hover:bg-white/20 rounded-full">
                  <ZoomOut size={18} />
                </button>
                <span className="w-12 text-center text-sm text-white/80">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale((s) => Math.min(3, s + 0.25))} className="p-1.5 text-white hover:bg-white/20 rounded-full">
                  <ZoomIn size={18} />
                </button>
                <button onClick={() => setScale(1)} className="ml-1 p-1.5 text-white/70 hover:bg-white/20 rounded-full">
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
