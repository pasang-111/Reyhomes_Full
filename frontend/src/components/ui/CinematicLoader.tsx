"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";

const EASE_OUT = [
  0.16,
  1,
  0.3,
  1,
] as const;

const COLOR = {
  void: "#020810",
  cream: "#F8F5F0",
  brass: "#D8C7A4",
  navy: "#0C2A44",
  glow: "rgba(30, 110, 170, 0.4)",
};

const DEFAULT_EXCLUDE = [
  "/login",
  "/register",
  "/pro",
] as const;

const DEFAULT_INCLUDE = [
  "/",
  "/account",
] as const;

const ROUTE_LOADED_KEY = "reyhomes_route_loaded";

function hasLoadedRoute(pathname: string) {
  try {
    return sessionStorage.getItem(`${ROUTE_LOADED_KEY}:${pathname}`) === "1";
  } catch {
    return false;
  }
}

function markRouteLoaded(pathname: string) {
  try {
    sessionStorage.setItem(`${ROUTE_LOADED_KEY}:${pathname}`, "1");
  } catch {}
}

/* ------------------------------------------------------------------ */
/* LOADER AUDIO                                                       */
/* ------------------------------------------------------------------ */

function playLoaderEntry() {
  try {
    const AC =
      window.AudioContext ||
      (
        window as unknown as {
          webkitAudioContext: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AC) return;

    const ctx = new AC();

    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const makeTone = (
      frequency: number,
      delay: number,
      duration: number,
      volume: number,
      type: OscillatorType = "sine"
    ) => {
      const osc =
        ctx.createOscillator();

      const gain =
        ctx.createGain();

      osc.type = type;

      osc.frequency.setValueAtTime(
        frequency,
        now + delay
      );

      gain.gain.setValueAtTime(
        0.0001,
        now + delay
      );

      gain.gain.exponentialRampToValueAtTime(
        volume,
        now + delay + 0.04
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + delay + duration
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(
        now + delay
      );

      osc.stop(
        now +
          delay +
          duration +
          0.05
      );
    };

    // Deep arrival
    makeTone(
      55,
      0,
      0.7,
      0.045
    );

    // Warm body
    makeTone(
      110,
      0.035,
      0.45,
      0.018,
      "triangle"
    );

    // Brand tone
    makeTone(
      220,
      0.08,
      0.5,
      0.012
    );

    // Upward resolution
    makeTone(
      329.63,
      0.16,
      0.65,
      0.009
    );

    makeTone(
      440,
      0.27,
      0.8,
      0.007
    );

    // Soft shimmer
    makeTone(
      880,
      0.34,
      0.75,
      0.004
    );

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1800);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* LOADER                                                             */
/* ------------------------------------------------------------------ */

export type CinematicLoaderProps = {
  active: boolean;
  message?: string;
  progress?: number;
  logoSrc?: string;
  minDuration?: number;
  onExited?: () => void;
  variant?: "boot" | "route" | "overlay";
};

export function CinematicLoader({
  active,
  message,
  progress,
  logoSrc = "/image/team/reyhomes.png",
  minDuration = 600,
  onExited,
  variant = "overlay",
}: CinematicLoaderProps) {
  const [mounted, setMounted] =
    useState(active);

  const [exiting, setExiting] =
    useState(false);

  const [logoFailed, setLogoFailed] =
    useState(false);

  const shownAt =
    useRef<number>(0);

  const exitTimer =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const hardTimer =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const onExitedRef =
    useRef(onExited);

  onExitedRef.current =
    onExited;

  const clearExitTimers =
    useCallback(() => {
      if (exitTimer.current) {
        clearTimeout(
          exitTimer.current
        );

        exitTimer.current =
          null;
      }

      if (hardTimer.current) {
        clearTimeout(
          hardTimer.current
        );

        hardTimer.current =
          null;
      }
    }, []);

  const forceUnmount =
    useCallback(() => {
      clearExitTimers();

      setExiting(false);
      setMounted(false);

      onExitedRef.current?.();
    }, [clearExitTimers]);

  useEffect(() => {
    if (active) {
      clearExitTimers();

      setExiting(false);
      setMounted(true);

      shownAt.current =
        Date.now();

      if (
        variant === "boot"
      ) {
        playLoaderEntry();
      }

      hardTimer.current =
        setTimeout(
          forceUnmount,
          Math.max(
            minDuration + 4000,
            8000
          )
        );

      return () =>
        clearExitTimers();
    }

    if (!mounted) return;

    const elapsed =
      Date.now() -
      shownAt.current;

    const wait = Math.max(
      0,
      minDuration - elapsed
    );

    exitTimer.current =
      setTimeout(() => {
        setExiting(true);

        exitTimer.current =
          setTimeout(() => {
            setMounted(false);
            setExiting(false);

            onExitedRef.current?.();
          }, 700);
      }, wait);

    return () =>
      clearExitTimers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    active,
    minDuration,
    variant,
    forceUnmount,
    clearExitTimers,
  ]);

  if (!mounted) return null;

  const indeterminate =
    progress === undefined;

  const pct = Math.max(
    0,
    Math.min(
      100,
      progress ?? 0
    )
  );

  return (
    <AnimatePresence>
      {mounted && (
        <motion.div
          key="cinematic-loader"
          className="fixed inset-0 z-[9500] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              COLOR.void,
          }}
          initial={{
            opacity: 1,
          }}
          animate={{
            opacity:
              exiting ? 0 : 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.65,
            ease: EASE_OUT,
          }}
          aria-busy="true"
          aria-live="polite"
          role="status"
        >
          {/* Grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.72) 100%)",
            }}
          />

          {/* Central glow */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[42%] h-[40vmin] w-[40vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                `radial-gradient(
                  circle,
                  ${COLOR.glow} 0%,
                  transparent 70%
                )`,
              filter:
                "blur(48px)",
            }}
            animate={{
              scale: [
                1,
                1.12,
                1,
              ],
              opacity: [
                0.55,
                0.85,
                0.55,
              ],
            }}
            transition={{
              duration: 3.2,
              repeat:
                Infinity,
              ease:
                "easeInOut",
            }}
          />

          {/* Main content */}
          <motion.div
            className="relative z-10 flex flex-col items-center px-6"
            initial={{
              opacity: 0,
              y: 16,
              filter:
                "blur(8px)",
            }}
            animate={{
              opacity:
                exiting ? 0 : 1,

              y:
                exiting
                  ? -12
                  : 0,

              filter:
                exiting
                  ? "blur(6px)"
                  : "blur(0px)",

              scale:
                exiting
                  ? 1.04
                  : 1,
            }}
            transition={{
              duration: 0.7,
              ease: EASE_OUT,
            }}
          >
            {/* Logo */}
            {!logoFailed ? (
              <Image
                src={logoSrc}
                alt="ReyHomes"
                width={280}
                height={84}
                priority
                className="h-12 w-auto object-contain sm:h-14"
                style={{
                  maxWidth:
                    "min(60vw, 260px)",

                  filter:
                    "drop-shadow(0 0 32px rgba(216,199,164,0.2))",
                }}
                onError={() =>
                  setLogoFailed(
                    true
                  )
                }
              />
            ) : (
              <span
                className="text-2xl font-light tracking-tight"
                style={{
                  fontFamily:
                    '"Playfair Display", "Cormorant Garamond", Georgia, serif',
                  color:
                    COLOR.cream,
                }}
              >
                ReyHomes
              </span>
            )}

            {/* Divider */}
            <motion.div
              className="mt-7 h-px origin-center"
              style={{
                width: 64,
                background:
                  `linear-gradient(
                    90deg,
                    transparent,
                    ${COLOR.brass},
                    transparent
                  )`,
              }}
              initial={{
                scaleX: 0,
                opacity: 0,
              }}
              animate={{
                scaleX: 1,
                opacity: 1,
              }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: EASE_OUT,
              }}
            />

            {/* Message */}
            <AnimatePresence
              mode="wait"
            >
              {message && (
                <motion.p
                  key={message}
                  className="mt-5 text-center text-[11px] uppercase tracking-[0.35em]"
                  style={{
                    color:
                      "rgba(248,245,240,0.45)",
                  }}
                  initial={{
                    opacity: 0,
                    y: 6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -4,
                  }}
                  transition={{
                    duration: 0.35,
                  }}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Progress */}
            <div
              className="relative mt-8 h-[2px] w-[min(52vw,220px)] overflow-hidden rounded-full"
              style={{
                background:
                  "rgba(248,245,240,0.08)",
              }}
            >
              {indeterminate ? (
                <motion.div
                  className="absolute inset-y-0 w-1/3 rounded-full"
                  style={{
                    background:
                      `linear-gradient(
                        90deg,
                        transparent,
                        ${COLOR.brass},
                        transparent
                      )`,
                  }}
                  animate={{
                    left: [
                      "-35%",
                      "100%",
                    ],
                  }}
                  transition={{
                    duration: 1.35,
                    repeat:
                      Infinity,
                    ease:
                      "easeInOut",
                  }}
                />
              ) : (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background:
                      `linear-gradient(
                        90deg,
                        ${COLOR.brass}88,
                        ${COLOR.cream}
                      )`,

                    boxShadow:
                      `0 0 12px ${COLOR.brass}55`,
                  }}
                  initial={{
                    width: "0%",
                  }}
                  animate={{
                    width:
                      `${pct}%`,
                  }}
                  transition={{
                    duration: 0.45,
                    ease: EASE_OUT,
                  }}
                />
              )}
            </div>

            {/* Percentage */}
            {!indeterminate && (
              <p
                className="mt-3 tabular-nums text-[10px] tracking-[0.2em]"
                style={{
                  color:
                    "rgba(248,245,240,0.3)",
                }}
              >
                {Math.round(
                  pct
                )}
                %
              </p>
            )}
          </motion.div>

          {/* Boot tagline */}
          {variant ===
            "boot" && (
            <motion.p
              className="absolute bottom-10 text-[9px] uppercase tracking-[0.5em]"
              style={{
                color:
                  "rgba(248,245,240,0.22)",
              }}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity:
                  exiting ? 0 : 1,
              }}
              transition={{
                delay: 0.5,
                duration: 0.8,
              }}
            >
              Architecture for
              the way you live
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* ROUTE TRANSITION                                                   */
/* ------------------------------------------------------------------ */

export type RouteTransitionLoaderProps = {
  minDuration?: number;
  settleMs?: number;
  logoSrc?: string;

  excludePaths?: readonly string[];

  includePaths?: readonly string[];

  includeOnly?: boolean;
};

function pathMatchesInclude(
  pathname: string,
  includePaths: readonly string[]
): boolean {
  for (const p of includePaths) {
    if (p === "/") {
      if (pathname === "/") {
        return true;
      }

      continue;
    }

    if (
      pathname === p ||
      pathname.startsWith(
        p + "/"
      )
    ) {
      return true;
    }
  }

  return false;
}

export function RouteTransitionLoader({
  minDuration = 500,
  settleMs = 180,
  logoSrc,
  excludePaths =
    DEFAULT_EXCLUDE,
  includePaths =
    DEFAULT_INCLUDE,
  includeOnly = true,
}: RouteTransitionLoaderProps) {
  const pathname =
    usePathname() || "/";

  const [active, setActive] =
    useState(false);

  const [message, setMessage] =
    useState("Loading");

  const prevPath =
    useRef(pathname);

  const first =
    useRef(true);

  const excludeKey =
    excludePaths.join("|");

  const includeKey =
    includePaths.join("|");

  useEffect(() => {
    if (first.current) {
      first.current = false;

      prevPath.current =
        pathname;

      return;
    }

    if (
      pathname ===
      prevPath.current
    ) {
      return;
    }

    /* Excluded */
    if (
      excludePaths.some(
        (p) =>
          pathname.startsWith(p)
      )
    ) {
      prevPath.current =
        pathname;

      setActive(false);

      return;
    }

    /* Allowlist */
    if (
      includeOnly &&
      !pathMatchesInclude(
        pathname,
        includePaths
      )
    ) {
      prevPath.current =
        pathname;

      setActive(false);

      return;
    }

    prevPath.current =
      pathname;

    // Only show the route loader the first time a route is visited
    // during this browser session. Returning to Home will not replay it.
    if (hasLoadedRoute(pathname)) {
      setActive(false);
      return;
    }

    markRouteLoaded(pathname);

    setMessage(
      pathname === "/"
        ? "ReyHomes"
        : pathname.startsWith(
              "/account"
            )
          ? "Your account"
          : "Loading"
    );

    setActive(true);

    const t = setTimeout(
      () => {
        setActive(false);
      },
      minDuration +
        settleMs
    );

    const hard = setTimeout(
      () => {
        setActive(false);
      },
      minDuration +
        settleMs +
        3000
    );

    return () => {
      clearTimeout(t);
      clearTimeout(hard);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pathname,
    minDuration,
    settleMs,
    excludeKey,
    includeKey,
    includeOnly,
  ]);

  return (
    <CinematicLoader
      active={active}
      message={message}
      variant="route"
      minDuration={minDuration}
      logoSrc={logoSrc}
    />
  );
}

/* ------------------------------------------------------------------ */
/* BOOT LOADER                                                        */
/* ------------------------------------------------------------------ */

export type BootLoaderProps = {
  duration?: number;
  logoSrc?: string;
  message?: string;
  children?: ReactNode;
};

export function BootLoader({
  duration = 1800,
  logoSrc,
  message = "ReyHomes",
  children,
}: BootLoaderProps) {
  const [active, setActive] =
    useState(true);

  const [progress, setProgress] =
    useState(0);

  useEffect(() => {
    const start =
      Date.now();

    let raf = 0;

    const tick = () => {
      const t = Math.min(
        1,
        (Date.now() -
          start) /
          duration
      );

      setProgress(
        (1 -
          Math.pow(
            1 - t,
            3
          )) *
          100
      );

      if (t < 1) {
        raf =
          requestAnimationFrame(
            tick
          );
      } else {
        setActive(false);
      }
    };

    raf =
      requestAnimationFrame(
        tick
      );

    return () =>
      cancelAnimationFrame(
        raf
      );
  }, [duration]);

  return (
    <>
      <CinematicLoader
        active={active}
        progress={progress}
        message={message}
        variant="boot"
        minDuration={duration}
        logoSrc={logoSrc}
      />

      {children}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* HOOK                                                               */
/* ------------------------------------------------------------------ */

export function useCinematicLoading(
  defaultMessage = "Loading"
) {
  const [active, setActive] =
    useState(false);

  const [message, setMessage] =
    useState(
      defaultMessage
    );

  const [progress, setProgress] =
    useState<number | undefined>(
      undefined
    );

  const show = useCallback(
    (msg?: string) => {
      if (msg) {
        setMessage(msg);
      }

      setProgress(undefined);
      setActive(true);
    },
    []
  );

  const hide = useCallback(
    () => {
      setActive(false);
    },
    []
  );

  const setPct = useCallback(
    (n: number) => {
      setProgress(
        Math.max(
          0,
          Math.min(100, n)
        )
      );
    },
    []
  );

  const Loader = useCallback(
    () => (
      <CinematicLoader
        active={active}
        message={message}
        progress={progress}
        variant="overlay"
      />
    ),
    [
      active,
      message,
      progress,
    ]
  );

  return {
    active,
    show,
    hide,
    setProgress: setPct,
    setMessage,
    Loader,
  };
}

export default CinematicLoader;