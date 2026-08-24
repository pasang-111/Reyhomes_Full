"use client";

import { useEffect, useRef, useState } from "react";

export default function LuxuryCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const [isInteractive, setIsInteractive] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Disable custom cursor on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const ring = ringRef.current;
    const dot = dotRef.current;

    if (!ring || !dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let ringX = mouseX;
    let ringY = mouseY;

    let animationFrame = 0;

    /*
     * --------------------------------------------------
     * MOUSE MOVEMENT
     * --------------------------------------------------
     */

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      // Dot follows mouse immediately
      dot.style.transform = `
        translate3d(${mouseX}px, ${mouseY}px, 0)
        translate(-50%, -50%)
      `;
    };

    /*
     * --------------------------------------------------
     * SMOOTH RING
     * --------------------------------------------------
     */

    const animate = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      ring.style.transform = `
        translate3d(${ringX}px, ${ringY}px, 0)
        translate(-50%, -50%)
      `;

      animationFrame = requestAnimationFrame(animate);
    };

    /*
     * --------------------------------------------------
     * INTERACTIVE ELEMENTS
     *
     * Images are intentionally ignored.
     * --------------------------------------------------
     */

    const checkInteractive = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        setIsInteractive(false);
        return;
      }

      // Never trigger cursor expansion on images/previews
      const image = target.closest(
        "img, picture, figure, video, canvas, [data-preview]"
      );

      if (image) {
        setIsInteractive(false);
        return;
      }

      const interactive = target.closest(
        [
          "a",
          "button",
          "input",
          "select",
          "textarea",
          "label",
          "[role='button']",
          "[data-cursor='pointer']",
          ".cursor-pointer",
        ].join(",")
      );

      setIsInteractive(!!interactive);
    };

    const handleMouseOver = (event: MouseEvent) => {
      checkInteractive(event.target);
    };

    /*
     * --------------------------------------------------
     * CLICK
     * --------------------------------------------------
     */

    const handleMouseDown = () => {
      setIsDown(true);
    };

    const handleMouseUp = () => {
      setIsDown(false);
    };

    /*
     * --------------------------------------------------
     * WINDOW VISIBILITY
     * --------------------------------------------------
     */

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });

    window.addEventListener("mouseover", handleMouseOver, {
      passive: true,
    });

    window.addEventListener("mousedown", handleMouseDown);

    window.addEventListener("mouseup", handleMouseUp);

    document.addEventListener("mouseleave", handleMouseLeave);

    document.addEventListener("mouseenter", handleMouseEnter);

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);

      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <>
      {/* ==================================================
          OUTER RING
          ================================================== */}

      <div
        ref={ringRef}
        id="lux-cursor-ring"
        aria-hidden="true"
        data-interactive={isInteractive}
        data-down={isDown}
        data-visible={visible}
        className="hidden md:block"
      />

      {/* ==================================================
          CENTER DOT
          ================================================== */}

      <div
        ref={dotRef}
        id="lux-cursor-dot"
        aria-hidden="true"
        data-interactive={isInteractive}
        data-down={isDown}
        data-visible={visible}
        className="hidden md:block"
      />

      <style jsx global>{`
        /* ==================================================
           MAIN CURSOR
           ================================================== */

        #lux-cursor-ring,
        #lux-cursor-dot {
          position: fixed !important;

          pointer-events: none !important;

          /*
           * Higher than product previews, modals,
           * drawers and hover overlays.
           */
          z-index: 2147483647 !important;

          top: 0 !important;
          left: 0 !important;

          user-select: none !important;

          isolation: isolate;
        }

        /* ==================================================
           OUTER RING
           ================================================== */

        #lux-cursor-ring {
          width: 38px;
          height: 38px;

          border-radius: 999px;

          /*
           * Difference makes it automatically visible
           * against BOTH light and dark backgrounds.
           */
          background: transparent;

          border: 1.5px solid white;

          box-shadow:
            0 0 0 1px rgba(0, 0, 0, 0.35),
            0 0 18px rgba(255, 255, 255, 0.15);

          transform: translate3d(-50%, -50%, 0);

          mix-blend-mode: difference;

          opacity: 1;

          transition:
            width 180ms cubic-bezier(0.22, 1, 0.36, 1),
            height 180ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 150ms ease;

          will-change: transform;
        }

        /* ==================================================
           CENTER DOT
           ================================================== */

        #lux-cursor-dot {
          width: 6px;
          height: 6px;

          border-radius: 999px;

          background: white;

          box-shadow:
            0 0 0 1px rgba(0, 0, 0, 0.35),
            0 0 10px rgba(255, 255, 255, 0.5);

          transform: translate3d(-50%, -50%, 0);

          mix-blend-mode: difference;

          opacity: 1;

          transition:
            width 140ms ease,
            height 140ms ease,
            opacity 150ms ease;

          will-change: transform;
        }

        /* ==================================================
           INTERACTIVE ELEMENTS
           ================================================== */

        #lux-cursor-ring[data-interactive="true"] {
          width: 48px;
          height: 48px;
        }

        #lux-cursor-dot[data-interactive="true"] {
          width: 5px;
          height: 5px;
        }

        /* ==================================================
           CLICK STATE
           ================================================== */

        #lux-cursor-ring[data-down="true"] {
          width: 30px;
          height: 30px;
        }

        #lux-cursor-dot[data-down="true"] {
          width: 4px;
          height: 4px;
        }

        /* ==================================================
           HIDDEN OUTSIDE WINDOW
           ================================================== */

        #lux-cursor-ring[data-visible="false"],
        #lux-cursor-dot[data-visible="false"] {
          opacity: 0;
        }

        /* ==================================================
           IMPORTANT:
           IMAGE HOVER NEVER EXPANDS CURSOR
           ================================================== */

        #lux-cursor-ring[data-interactive="false"] {
          width: 38px;
          height: 38px;
        }

        /* ==================================================
           REDUCED MOTION
           ================================================== */

        @media (prefers-reduced-motion: reduce) {
          #lux-cursor-ring,
          #lux-cursor-dot {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}