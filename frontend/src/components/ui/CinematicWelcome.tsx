"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";

const EASE = [0.16, 1, 0.3, 1] as const;

const SETTLE = {
  type: "spring",
  stiffness: 120,
  damping: 16,
  mass: 0.9,
} as const;

export const ARM_KEY = "reyhomes_cinematic_welcome";
export const ARM_EVENT = "reyhomes:cinematic-welcome";
const FIRST_VISIT_SHOWN_KEY = "reyhomes_cinematic_welcome_shown";

type WelcomeVariant = "first_visit" | "login" | "register";

type Phase =
  | "void"
  | "logo"
  | "eyebrow"
  | "title"
  | "subtitle"
  | "tagline"
  | "exit";

type Props = {
  logoSrc?: string;
  onComplete?: () => void;
  enableFirstVisit?: boolean;
};

const COPY: Record<
  WelcomeVariant,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    tagline: string;
    speech: string;
  }
> = {
  first_visit: {
    eyebrow: "EST. FOR THOSE WHO BUILD DIFFERENTLY",
    title: "Welcome to ReyHomes",
    subtitle:
      "A quieter way to discover homes, land and residences shaped with intention.",
    tagline: "Your luxury residential journey begins here",
    speech: "Welcome to Rey Homes. Architecture for the way you live.",
  },
  login: {
    eyebrow: "THANK YOU FOR SIGNING IN",
    title: "Welcome back",
    subtitle:
      "Your saved favourites, enquiries and private residential space are ready.",
    tagline: "Continue your luxury residential experience",
    speech: "Thank you for signing in. Welcome back to Rey Homes.",
  },
  register: {
    eyebrow: "YOU'RE ONE OF US NOW",
    title: "Welcome to ReyHomes",
    subtitle:
      "Your private space for favourites, enquiries and builds is ready.",
    tagline: "Save what you love. Build what matters.",
    speech: "Welcome to Rey Homes. Your journey home begins here.",
  },
};

const DUST = [
  { top: "20%", left: "18%", size: 2, delay: 0, duration: 8 },
  { top: "32%", left: "80%", size: 1.5, delay: 1.4, duration: 9 },
  { top: "64%", left: "12%", size: 1.5, delay: 0.7, duration: 7.5 },
  { top: "72%", left: "86%", size: 2, delay: 2.1, duration: 8.5 },
  { top: "46%", left: "50%", size: 1, delay: 3, duration: 10 },
  { top: "14%", left: "62%", size: 1, delay: 1.9, duration: 7 },
];

export function armCinematicWelcome(variant: WelcomeVariant = "login") {
  try {
    sessionStorage.setItem(ARM_KEY, variant);
  } catch {}
  window.dispatchEvent(
    new CustomEvent(ARM_EVENT, {
      detail: { variant },
    })
  );
}

function readArm(): WelcomeVariant | null {
  try {
    const value = sessionStorage.getItem(ARM_KEY);
    return value === "first_visit" ||
      value === "login" ||
      value === "register"
      ? value
      : null;
  } catch {
    return null;
  }
}

function clearArm() {
  try {
    sessionStorage.removeItem(ARM_KEY);
  } catch {}
}

function hasShownFirstVisit() {
  try {
    return sessionStorage.getItem(FIRST_VISIT_SHOWN_KEY) === "1";
  } catch {
    return false;
  }
}

function markFirstVisitShown() {
  try {
    sessionStorage.setItem(FIRST_VISIT_SHOWN_KEY, "1");
  } catch {}
}

function isExcludedPath(path: string) {
  return ["/login", "/register", "/pro"].some((x) => path.startsWith(x));
}

/* ------------------------------------------------------------------ */
/* AUDIO */
/* ------------------------------------------------------------------ */

let audio: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audio) {
    const AudioCtx =
      window.AudioContext ||
      (
        window as unknown as {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (AudioCtx) {
      try {
        audio = new AudioCtx();
      } catch {
        audio = null;
      }
    }
  }
  return audio;
}

function primeAudio() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => {});
  }
}

async function ensureAudioRunning(ctx: AudioContext): Promise<boolean> {
  if (ctx.state === "running") return true;

  try {
    await ctx.resume();
  } catch {
    return false;
  }

  // After resume() the state can become "running".
  // TypeScript does not track the mutation, so we re-check with a cast.
  return (ctx.state as AudioContext["state"]) === "running";
}

function tone(
  ctx: AudioContext,
  {
    frequency,
    start,
    duration,
    volume,
    type = "sine",
    attack = 0.04,
    release = 0.7,
  }: {
    frequency: number;
    start: number;
    duration: number;
    volume: number;
    type?: OscillatorType;
    attack?: number;
    release?: number;
  }
) {
  try {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(volume, 0.0002),
      start + attack
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + duration + release
    );
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + release + 0.05);
  } catch {}
}

/**
 * Main cinematic entrance.
 *
 * Deep impact
 * + warm body
 * + high shimmer
 * + luxury resolution
 */
async function cinematicEntry() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (!(await ensureAudioRunning(ctx))) return;
  const now = ctx.currentTime;

  // Deep cinematic impact
  tone(ctx, {
    frequency: 55,
    start: now,
    duration: 0.55,
    volume: 0.055,
    type: "sine",
    attack: 0.015,
    release: 1.1,
  });

  // Body
  tone(ctx, {
    frequency: 110,
    start: now + 0.015,
    duration: 0.28,
    volume: 0.035,
    type: "triangle",
    attack: 0.01,
    release: 0.7,
  });

  // High shimmer
  tone(ctx, {
    frequency: 1046.5,
    start: now + 0.08,
    duration: 0.8,
    volume: 0.018,
    type: "sine",
    attack: 0.08,
    release: 1.2,
  });

  // Luxury resolution
  tone(ctx, {
    frequency: 659.25,
    start: now + 0.18,
    duration: 1,
    volume: 0.022,
    type: "sine",
    attack: 0.1,
    release: 1.1,
  });
}

/**
 * Musical accent for every title word.
 *
 * Welcome → G
 * to → C
 * ReyHomes → E
 */
async function titleRevealSound(wordIndex: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (!(await ensureAudioRunning(ctx))) return;
  const now = ctx.currentTime;
  const notes = [392, 523.25, 659.25, 783.99];
  const frequency = notes[Math.min(wordIndex, notes.length - 1)];

  tone(ctx, {
    frequency,
    start: now,
    duration: 0.38,
    volume: 0.018,
    type: "sine",
    attack: 0.025,
    release: 0.55,
  });

  // Very subtle octave shimmer
  tone(ctx, {
    frequency: frequency * 2,
    start: now + 0.035,
    duration: 0.22,
    volume: 0.006,
    type: "sine",
    attack: 0.025,
    release: 0.4,
  });
}

/**
 * Soft atmospheric transition under subtitle.
 */
async function subtitleSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (!(await ensureAudioRunning(ctx))) return;
  const now = ctx.currentTime;

  tone(ctx, {
    frequency: 196,
    start: now,
    duration: 0.9,
    volume: 0.009,
    type: "sine",
    attack: 0.25,
    release: 1.2,
  });

  tone(ctx, {
    frequency: 293.66,
    start: now + 0.12,
    duration: 0.7,
    volume: 0.006,
    type: "sine",
    attack: 0.2,
    release: 1,
  });
}

/**
 * Final emotional resolution.
 */
async function taglineSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (!(await ensureAudioRunning(ctx))) return;
  const now = ctx.currentTime;

  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    tone(ctx, {
      frequency,
      start: now + index * 0.09,
      duration: 0.65,
      volume: 0.012,
      type: "sine",
      attack: 0.08,
      release: 1,
    });
  });
}

/**
 * Manual "Enter ReyHomes" sound.
 */
async function enterSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (!(await ensureAudioRunning(ctx))) return;
  const now = ctx.currentTime;

  // Deep impact
  tone(ctx, {
    frequency: 65.41,
    start: now,
    duration: 0.3,
    volume: 0.045,
    type: "sine",
    attack: 0.01,
    release: 0.8,
  });

  // Middle body
  tone(ctx, {
    frequency: 261.63,
    start: now + 0.08,
    duration: 0.5,
    volume: 0.018,
    type: "sine",
    attack: 0.04,
    release: 0.8,
  });

  // Final shimmer
  tone(ctx, {
    frequency: 523.25,
    start: now + 0.17,
    duration: 0.8,
    volume: 0.012,
    type: "sine",
    attack: 0.08,
    release: 1,
  });
}

function getPreferredVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find(
      (voice) =>
        voice.lang === "en-US" &&
        /Samantha|Ava|Daniel|Karen|Google US English/i.test(voice.name)
    ) ||
    voices.find((voice) => voice.lang.startsWith("en-US")) ||
    voices.find((voice) => voice.lang.startsWith("en")) ||
    voices[0]
  );
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getPreferredVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    utterance.pitch = 0.88;
    utterance.volume = 0.48;
    window.speechSynthesis.speak(utterance);
  } catch {}
}

/* ------------------------------------------------------------------ */
/* THEME */
/* ------------------------------------------------------------------ */

function theme(variant: WelcomeVariant) {
  if (variant === "login" || variant === "register") {
    return {
      bg: "#05090F",
      glow: "radial-gradient(circle, rgba(216,199,164,.32), transparent 68%)",
      accent: "#D8C7A4",
      accentSoft: "rgba(216,199,164,.55)",
      title: "#F8F5F0",
      body: "rgba(248,245,240,.72)",
    };
  }
  return {
    bg: "#020810",
    glow: "radial-gradient(circle, rgba(30,110,170,.38), transparent 68%)",
    accent: "#9FC4DC",
    accentSoft: "rgba(159,196,220,.52)",
    title: "#F8F5F0",
    body: "rgba(248,245,240,.70)",
  };
}

/* ------------------------------------------------------------------ */
/* CORNER BRACKET */
/* ------------------------------------------------------------------ */

function CornerBracket({
  corner,
  show,
  color,
  delay,
}: {
  corner: "tl" | "tr" | "bl" | "br";
  show: boolean;
  color: string;
  delay: number;
}) {
  const size = 44;
  const position: CSSProperties =
    corner === "tl"
      ? { top: "8%", left: "6%" }
      : corner === "tr"
        ? { top: "8%", right: "6%" }
        : corner === "bl"
          ? { bottom: "10%", left: "6%" }
          : { bottom: "10%", right: "6%" };

  const hSide: "left" | "right" = corner.includes("l") ? "left" : "right";
  const vSide: "top" | "bottom" = corner.includes("t") ? "top" : "bottom";

  return (
    <div
      className="pointer-events-none absolute z-30"
      style={{
        ...position,
        width: size,
        height: size,
      }}
    >
      <motion.div
        className="absolute h-px"
        style={{
          [vSide]: 0,
          [hSide]: 0,
          width: size,
          background: color,
          transformOrigin: hSide,
        }}
        initial={{
          scaleX: 0,
          opacity: 0,
        }}
        animate={{
          scaleX: show ? 1 : 0,
          opacity: show ? 1 : 0,
        }}
        transition={{
          duration: 1,
          ease: EASE,
          delay,
        }}
      />
      <motion.div
        className="absolute w-px"
        style={{
          [vSide]: 0,
          [hSide]: 0,
          height: size,
          background: color,
          transformOrigin: vSide,
        }}
        initial={{
          scaleY: 0,
          opacity: 0,
        }}
        animate={{
          scaleY: show ? 1 : 0,
          opacity: show ? 1 : 0,
        }}
        transition={{
          duration: 1,
          ease: EASE,
          delay: delay + 0.1,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */

export default function CinematicWelcome({
  logoSrc = "/image/team/reyhomes.png",
  onComplete,
  enableFirstVisit = true,
}: Props) {
  const pathname = usePathname() || "/";
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("void");
  const [variant, setVariant] = useState<WelcomeVariant>("first_visit");
  const [logoFailed, setLogoFailed] = useState(false);
  const [entering, setEntering] = useState(false);
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const completed = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    clearTimers();
    clearArm();
    try {
      window.speechSynthesis?.cancel();
    } catch {}
    setPhase("exit");
    const timer = window.setTimeout(() => {
      setVisible(false);
      setPhase("void");
      setEntering(false);
      started.current = false;
      completed.current = false;
      onComplete?.();
    }, 950);
    timers.current.push(timer);
  }, [clearTimers, onComplete]);

  const beginEnter = useCallback(() => {
    if (entering || completed.current) return;
    setEntering(true);
    void enterSound();
    const timer = window.setTimeout(() => {
      finish();
    }, 650);
    timers.current.push(timer);
  }, [entering, finish]);

  const run = useCallback(
    (next: WelcomeVariant, force = false) => {
      if (started.current && !force) {
        return;
      }
      clearTimers();
      started.current = true;
      completed.current = false;
      setEntering(false);
      setVariant(next);
      setVisible(true);
      setPhase("void");
      clearArm();
      primeAudio();

      const copy = COPY[next];
      const titleWords = copy.title.split(" ");
      const timings =
        next === "first_visit"
          ? [700, 1900, 3000, 5100, 8200]
          : [550, 1500, 2700, 4500, 6500];

      const set = (ms: number, callback: () => void) => {
        timers.current.push(window.setTimeout(callback, ms));
      };

      /* ------------------------------------------------------------ */
      /* LOGO */
      /* ------------------------------------------------------------ */
      set(timings[0], () => {
        setPhase("logo");
        void cinematicEntry();
      });

      /* ------------------------------------------------------------ */
      /* EYEBROW */
      /* ------------------------------------------------------------ */
      set(timings[1], () => {
        setPhase("eyebrow");
      });

      /* ------------------------------------------------------------ */
      /* TITLE */
      /* ------------------------------------------------------------ */
      set(timings[2], () => {
        setPhase("title");
        window.setTimeout(() => {
          speak(copy.speech);
        }, 1100);

        /*
         * Audio follows the exact same stagger
         * as the Framer Motion word animation.
         */
        titleWords.forEach((_, index) => {
          const timer = window.setTimeout(() => {
            void titleRevealSound(index);
          }, index * 100);
          timers.current.push(timer);
        });
      });

      /* ------------------------------------------------------------ */
      /* SUBTITLE */
      /* ------------------------------------------------------------ */
      set(timings[3], () => {
        setPhase("subtitle");
        void subtitleSound();
      });

      /* ------------------------------------------------------------ */
      /* TAGLINE */
      /* ------------------------------------------------------------ */
      set(timings[4], () => {
        setPhase("tagline");
        void taglineSound();
      });

      /* ------------------------------------------------------------ */
      /* EXIT */
      /* ------------------------------------------------------------ */
      set(next === "first_visit" ? 18000 : 11000, finish);
    },
    [clearTimers, finish]
  );

  /* -------------------------------------------------------------- */
  /* AUDIO PRIMING */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    primeAudio();
    const unlock = () => {
      primeAudio();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  /* -------------------------------------------------------------- */
  /* INITIAL / ROUTE */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    if (isExcludedPath(pathname)) {
      return;
    }
    const home = pathname === "/" || pathname === "";
    const armed = readArm();
    const timer = window.setTimeout(() => {
      if (armed === "login" || armed === "register") {
        run(armed, true);
      } else if (enableFirstVisit && home && !hasShownFirstVisit()) {
        markFirstVisitShown();
        run("first_visit", true);
      }
    }, home ? 350 : 180);
    return () => window.clearTimeout(timer);
  }, [pathname, enableFirstVisit, run]);

  /* -------------------------------------------------------------- */
  /* ARM EVENT */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    const handler = () => {
      const armed = readArm();
      if (armed === "login" || armed === "register") {
        run(armed, true);
      }
    };
    window.addEventListener(ARM_EVENT, handler);
    return () => {
      window.removeEventListener(ARM_EVENT, handler);
    };
  }, [run]);

  /* -------------------------------------------------------------- */
  /* KEYBOARD SKIP */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    if (!visible) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        beginEnter();
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
    };
  }, [visible, beginEnter]);

  /* -------------------------------------------------------------- */
  /* CLEANUP */
  /* -------------------------------------------------------------- */
  useEffect(() => () => clearTimers(), [clearTimers]);

  const copy = COPY[variant];
  const colors = theme(variant);
  const firstVisit = variant === "first_visit";
  const showLogo = phase !== "void" && phase !== "exit";
  const showBrackets = phase !== "void" && phase !== "exit";
  const showCopy =
    phase === "eyebrow" ||
    phase === "title" ||
    phase === "subtitle" ||
    phase === "tagline";
  const showSubtitle = phase === "subtitle" || phase === "tagline";
  const showTagline = phase === "tagline";
  const titleWords = copy.title.split(" ");

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden"
          style={{
            background: colors.bg,
          }}
          initial={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
          }}
          animate={{
            opacity: phase === "exit" ? 0 : 1,
            scale: phase === "exit" ? 1.045 : 1,
            filter: phase === "exit" ? "blur(9px)" : "blur(0px)",
          }}
          transition={{
            duration: phase === "exit" ? 0.95 : 0.9,
            ease: EASE,
          }}
          role="dialog"
          aria-modal="true"
          aria-label={copy.title}
        >
          {/* Grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[.08] mix-blend-screen"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, #fff 0 1px, transparent 1px), radial-gradient(circle at 80% 70%, #fff 0 1px, transparent 1px)",
              backgroundSize: "70px 70px, 110px 110px",
            }}
          />

          {/* Vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 22%, rgba(0,0,0,.86) 100%)",
            }}
          />

          {/* Light sweep */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background: `linear-gradient(
                115deg,
                transparent 42%,
                ${colors.accentSoft} 50%,
                transparent 58%
              )`,
              mixBlendMode: "screen",
            }}
            initial={{
              opacity: 0,
              x: "-55%",
            }}
            animate={
              phase === "logo"
                ? {
                    opacity: [0, 0.32, 0],
                    x: ["-55%", "55%"],
                  }
                : {
                    opacity: 0,
                  }
            }
            transition={{
              duration: 1.7,
              ease: EASE,
            }}
          />

          {/* Central glow */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[65vmin] w-[65vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: colors.glow,
              filter: "blur(50px)",
            }}
            animate={{
              scale: phase === "tagline" ? 1.14 : 1,
              opacity: phase === "void" || phase === "exit" ? 0 : 1,
            }}
            transition={{
              duration: 1.6,
              ease: EASE,
            }}
          />

          {/* Dust */}
          {DUST.map((d, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute z-10 rounded-full"
              style={{
                top: d.top,
                left: d.left,
                width: d.size,
                height: d.size,
                background: colors.accent,
              }}
              animate={
                phase !== "void" && phase !== "exit"
                  ? {
                      opacity: [0, 0.55, 0],
                      y: [0, -16, -28],
                      x: [0, 5, -3],
                    }
                  : {
                      opacity: 0,
                    }
              }
              transition={{
                duration: d.duration,
                delay: d.delay,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          ))}

          {/* Architectural brackets */}
          <CornerBracket
            corner="tl"
            show={showBrackets}
            color={colors.accentSoft}
            delay={0.05}
          />
          <CornerBracket
            corner="tr"
            show={showBrackets}
            color={colors.accentSoft}
            delay={0.18}
          />
          <CornerBracket
            corner="bl"
            show={showBrackets}
            color={colors.accentSoft}
            delay={0.31}
          />
          <CornerBracket
            corner="br"
            show={showBrackets}
            color={colors.accentSoft}
            delay={0.44}
          />

          {/* Logo */}
          {showLogo && (
            <motion.div
              className="absolute top-[25%] z-10"
              style={{
                perspective: 800,
              }}
              initial={{
                opacity: 0,
                y: 34,
                scale: 0.8,
                rotateX: -10,
                filter: "blur(16px)",
              }}
              animate={{
                opacity: phase === "eyebrow" ? 0.25 : 1,
                y: phase === "eyebrow" ? -28 : 0,
                scale: phase === "eyebrow" ? 0.86 : 1,
                rotateX: 0,
                filter: "blur(0px)",
              }}
              transition={
                phase === "logo"
                  ? SETTLE
                  : {
                      duration: 1.1,
                      ease: EASE,
                    }
              }
            >
              {!logoFailed ? (
                <Image
                  src={logoSrc}
                  alt="ReyHomes"
                  width={340}
                  height={100}
                  priority
                  className="h-16 w-auto sm:h-20 md:h-24"
                  onError={() => setLogoFailed(true)}
                  style={{
                    maxWidth: "min(72vw,340px)",
                    filter: `drop-shadow(
                      0 0 38px
                      ${colors.accentSoft}
                    )`,
                  }}
                />
              ) : (
                <span className="font-serif text-4xl text-[#F8F5F0] sm:text-5xl">
                  ReyHomes
                </span>
              )}
            </motion.div>
          )}

          {/* Copy */}
          <AnimatePresence>
            {showCopy && (
              <motion.div
                className="absolute left-1/2 top-1/2 z-20 w-[min(92vw,900px)] -translate-x-1/2 -translate-y-1/2 px-5 text-center"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                  filter: "blur(10px)",
                }}
              >
                {/* Eyebrow */}
                <motion.p
                  className="mx-auto mb-6 text-center text-[9px] font-medium uppercase tracking-[.42em] sm:text-[10px] md:text-[11px]"
                  style={{
                    color: colors.accent,
                  }}
                  initial={{
                    opacity: 0,
                    y: 14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: EASE,
                  }}
                >
                  {copy.eyebrow}
                </motion.p>

                {/* Title */}
                {(phase === "title" || showSubtitle) && (
                  <motion.h1
                    className="mx-auto flex max-w-[900px] flex-wrap items-center justify-center text-center text-[clamp(2.7rem,7vw,6rem)] font-light leading-[0.98] tracking-[-0.025em]"
                    style={{
                      color: colors.title,
                      fontFamily:
                        '"Playfair Display", "Cormorant Garamond", Georgia, serif',
                      textShadow: `0 0 80px ${colors.accentSoft}`,
                    }}
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: {},
                      show: {
                        transition: {
                          staggerChildren: 0.1,
                        },
                      },
                    }}
                  >
                    {titleWords.map((word, i) => (
                      <motion.span
                        key={i}
                        className="inline-block whitespace-nowrap"
                        style={{
                          marginRight:
                            i === titleWords.length - 1 ? 0 : "0.22em",
                        }}
                        variants={{
                          hidden: {
                            opacity: 0,
                            y: 28,
                            filter: "blur(10px)",
                          },
                          show: {
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                            transition: {
                              duration: 0.95,
                              ease: EASE,
                            },
                          },
                        }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </motion.h1>
                )}

                {/* Divider */}
                {(phase === "title" || showSubtitle) && (
                  <motion.div
                    className="mx-auto mt-7 h-px w-20"
                    style={{
                      background: `linear-gradient(
                        90deg,
                        transparent,
                        ${colors.accent},
                        transparent
                      )`,
                      transformOrigin: "center",
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
                      duration: 1,
                      ease: EASE,
                      delay: 0.5,
                    }}
                  />
                )}

                {/* Subtitle */}
                {showSubtitle && (
                  <motion.p
                    className="mx-auto mt-7 max-w-[620px] text-center text-[14px] font-light leading-[1.8] tracking-[0.015em] sm:text-[16px] md:text-[17px]"
                    style={{
                      color: colors.body,
                    }}
                    initial={{
                      opacity: 0,
                      y: 16,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.9,
                      ease: EASE,
                    }}
                  >
                    {copy.subtitle}
                  </motion.p>
                )}

                {/* Tagline */}
                {showTagline && (
                  <motion.p
                    className="mx-auto mt-6 max-w-[520px] text-center text-[9px] font-medium uppercase tracking-[0.3em] sm:text-[10px]"
                    style={{
                      color: colors.accentSoft,
                    }}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.7,
                      ease: EASE,
                    }}
                  >
                    {copy.tagline}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enter button */}
          {firstVisit && showTagline && (
            <motion.div
              className="absolute bottom-10 left-1/2 z-40 -translate-x-1/2"
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <motion.button
                type="button"
                onClick={beginEnter}
                disabled={entering}
                whileHover={entering ? undefined : { scale: 1.03 }}
                whileTap={entering ? undefined : { scale: 0.97 }}
                transition={{
                  duration: 0.4,
                  ease: EASE,
                }}
                className="group relative min-w-[190px] overflow-hidden rounded-full border border-[#9FC4DC]/35 bg-white/[.045] px-8 py-3.5 text-[10px] font-medium uppercase tracking-[.34em] text-[#F8F5F0] backdrop-blur-xl transition-[border-color,background-color,box-shadow,opacity] duration-500 hover:border-[#D8C7A4]/70 hover:bg-white/[.09] hover:shadow-[0_0_70px_rgba(216,199,164,.18)] disabled:cursor-wait disabled:opacity-70"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[1400ms] group-hover:translate-x-full" />
                <span className="relative flex items-center justify-center gap-3">
                  {entering && (
                    <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                  )}
                  {entering ? "Loading" : "Enter ReyHomes"}
                </span>
              </motion.button>
              <p className="mt-3 text-center text-[9px] uppercase tracking-[.25em] text-white/35">
                {entering
                  ? "Preparing your experience"
                  : "Enter to continue · Esc to skip"}
              </p>
            </motion.div>
          )}

          {/* Login / register skip */}
          {!firstVisit && (
            <p className="absolute bottom-8 text-[10px] uppercase tracking-[.35em] text-white/30">
              Click or press Esc to continue
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
