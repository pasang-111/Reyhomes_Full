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
      onClick={onClick} // ← this sets the video on the main player
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.35 }}
      className={`group relative w-[360px] flex-shrink-0 text-left ${
        active ? "z-20" : ""
      }`}
    >
      {/* Soft cream glow when active */}
      {active && (
        <div className="pointer-events-none absolute -inset-2 rounded-[34px] bg-[#F8F5F0]/10 blur-3xl" />
      )}

      <div
        className={`relative overflow-hidden rounded-[30px] border transition-all duration-500 ${
          active
            ? "border-[#F8F5F0]/50 shadow-[0_35px_90px_rgba(248,245,240,0.12)]"
            : "border-[#F8F5F0]/10 group-hover:border-[#F8F5F0]/30"
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

          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1420]/95 via-[#0A1420]/30 to-transparent" />

          {/* Active Badge */}
          {active && (
            <div className="absolute left-6 top-6 rounded-full border border-[#F8F5F0]/30 bg-[#F8F5F0] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-[#0F1C2E] shadow-lg">
              NOW PLAYING
            </div>
          )}

          {/* Play Button */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#F8F5F0]/25 bg-[#F8F5F0]/10 backdrop-blur-xl shadow-2xl transition duration-500 group-hover:scale-110 group-hover:bg-[#F8F5F0] group-hover:border-[#F8F5F0]">
              <Play
                fill="currentColor"
                className="ml-1 h-7 w-7 text-[#F8F5F0] group-hover:text-[#0F1C2E]"
              />
            </div>
          </motion.div>

          <div className="absolute bottom-6 right-6 rounded-full border border-[#F8F5F0]/15 bg-[#0A1420]/50 px-4 py-2 backdrop-blur-xl">
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#F8F5F0]/85">
              Luxury Tour
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-gradient-to-b from-[#0F1C2E] to-[#0A1420] p-7">
          <div className="flex items-start justify-between gap-5">
            <div className="flex-1">
              <h3 className="font-display text-[22px] leading-tight tracking-wide text-[#F8F5F0]">
                {title}
              </h3>

              <p className="mt-3 text-[14px] leading-7 text-[#F8F5F0]/55">
                Modern architecture, refined interiors and timeless craftsmanship.
              </p>
            </div>

            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                active
                  ? "bg-[#F8F5F0] text-[#0F1C2E] shadow-lg"
                  : "border border-[#F8F5F0]/20 text-[#F8F5F0]/60 group-hover:border-[#F8F5F0] group-hover:text-[#F8F5F0]"
              }`}
            >
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between border-t border-[#F8F5F0]/10 pt-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-[#F8F5F0]/50">
                DISPLAY HOME
              </p>
              <p className="mt-1 text-sm text-[#F8F5F0]/40">Rey Homes Collection</p>
            </div>

            {active && (
              <div className="h-2.5 w-2.5 rounded-full bg-[#F8F5F0] shadow-[0_0_18px_rgba(248,245,240,0.6)]" />
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}