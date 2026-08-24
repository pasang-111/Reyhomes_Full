"use client";

/**
 * Ambient "blackhole" vortex for the homepage hero.
 * Navy/gold particles spiral inward toward a dark focal core,
 * with a bright gravitational-lensing ring and drifting accretion haze.
 * Canvas 2D (no Three.js) — capped particles, mouse parallax,
 * static fallback when prefers-reduced-motion.
 */

import { useEffect, useRef } from "react";

type Particle = {
  a: number;
  r: number;
  s: number;
  size: number;
  gold: boolean;
  spin: number;
};

type Props = {
  className?: string;
  density?: number;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function HeroVortex({ className = "", density }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMX = 0;
    let targetMY = 0;
    let particles: Particle[] = [];
    let running = true;
    let t0 = performance.now();

    const count =
      density ??
      (typeof window !== "undefined" && window.innerWidth < 768 ? 70 : 150);

    const resize = () => {
      const parent = canvas.parentElement;
      w = parent?.clientWidth || window.innerWidth;
      h = parent?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w * 0.58;
      cy = h * 0.42;
    };

    const spawn = (edge = true): Particle => ({
      a: Math.random() * Math.PI * 2,
      r: edge
        ? 80 + Math.random() * Math.max(w, h) * 0.68
        : 20 + Math.random() * Math.max(w, h) * 0.4,
      s: 0.22 + Math.random() * 0.62,
      size: 0.5 + Math.random() * 2.4,
      gold: Math.random() > 0.5,
      spin: 0.006 + Math.random() * 0.015,
    });

    const init = () => {
      resize();
      particles = Array.from({ length: count }, () => spawn(true));
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMX = (e.clientX - rect.left - cx) / w;
      targetMY = (e.clientY - rect.top - cy) / h;
    };

    const tick = (now: number) => {
      if (!running) return;
      const elapsed = (now - t0) / 1000;
      mouseX += (targetMX - mouseX) * 0.035;
      mouseY += (targetMY - mouseY) * 0.035;

      ctx.clearRect(0, 0, w, h);

      const coreR = Math.min(w, h) * 0.1;

      // Outer ambient haze — sets depth before the core reads
      const haze = ctx.createRadialGradient(cx, cy, coreR * 1.5, cx, cy, Math.max(w, h) * 0.62);
      haze.addColorStop(0, "rgba(18, 30, 52, 0.28)");
      haze.addColorStop(1, "rgba(10, 20, 32, 0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, w, h);

      // Event horizon — dark core, deeper and more absolute
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 5.2);
      core.addColorStop(0, "rgba(0, 1, 4, 1)");
      core.addColorStop(0.18, "rgba(2, 5, 12, 0.97)");
      core.addColorStop(0.4, "rgba(6, 11, 22, 0.65)");
      core.addColorStop(0.62, "rgba(10, 22, 40, 0.28)");
      core.addColorStop(1, "rgba(7, 8, 10, 0)");
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, w, h);

      // Gravitational lensing rings — bright, thin, slightly warped ellipses
      const ringPulse = 1 + Math.sin(elapsed * 0.6) * 0.02;
      for (let i = 0; i < 3; i++) {
        const rr = coreR * (1.55 + i * 0.42) * ringPulse;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          rr,
          rr * 0.42,
          elapsed * 0.05 + i * 0.35,
          0,
          Math.PI * 2
        );
        const ringAlpha = 0.16 - i * 0.04;
        ctx.strokeStyle =
          i === 0
            ? `rgba(232, 217, 184, ${ringAlpha + 0.05})`
            : `rgba(216, 199, 164, ${ringAlpha})`;
        ctx.lineWidth = i === 0 ? 1.4 : 0.8;
        ctx.stroke();
      }

      for (const p of particles) {
        p.a += p.spin * (1 + (1 - Math.min(1, p.r / 400)) * 2.1);
        p.r -= p.s * (0.85 + (1 - Math.min(1, p.r / 500)) * 1.6);
        if (p.r < coreR * 0.8) {
          Object.assign(p, spawn(true));
        }

        const px = cx + Math.cos(p.a) * p.r + mouseX * 40;
        const py = cy + Math.sin(p.a) * p.r * 0.66 + mouseY * 24;
        const falloff = Math.min(1, p.r / (Math.max(w, h) * 0.35));
        const alpha = 0.14 + falloff * 0.62;

        // Trail toward center
        const tx = cx + Math.cos(p.a - 0.16) * (p.r + 10);
        const ty = cy + Math.sin(p.a - 0.16) * (p.r + 10) * 0.66;
        ctx.strokeStyle = p.gold
          ? `rgba(216, 199, 164, ${alpha * 0.3})`
          : `rgba(120, 150, 190, ${alpha * 0.22})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.stroke();

        ctx.fillStyle = p.gold
          ? `rgba(238, 224, 190, ${alpha})`
          : `rgba(159, 184, 217, ${alpha * 0.88})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Soft glow for the brightest gold particles
        if (p.gold && p.size > 1.6) {
          ctx.fillStyle = `rgba(238, 224, 190, ${alpha * 0.12})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    init();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    />
  );
}