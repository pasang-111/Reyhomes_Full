"use client";

/**
 * Luxury filter rail: drag horizontally to increase/decrease a numeric filter
 * (e.g. bedrooms). Click ticks also work. Keyboard accessible.
 */

import { useCallback, useRef, type PointerEvent, type KeyboardEvent } from "react";

type Props = {
  label: string;
  value: string;
  options: number[];
  onChange: (next: string) => void;
  unit?: string;
  tone?: "light" | "dark";
};

export default function DragValueRail({
  label,
  value,
  options,
  onChange,
  unit = "",
  tone = "light",
}: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const numeric = value === "" ? 0 : Number(value);
  const max = options[options.length - 1] || 5;
  const pct = numeric <= 0 ? 0 : Math.min(100, (numeric / max) * 100);

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return "";
      const r = el.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      if (t < 0.08) return "";
      const raw = Math.round(t * max);
      const closest = options.reduce((a, b) =>
        Math.abs(b - raw) < Math.abs(a - raw) ? b : a
      );
      return String(closest);
    },
    [max, options]
  );

  const onPointerDown = (e: PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    onChange(valueFromClientX(e.clientX));
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging.current) return;
    onChange(valueFromClientX(e.clientX));
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const display =
    numeric <= 0 ? "Any" : unit ? `${numeric}+ ${unit}` : `${numeric}+`;

  return (
    <div className="select-none">
      <div className="mb-2 flex items-end justify-between">
        <span
          className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
            tone === "dark" ? "text-white/40" : "text-[#0A1628]/45"
          }`}
        >
          {label}
        </span>
        <span
          className={`font-display text-lg ${
            tone === "dark" ? "text-[#D8C7A4]" : "text-[#0A1628]"
          }`}
        >
          {display}
        </span>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={numeric}
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(e: KeyboardEvent) => {
          const idx = numeric <= 0 ? -1 : options.indexOf(numeric);
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            const next =
              options[Math.min(options.length - 1, Math.max(0, idx + 1))] ??
              options[0];
            onChange(String(next));
          }
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            if (idx <= 0) onChange("");
            else onChange(String(options[idx - 1]));
          }
        }}
        className={`relative h-10 cursor-ew-resize touch-none rounded-full px-1 border ${
          tone === "dark"
            ? "border-white/15 bg-white/[0.06]"
            : "border-[#0A1628]/10 bg-white/80"
        }`}
      >
        <div
          className="absolute inset-y-1 left-1 rounded-full bg-gradient-to-r from-[#0A1628] to-[#8C1D2C] transition-[width] duration-75"
          style={{ width: `max(0px, calc(${pct}% - 4px))` }}
        />
        <div
          className="absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-2 border-[#D8C7A4] bg-[#F5F0E6] shadow-md transition-[left] duration-75"
          style={{ left: `clamp(0px, calc(${pct}% - 14px), calc(100% - 28px))` }}
        />
        <div className="pointer-events-none absolute inset-x-3 bottom-0.5 flex justify-between">
          {options.map((n) => (
            <span
              key={n}
              className={`text-[9px] ${
                n <= numeric ? "text-[#D8C7A4]" : "text-[#0A1628]/25"
              }`}
            >
              {n}
            </span>
          ))}
        </div>
      </div>
      <p className={`mt-1.5 text-[10px] ${
          tone === "dark" ? "text-white/30" : "text-[#0A1628]/35"
        }`}>
        Drag to set · arrow keys
      </p>
    </div>
  );
}
