"use client";

import { useRef, type ReactNode, type HTMLAttributes } from "react";

type Props = {
  children: ReactNode;
  strength?: number;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Subtle magnetic pull toward the cursor on hover (desktop only).
 */
export default function Magnetic({
  children,
  strength = 0.28,
  className = "",
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "translate3d(0,0,0)";
  };

  return (
    <div
      ref={ref}
      className={`inline-block transition-transform duration-300 ease-out will-change-transform ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </div>
  );
}
