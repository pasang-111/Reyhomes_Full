"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import type { HomeDesign } from "@/types/home";
import type { HomeLandPackage } from "@/types/land";

import { getDesignBySlug } from "@/lib/api/designs";
import { getPackageBySlug } from "@/lib/api/packages";

import WishlistButton from "@/components/auth/WishlistButton";

type PreviewData = {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  price?: string;
  image?: string | null;
  beds?: number | string;
  baths?: number | string;
  garage?: number | string;
  landSize?: string | number | null;
  houseSize?: string | number | null;
  features?: string[];
};

type PreviewPosition = {
  left: number;
  top: number;
  placement: "bottom" | "top";
};

type Props = {
  kind: "design" | "package";
  slug: string;
  href: string;
  children: React.ReactNode;
};

const cache = new Map<string, PreviewData | null>();

const PREVIEW_WIDTH = 300;

/*
 * Keep the preview close to the trigger.
 *
 * The old value of 14px created a large gap that
 * made the mouse leave the trigger before reaching
 * the preview.
 */
const PREVIEW_GAP = 4;

const VIEWPORT_PADDING = 16;

/*
 * These delays control how eager the preview is.
 *
 * OPEN_DELAY is intentionally longer than a typical
 * tooltip so a mouse just passing over a card doesn't
 * trigger it — the person has to actually pause on it.
 */
const OPEN_DELAY = 380;
const CLOSE_DELAY_FROM_TRIGGER = 450;
const CLOSE_DELAY_FROM_PREVIEW = 350;

function designToPreview(
  home: HomeDesign
): PreviewData {
  return {
    id: Number(
      (home as any).id ??
        (home as any).pk ??
        0
    ),

    title:
      home.name ||
      home.title ||
      home.slug,

    subtitle: home.subtitle,

    description:
      home.description,

    category:
      home.category,

    price:
      home.price,

    image:
      home.hero_image_url ??
      home.image,

    beds:
      home.beds,

    baths:
      home.baths,

    garage:
      home.garage,

    landSize:
      home.land_size,

    houseSize:
      home.houseSize ??
      home.house_size,

    features:
      (home.features ?? [])
        .map((item) =>
          typeof item === "string"
            ? item
            : item.title
        )
        .filter(Boolean)
        .slice(0, 4),
  };
}

function packageToPreview(
  pkg: HomeLandPackage
): PreviewData {
  return {
    id: Number(
      (pkg as any).id ??
        (pkg as any).pk ??
        0
    ),

    title:
      pkg.title ||
      pkg.slug,

    description:
      pkg.description,

    category:
      pkg.category,

    price:
      pkg.price,

    image:
      pkg.hero_image_url ??
      pkg.heroImage ??
      pkg.image,

    beds:
      pkg.beds,

    baths:
      pkg.baths,

    garage:
      pkg.garage,

    landSize:
      pkg.landSize,

    houseSize:
      pkg.houseSize,

    features:
      (pkg.features ?? [])
        .map((item) =>
          typeof item === "string"
            ? item
            : item.title
        )
        .filter(Boolean)
        .slice(0, 4),
  };
}

export default function SlugHoverPreview({
  kind,
  slug,
  href,
  children,
}: Props) {
  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [data, setData] =
    useState<PreviewData | null>(null);

  const [mounted, setMounted] =
    useState(false);

  const [position, setPosition] =
    useState<PreviewPosition>({
      left: VIEWPORT_PADDING,
      top: VIEWPORT_PADDING,
      placement: "bottom",
    });

  /*
   * Trigger/card element.
   */
  const triggerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /*
   * Timers control the forgiving hover
   * interaction.
   */
  const closeTimer =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const openTimer =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  /*
   * Keep track of whether the pointer is
   * currently inside the trigger or preview.
   *
   * This prevents accidental closing while
   * moving between the two.
   */
  const triggerHovered =
    useRef(false);

  const previewHovered =
    useRef(false);

  /*
   * Mounted state for createPortal.
   */
  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /*
   * ============================================================
   * TIMER HELPERS
   * ============================================================
   */

  const clearTimers = () => {
    if (closeTimer.current) {
      clearTimeout(
        closeTimer.current
      );

      closeTimer.current = null;
    }

    if (openTimer.current) {
      clearTimeout(
        openTimer.current
      );

      openTimer.current = null;
    }
  };

  /*
   * ============================================================
   * SAFE CLOSE
   * ============================================================
   *
   * Only close if the mouse is no longer over
   * either the card OR the preview.
   */

  const scheduleClose = (
    delay: number
  ) => {
    clearTimers();

    closeTimer.current =
      setTimeout(() => {
        if (
          triggerHovered.current ||
          previewHovered.current
        ) {
          return;
        }

        setOpen(false);
      }, delay);
  };

  /*
   * ============================================================
   * POSITION
   * ============================================================
   */

  const updatePosition = () => {
    const element =
      triggerRef.current;

    if (!element) return;

    const rect =
      element.getBoundingClientRect();

    const viewportWidth =
      window.innerWidth;

    const viewportHeight =
      window.innerHeight;

    const width = Math.min(
      PREVIEW_WIDTH,
      viewportWidth -
        VIEWPORT_PADDING * 2
    );

    /*
     * Estimate card height.
     *
     * This is only used for deciding whether
     * to open above or below the trigger.
     */
    const estimatedHeight = 300;

    /*
     * Center preview relative to trigger.
     */
    let left =
      rect.left +
      rect.width / 2 -
      width / 2;

    /*
     * Keep preview inside viewport.
     */
    left = Math.max(
      VIEWPORT_PADDING,
      Math.min(
        left,
        viewportWidth -
          width -
          VIEWPORT_PADDING
      )
    );

    const spaceBelow =
      viewportHeight -
      rect.bottom;

    const spaceAbove =
      rect.top;

    /*
     * Prefer below unless there isn't enough
     * room and there is more space above.
     */
    const openAbove =
      spaceBelow <
        estimatedHeight +
          PREVIEW_GAP &&
      spaceAbove > spaceBelow;

    let top: number;

    if (openAbove) {
      top = Math.max(
        VIEWPORT_PADDING,
        rect.top -
          estimatedHeight -
          PREVIEW_GAP
      );
    } else {
      top = Math.min(
        rect.bottom +
          PREVIEW_GAP,
        viewportHeight -
          estimatedHeight -
          VIEWPORT_PADDING
      );

      top = Math.max(
        VIEWPORT_PADDING,
        top
      );
    }

    setPosition({
      left,
      top,
      placement: openAbove
        ? "top"
        : "bottom",
    });
  };

  /*
   * ============================================================
   * POSITION LISTENERS
   * ============================================================
   */

  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();

    const handleResize = () => {
      updatePosition();
    };

    const handleScroll = () => {
      updatePosition();
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    window.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );
    };
  }, [open, data]);

  /*
   * ============================================================
   * CLEANUP
   * ============================================================
   */

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  /*
   * ============================================================
   * LOAD PREVIEW
   * ============================================================
   */

  const loadPreview = async () => {
    setOpen(true);

    requestAnimationFrame(() => {
      updatePosition();
    });

    const cacheKey =
      `${kind}:${slug}`;

    const cached =
      cache.get(cacheKey);

    /*
     * Cached result.
     */
    if (cached !== undefined) {
      setData(cached);
      setLoading(false);

      requestAnimationFrame(() => {
        updatePosition();
      });

      return;
    }

    setLoading(true);

    try {
      const item =
        kind === "design"
          ? await getDesignBySlug(
              slug
            )
          : await getPackageBySlug(
              slug
            );

      const preview =
        item
          ? kind === "design"
            ? designToPreview(
                item as HomeDesign
              )
            : packageToPreview(
                item as HomeLandPackage
              )
          : null;

      cache.set(
        cacheKey,
        preview
      );

      setData(preview);

      requestAnimationFrame(() => {
        updatePosition();
      });
    } catch {
      cache.set(
        cacheKey,
        null
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * TRIGGER HOVER
   * ============================================================
   */

  const enterTrigger = () => {
    triggerHovered.current =
      true;

    clearTimers();

    /*
     * Don't restart the preview if it is
     * already open.
     */
    if (open) {
      return;
    }

    openTimer.current =
      setTimeout(() => {
        if (
          triggerHovered.current
        ) {
          loadPreview();
        }
      }, OPEN_DELAY);
  };

  const leaveTrigger = () => {
    triggerHovered.current =
      false;

    clearTimers();

    /*
     * Give the mouse plenty of time to
     * travel from the card to the preview.
     */
    scheduleClose(
      CLOSE_DELAY_FROM_TRIGGER
    );
  };

  /*
   * ============================================================
   * PREVIEW HOVER
   * ============================================================
   */

  const enterPreview = () => {
    previewHovered.current =
      true;

    /*
     * Cancel any pending close.
     */
    clearTimers();
  };

  const leavePreview = () => {
    previewHovered.current =
      false;

    /*
     * Give the user time to move back
     * toward the card if desired.
     */
    scheduleClose(
      CLOSE_DELAY_FROM_PREVIEW
    );
  };

  /*
   * ============================================================
   * WISHLIST ENTRY
   * ============================================================
   *
   * IMPORTANT:
   * Use the REAL database ID from the
   * loaded preview data.
   */

  const previewWishlistEntry =
    data
      ? {
          kind:
            kind === "design"
              ? ("design" as const)
              : ("land" as const),

          id: data.id,

          slug,

          name:
            data.title,

          image:
            data.image ?? "",

          price:
            data.price ?? "",
        }
      : null;

  /*
   * ============================================================
   * PREVIEW
   * ============================================================
   */

  const preview = (
    <AnimatePresence>
      {open && (
        <motion.div
          key={`${kind}-${slug}`}

          initial={{
            opacity: 0,
            y:
              position.placement ===
              "top"
                ? 18
                : -18,
            scale: 0.94,
            filter:
              "blur(12px)",
          }}

          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter:
              "blur(0px)",
          }}

          exit={{
            opacity: 0,
            y:
              position.placement ===
              "top"
                ? 10
                : -10,
            scale: 0.97,
            filter:
              "blur(8px)",
          }}

          transition={{
            duration: 0.32,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}

          onMouseEnter={
            enterPreview
          }

          onMouseLeave={
            leavePreview
          }

          /*
           * Stop preview interactions from
           * bubbling back to the card.
           */
          onClick={(event) => {
            event.stopPropagation();
          }}

          /*
           * py-2 creates an invisible hover
           * bridge around the visual card.
           */
          /*
           * z-40 sits above normal page content but below
           * dialogs/modals (which should use z-50+), so a
           * login dialog or similar always wins.
           */
          className="pointer-events-auto fixed z-40 w-[calc(100vw-32px)] max-w-[300px] py-2"

          style={{
            left:
              position.left,

            top:
              position.top,
          }}
        >
          <div className="relative overflow-hidden rounded-[18px] border border-[#B3202F]/25 bg-[#0A0607] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,.7)]">

            {/* Ambient glow — deep red, kept subtle at this size */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-[#B3202F]/15 blur-2xl" />

            <div className="pointer-events-none absolute -bottom-12 -right-10 h-32 w-32 rounded-full bg-[#6E0E1B]/20 blur-2xl" />

            <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#E5484D] to-transparent" />

            {/* ================================================= */}
            {/* IMAGE */}
            {/* ================================================= */}

            <div className="relative overflow-hidden rounded-[14px] border border-white/10">

              {data?.image ? (
                <div
                  className="h-24 w-full bg-cover bg-center transition-transform duration-700 hover:scale-[1.03]"
                  style={{
                    backgroundImage:
                      `url("${data.image}")`,
                  }}
                />
              ) : (
                <div className="h-24 w-full bg-[radial-gradient(circle_at_30%_20%,rgba(179,32,47,.22),transparent_30%),linear-gradient(135deg,#1A0B0E,#0A0607)]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0607] via-[#0A0607]/10 to-transparent" />

              {/* ================================================= */}
              {/* WISHLIST */}
              {/* ================================================= */}

              {previewWishlistEntry && (
                <div
                  className="absolute right-2.5 top-2.5 z-[5] scale-90"
                  onMouseEnter={() => {
                    /*
                     * Make absolutely sure the preview
                     * doesn't close while entering the
                     * wishlist button.
                     */
                    previewHovered.current =
                      true;

                    clearTimers();
                  }}
                  onMouseLeave={() => {
                    previewHovered.current =
                      true;
                  }}
                >
                  <WishlistButton
                    size="sm"
                    entry={
                      previewWishlistEntry
                    }
                  />
                </div>
              )}

              {/* ================================================= */}
              {/* IMAGE TITLE */}
              {/* ================================================= */}

              <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none">
                <p className="text-[8px] font-bold uppercase tracking-[.3em] text-[#E5484D]">
                  {data?.category ??
                    (kind === "design"
                      ? "Home Design"
                      : "Home & Land")}
                </p>

                <h4 className="mt-0.5 truncate font-display text-base leading-tight text-[#F8F5F0]">
                  {data?.title ??
                    slug.replace(
                      /-/g,
                      " "
                    )}
                </h4>
              </div>
            </div>

            {/* ================================================= */}
            {/* CONTENT */}
            {/* ================================================= */}

            <div className="relative p-3">

              {loading ? (
                <div className="space-y-2 py-1">

                  <div className="h-2.5 w-full animate-pulse rounded-full bg-white/10" />

                  <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-white/10" />

                  <div className="flex gap-1.5 pt-1">
                    {[1, 2, 3].map(
                      (item) => (
                        <div
                          key={item}
                          className="h-5 w-14 animate-pulse rounded-full bg-white/5"
                        />
                      )
                    )}
                  </div>

                </div>
              ) : data ? (
                <>

                  {/* ================================================= */}
                  {/* DESCRIPTION — the reason this preview exists;
                      specs and price are already on the card itself */}
                  {/* ================================================= */}

                  {data.description ? (
                    <p className="line-clamp-4 text-[13px] leading-5 text-white/65">
                      {data.description}
                    </p>
                  ) : (
                    <p className="text-[13px] italic leading-5 text-white/35">
                      No description available yet.
                    </p>
                  )}

                  {/* ================================================= */}
                  {/* FEATURES — the other thing not on the card */}
                  {/* ================================================= */}

                  {data.features &&
                    data.features.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">

                        {data.features.map(
                          (feature) => (
                            <span
                              key={feature}
                              className="rounded-full border border-[#E5484D]/15 bg-[#E5484D]/[.06] px-2 py-0.5 text-[9px] text-[#F3A7A7]"
                            >
                              {feature}
                            </span>
                          )
                        )}

                      </div>
                    )}

                  {/* ================================================= */}
                  {/* CTA */}
                  {/* ================================================= */}

                  <a
                    href={href}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    className="mt-3 flex items-center justify-between rounded-full border border-[#E5484D]/25 bg-[#E5484D]/[.09] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-[#F3A7A7] transition hover:border-[#E5484D]/50 hover:bg-[#E5484D]/[.16] hover:text-[#FBD5D5]"
                  >
                    <span>See full details</span>
                    <ArrowUpRight size={12} />
                  </a>

                </>
              ) : (
                <div className="py-1">

                  <p className="text-xs text-white/40">
                    Preview
                    unavailable.
                  </p>

                  <a
                    href={href}
                    onClick={(
                      event
                    ) =>
                      event.stopPropagation()
                    }
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#E5484D]"
                  >
                    Open full
                    page

                    <ArrowUpRight
                      size={12}
                    />
                  </a>

                </div>
              )}

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /*
   * ============================================================
   * TRIGGER
   * ============================================================
   */

  return (
    <div
      ref={triggerRef}
      className="group/preview relative z-[1]"
      onMouseEnter={
        enterTrigger
      }
      onMouseLeave={
        leaveTrigger
      }
    >
      {children}

      {mounted &&
        typeof document !==
          "undefined" &&
        createPortal(
          preview,
          document.body
        )}
    </div>
  );
}