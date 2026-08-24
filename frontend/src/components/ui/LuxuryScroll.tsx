"use client";

/**
 * Site-wide premium smooth scroll via Lenis.
 * - Skips /pro (ProShell native scroll) and auth pages
 * - Respects prefers-reduced-motion
 * - Publishes scroll events so framer-motion useScroll stays in sync
 * - Gold progress line at top (ScrollProgress)
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 28,
    restDelta: 0.001,
  });
  const opacity = useTransform(scrollYProgress, [0, 0.02, 0.08], [0, 0.4, 1]);

  return (
    <motion.div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[9990] h-[2px] origin-left"
      style={{
        scaleX,
        opacity,
        background:
          "linear-gradient(90deg, transparent, #D8C7A4 20%, #F5F0E6 50%, #D8C7A4 80%, transparent)",
        boxShadow: "0 0 12px rgba(216,199,164,0.35)",
      }}
      aria-hidden
    />
  );
}

export default function LuxuryScroll() {
  const pathname = usePathname() ?? "";
  const lenisRef = useRef<{ destroy: () => void; raf: (t: number) => void; scrollTo: (y: number, o?: object) => void; on: (e: string, cb: () => void) => void } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (prefersReducedMotion()) {
      document.documentElement.style.scrollBehavior = "smooth";
      document.documentElement.classList.remove("rh-luxury-scroll");
      return;
    }

    if (
      pathname.startsWith("/pro") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")
    ) {
      document.documentElement.classList.remove("rh-luxury-scroll");
      document.documentElement.style.scrollBehavior = "";
      return;
    }

    let cancelled = false;
    document.documentElement.classList.add("rh-luxury-scroll");
    document.documentElement.style.scrollBehavior = "auto";

    (async () => {
      try {
        const { default: Lenis } = await import("lenis");
        if (cancelled) return;

        const lenis = new Lenis({
          duration: 1.15,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 1.1,
        });

        lenisRef.current = lenis as typeof lenisRef.current;

        lenis.on("scroll", () => {
          window.dispatchEvent(new Event("scroll"));
        });

        const raf = (time: number) => {
          lenis.raf(time);
          rafRef.current = requestAnimationFrame(raf);
        };
        rafRef.current = requestAnimationFrame(raf);
        lenis.scrollTo(0, { immediate: true });
      } catch {
        document.documentElement.style.scrollBehavior = "smooth";
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try {
        lenisRef.current?.destroy();
      } catch {
        /* ignore */
      }
      lenisRef.current = null;
      document.documentElement.classList.remove("rh-luxury-scroll");
      document.documentElement.style.scrollBehavior = "";
    };
  }, [pathname]);

  return null;
}
