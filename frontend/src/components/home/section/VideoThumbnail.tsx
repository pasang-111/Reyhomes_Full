"use client";

import Image from "next/image";
import { Play, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  active: boolean;
  title: string;
  thumbnail: string;
  onClick: () => void;
};

export default function VideoThumbnail({
  active,
  title,
  thumbnail,
  onClick,
}: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.35 }}
      className={`group relative w-[360px] flex-shrink-0 text-left ${
        active ? "z-20" : ""
      }`}
    >
      {/* Luxury Glow – more vibrant */}
      {active && (
        <div className="pointer-events-none absolute -inset-2 rounded-[34px] bg-[#C5CAD3]/25 blur-3xl" />
      )}

      <div
        className={`relative overflow-hidden rounded-[30px] border transition-all duration-500 ${
          active
            ? "border-[#C5CAD3]/80 shadow-[0_35px_90px_rgba(197,202,211,.28)]"
            : "border-white/15 group-hover:border-[#C5CAD3]/40"
        }`}
      >
        {/* IMAGE */}
        <div className="relative h-[230px] overflow-hidden">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

          {/* Active Badge – brighter */}
          {active && (
            <div className="absolute left-6 top-6 rounded-full border border-[#C5CAD3]/40 bg-gradient-to-r from-[#9CA3AF] to-[#C5CAD3] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-black shadow-lg">
              NOW PLAYING
            </div>
          )}

          {/* Play Button */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="flex h-18 w-18 items-center justify-center rounded-full border border-white/25 bg-white/15 backdrop-blur-xl shadow-2xl transition duration-500 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#9CA3AF] group-hover:to-[#C5CAD3] group-hover:border-transparent">
              <Play fill="white" className="ml-1 h-7 w-7 text-white" />
            </div>
          </motion.div>

          {/* Category */}
          <div className="absolute bottom-6 right-6 rounded-full border border-white/20 bg-black/50 px-4 py-2 backdrop-blur-xl">
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/90">
              Luxury Tour
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-gradient-to-b from-[#15151A] to-[#0A0A0E] p-7">
          <div className="flex items-start justify-between gap-5">
            <div className="flex-1">
              <h3 className="font-display text-[22px] leading-tight tracking-wide text-white transition duration-300 group-hover:text-white">
                {title}
              </h3>

              <p className="mt-3 text-[14px] leading-7 text-white/65">
                Modern architecture, refined interiors and timeless craftsmanship.
              </p>
            </div>

            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                active
                  ? "bg-gradient-to-br from-[#9CA3AF] to-[#C5CAD3] text-black shadow-lg"
                  : "border border-white/20 text-white/70 group-hover:border-[#C5CAD3] group-hover:text-[#C5CAD3]"
              }`}
            >
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-7 flex items-center justify-between border-t border-white/20 pt-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-[#C5CAD3]">
                DISPLAY HOME
              </p>

              <p className="mt-1 text-sm text-white/50">ReyHomes Collection</p>
            </div>

            {active && (
              <div className="h-2.5 w-2.5 rounded-full bg-[#C5CAD3] shadow-[0_0_18px_#C5CAD3]" />
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}