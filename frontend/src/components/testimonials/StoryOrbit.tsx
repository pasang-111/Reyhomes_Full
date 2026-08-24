"use client";

/**
 * “Telepathy remote” — video stories arranged in an orbit around a focal player.
 * Cursor proximity pulls nearby thumbs closer; click selects the active story.
 */

import Image from "next/image";
import { useMemo, useRef, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export type OrbitStory = {
  id: number;
  title: string;
  subtitle?: string;
  thumbnail: string;
  embedUrl: string;
};

type Props = {
  stories: OrbitStory[];
  activeId: number;
  onSelect: (story: OrbitStory) => void;
};

export default function StoryOrbit({ stories, activeId, onSelect }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });

  const placed = useMemo(() => {
    const n = Math.max(stories.length, 1);
    return stories.map((s, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return {
        ...s,
        // unit circle position (desktop orbit)
        ux: Math.cos(a),
        uy: Math.sin(a),
      };
    });
  }, [stories]);

  const onMove = (e: MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCursor({
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    });
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      className="relative mx-auto aspect-square w-full max-w-xl"
    >
      {/* Telepathy field rings */}
      <div className="pointer-events-none absolute inset-[8%] rounded-full border border-[#C5CAD3]/15" />
      <div className="pointer-events-none absolute inset-[18%] rounded-full border border-[#C5CAD3]/10" />
      <div className="pointer-events-none absolute inset-[28%] rounded-full border border-dashed border-[#C5CAD3]/12" />

      {/* Soft focal glow following cursor */}
      <div
        className="pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C5CAD3]/10 blur-3xl transition-transform duration-300"
        style={{
          left: `${cursor.x * 100}%`,
          top: `${cursor.y * 100}%`,
        }}
      />

      {/* Center pulse */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D8C7A4]/30 bg-[#D8C7A4]/5" />

      {placed.map((s) => {
        const active = s.id === activeId;
        // base orbit radius ~38% of container
        const pullX = (cursor.x - 0.5) * 18;
        const pullY = (cursor.y - 0.5) * 18;
        const left = 50 + s.ux * 38 + pullX * 0.15;
        const top = 50 + s.uy * 38 + pullY * 0.15;

        return (
          <motion.button
            key={s.id}
            type="button"
            onClick={() => onSelect(s)}
            className={`absolute h-20 w-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border transition duration-500 sm:h-24 sm:w-24 ${
              active
                ? "z-20 border-[#D8C7A4] shadow-[0_0_40px_rgba(216,199,164,0.45)] scale-110"
                : "z-10 border-white/20 hover:border-[#C5CAD3]/70"
            }`}
            style={{ left: `${left}%`, top: `${top}%` }}
            whileHover={{ scale: 1.08 }}
            aria-label={`Play ${s.title}`}
          >
            {s.thumbnail ? (
              <Image
                src={s.thumbnail}
                alt={s.title}
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0A1628]">
                <Play size={20} className="text-[#D8C7A4]" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Play
                size={16}
                className={active ? "text-[#D8C7A4]" : "text-white/80"}
                fill="currentColor"
              />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
