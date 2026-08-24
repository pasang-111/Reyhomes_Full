"use client";

/**
 * Cursor-following spotlight on hero / gallery images (desktop).
 * Soft gold radial reveal over a slightly dimmed base.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Spotlight radius in px */
  radius?: number;
  disabled?: boolean;
};

export default function ImageSpotlight({
  children,
  className = "",
  radius = 220,
  disabled = false,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 50, y: 40 });
  const [active, setActive] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setOk(!reduce && !coarse && !disabled);
  }, [disabled]);

  const onMove = useCallback(
    (e: MouseEvent) => {
      if (!ok || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      setPos({ x, y });
      setActive(true);
    },
    [ok]
  );

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={onMove}
      onMouseLeave={() => setActive(false)}
    >
      {children}
      {ok && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: active ? 1 : 0,
            background: `radial-gradient(${radius}px circle at ${pos.x}% ${pos.y}%, transparent 0%, transparent 35%, rgba(10,22,40,0.45) 70%)`,
            mixBlendMode: "multiply",
          }}
          aria-hidden
        />
      )}
      {ok && active && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(${radius * 0.55}px circle at ${pos.x}% ${pos.y}%, rgba(216,199,164,0.14) 0%, transparent 70%)`,
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
