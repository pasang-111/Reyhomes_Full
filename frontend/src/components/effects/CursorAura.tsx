"use client";

/**
 * Soft gold/navy cursor aura for marketing pages.
 * Disabled on touch devices and prefers-reduced-motion.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function shouldSkip(pathname: string) {
  if (pathname.startsWith("/pro")) return true;
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) return true;
  return false;
}

export default function CursorAura() {
  const pathname = usePathname() ?? "";
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (shouldSkip(pathname)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      pos.current.tx = e.clientX;
      pos.current.ty = e.clientY;
    };

    const tick = () => {
      pos.current.x += (pos.current.tx - pos.current.x) * 0.12;
      pos.current.y += (pos.current.ty - pos.current.y) * 0.12;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.tx - 3}px, ${pos.current.ty - 3}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pos.current.x - 22}px, ${pos.current.y - 22}px, 0)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [pathname]);

  if (shouldSkip(pathname)) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9000] hidden md:block" aria-hidden>
      <div
        ref={dotRef}
        className="absolute h-[6px] w-[6px] rounded-full bg-[#D8C7A4] shadow-[0_0_12px_rgba(216,199,164,0.7)]"
      />
      <div
        ref={ringRef}
        className="absolute h-11 w-11 rounded-full border border-[#D8C7A4]/35 bg-[#D8C7A4]/[0.04]"
      />
    </div>
  );
}
