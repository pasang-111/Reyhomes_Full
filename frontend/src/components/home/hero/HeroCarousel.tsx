"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, EffectFade, Keyboard, Mousewheel } from "swiper/modules";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  LayoutGroup,
} from "framer-motion";

import HeroSlide from "./HeroSlide";
import HeroVortex from "./HeroVortex";
import HeroContent from "./HeroContent";
import HeroNavigation from "./HeroNavigation";
import HeroDots from "./HeroDots";
import LuxurySearch from "./LuxurySearch";
import { Volume2, VolumeX } from "lucide-react";

import type { HeroSlide as ApiHeroSlide } from "@/lib/api/hero";
import type { HomeDesignListItem } from "@/types/home";
import type { HomeLandPackageListItem } from "@/types/land";
import { magneticSpring } from "@/lib/spring";

import "swiper/css";
import "swiper/css/effect-fade";

const AUTOPLAY_MS = 9000;

type Props = {
  slides: ApiHeroSlide[];
  designs: HomeDesignListItem[];
  packages: HomeLandPackageListItem[];
  navOffsetClassName?: string;
  /** Background color of whatever sits directly below the hero — the bottom
   *  fade blends into this so the curved edge reads as one continuous
   *  surface instead of a cutout. Set this to your next section's real bg. */
  bridgeColor?: string;
};

export default function HeroCarousel({
  slides: apiSlides,
  designs,
  packages,
  navOffsetClassName = "h-28 sm:h-32 lg:h-36",
  bridgeColor = "#F8F5F0",
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  /** User opts in to hear active slide audio (default off) */
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("reyhomes_hero_sound") === "1") setSoundOn(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem("reyhomes_hero_sound", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const swiperRef = useRef<SwiperType | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const slides = useMemo(
    () =>
      apiSlides.map((s) => ({
        id: String(s.id),
        title: s.title,
        subtitle: s.subtitle,
        video: s.video_url ?? undefined,
        image: s.image_url ?? undefined,
        poster: s.poster_url ?? undefined,
        href: s.button_link,
        button: s.button_text,
      })),
    [apiSlides]
  );

  const activeSlide = slides[activeIndex] ?? slides[0];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const toggleAutoplay = useCallback(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;
    if (paused) {
      swiper.autoplay.start();
      setPaused(false);
    } else {
      swiper.autoplay.stop();
      setPaused(true);
    }
  }, [paused]);

  /* Mouse parallax */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, magneticSpring);
  const springY = useSpring(mouseY, magneticSpring);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!sectionRef.current || reduceMotion) return;
      const rect = sectionRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY, reduceMotion]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  /* Scroll parallax */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const mediaScale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1, 1.18]);
  const mediaY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], reduceMotion ? [1, 1] : [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.45], reduceMotion ? [0, 0] : [0, -80]);
  const searchY = useTransform(scrollYProgress, [0, 0.6], reduceMotion ? [0, 0] : [0, -40]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.75], reduceMotion ? [0, 0] : [0, 0.78]);

  const spotlightLeft = useTransform(springX, (v) => `${(v + 0.5) * 100}%`);
  const spotlightTop = useTransform(springY, (v) => `${(v + 0.5) * 100}%`);
  const spotlightBg = useTransform(
    [spotlightLeft, spotlightTop],
    ([l, t]) =>
      `radial-gradient(560px circle at ${l} ${t}, rgba(216,199,164,0.10), transparent 70%)`
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        size: 1 + ((i * 13) % 3),
        duration: 14 + ((i * 7) % 10),
        delay: -(i * 1.3),
        opacity: 0.04 + ((i * 3) % 10) / 100,
      })),
    []
  );

  if (!slides.length) {
    return (
      <section className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-[#0A1420] text-[#F8F5F0]">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#F8F5F0]/60">ReyHomes</p>
          <p className="mt-3 text-sm text-[#F8F5F0]/40">No hero content available.</p>
        </div>
      </section>
    );
  }

  return (
    <LayoutGroup>
      <section
        ref={sectionRef}
        aria-label="ReyHomes cinematic hero"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group/hero relative h-[100svh] min-h-[680px] w-full overflow-hidden bg-[#0A1420] text-[#F8F5F0]"
        style={{
          clipPath: "url(#heroWaveClip)",
          WebkitClipPath: "url(#heroWaveClip)",
        }}
      >
        {/* Resolution-independent, GPU-cheap clip path — computed once, not
            per frame. (A blurred mask + drop-shadow here was fighting the
            60fps vortex canvas underneath and caused visible glitching —
            a plain clip-path is stable under heavy child animation.) */}
        <svg width="0" height="0" className="absolute" aria-hidden>
          <defs>
            <clipPath id="heroWaveClip" clipPathUnits="objectBoundingBox">
              <path d="M0,0 L1,0 L1,0.97 C0.75,1 0.25,1 0,0.97 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* MEDIA */}
        <motion.div
          className="absolute inset-0 h-full w-full will-change-transform"
          style={{ scale: mediaScale, y: mediaY }}
        >
          {/* Ambient brand vortex — under slides, above solid bg */}
          {!reduceMotion && (
            <div className="pointer-events-none absolute inset-0 z-[1] opacity-60 mix-blend-screen">
              <HeroVortex />
            </div>
          )}

          <Swiper
            modules={[Autoplay, EffectFade, Keyboard, Mousewheel]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={1400}
            loop={slides.length > 1}
            autoplay={
              reduceMotion
                ? false
                : { delay: AUTOPLAY_MS, disableOnInteraction: false, pauseOnMouseEnter: true }
            }
            keyboard={{ enabled: true }}
            mousewheel={{ forceToAxis: true, sensitivity: 0.6, thresholdDelta: 40 }}
            onSwiper={(s) => (swiperRef.current = s)}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
            className="h-full w-full"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={slide.id ?? index}>
                <HeroSlide
                  slide={slide}
                  isActive={activeIndex === index}
                  reduceMotion={reduceMotion}
                  soundOn={soundOn}
                  parallaxX={springX}
                  parallaxY={springY}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* ATMOSPHERE */}
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `
                radial-gradient(ellipse 80% 55% at 18% 35%, rgba(216,199,164,0.08) 0%, transparent 62%),
                radial-gradient(ellipse 60% 45% at 82% 62%, rgba(30,42,68,0.28) 0%, transparent 58%),
                radial-gradient(ellipse 50% 35% at 50% 90%, rgba(15,28,46,0.4) 0%, transparent 60%)
              `,
            }}
          />
          <div
            className="absolute -top-[25%] left-1/2 h-[65vh] w-[65vh] -translate-x-1/2 rounded-full opacity-[0.1] blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(216,199,164,0.6) 0%, rgba(216,199,164,0.06) 35%, transparent 70%)",
            }}
          />
          {!reduceMotion &&
            particles.map((p) => (
              <span
                key={p.id}
                className="absolute rounded-full bg-[#D8C7A4]"
                style={{
                  left: p.left,
                  bottom: "-4%",
                  width: p.size,
                  height: p.size,
                  opacity: p.opacity,
                  animation: `heroParticle ${p.duration}s linear ${p.delay}s infinite`,
                }}
              />
            ))}
          {!reduceMotion && (
            <motion.div
              className="absolute inset-0 opacity-70 mix-blend-soft-light"
              style={{ background: spotlightBg }}
            />
          )}
          {/* Vignette that sells the curved, cinematic frame */}
          <div className="absolute inset-0 shadow-[inset_0_0_140px_50px_rgba(0,0,0,0.35)]" />
        </div>

        <motion.div
          className="pointer-events-none absolute inset-0 z-20 bg-[#0A1420]"
          style={{ opacity: overlayOpacity }}
        />

        {/* Sound on / off — refined pill with gold ring */}
        <div className="pointer-events-none absolute right-4 top-[max(5.5rem,env(safe-area-inset-top)+4.5rem)] z-40 sm:right-6 sm:top-[max(6rem,env(safe-area-inset-top)+5rem)] lg:right-8">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? "Mute carousel sound" : "Unmute carousel sound"}
            aria-pressed={soundOn}
            title={soundOn ? "Sound on" : "Sound off"}
            className={`pointer-events-auto group relative flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 sm:h-10 sm:w-10 ${
              soundOn
                ? "border-[#D8C7A4]/70 bg-[#D8C7A4]/15 text-[#F8F5F0] shadow-[0_0_20px_-2px_rgba(216,199,164,0.6)]"
                : "border-white/15 bg-black/35 text-[#F8F5F0]/70 hover:border-[#D8C7A4]/45 hover:bg-black/50 hover:text-[#F8F5F0]"
            }`}
          >
            {soundOn ? (
              <Volume2 size={14} strokeWidth={1.75} />
            ) : (
              <VolumeX size={14} strokeWidth={1.75} />
            )}
            {soundOn && (
              <span className="absolute inset-0 animate-ping rounded-full bg-[#D8C7A4]/20" />
            )}
          </button>
        </div>

        {/* FOREGROUND */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 flex flex-col"
          style={{ opacity: contentOpacity, y: contentY }}
        >
          <div className={`shrink-0 ${navOffsetClassName}`} aria-hidden />

          <div className="flex min-h-0 flex-1 items-center px-6 pb-6 pt-2 sm:px-10 sm:pb-8 lg:px-16 lg:pb-10">
            <div className="mx-auto w-full max-w-7xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide?.id ?? activeIndex}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -14 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-auto"
                >
                  {activeSlide && (
                    <HeroContent
                      title={activeSlide.title}
                      subtitle={activeSlide.subtitle}
                      href={activeSlide.href}
                      button={activeSlide.button}
                      isActive
                      reduceMotion={reduceMotion}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <motion.div
            className="shrink-0 px-6 pb-8 sm:px-10 sm:pb-10 lg:px-16 lg:pb-14"
            style={{ y: searchY }}
          >
            <div className="pointer-events-auto mx-auto w-full max-w-[1180px]">
              <LuxurySearch designs={designs} packages={packages} />
              <div className="mt-4 flex items-center justify-between gap-4 sm:mt-5">
                <HeroDots
                  total={slides.length}
                  active={activeIndex}
                  onChange={(i) => swiperRef.current?.slideToLoop(i)}
                />
                <HeroNavigation
                  slides={slides}
                  active={activeIndex}
                  onChange={(i) => swiperRef.current?.slideToLoop(i)}
                  autoplayMs={AUTOPLAY_MS}
                  paused={paused}
                  onTogglePause={toggleAutoplay}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Soft gold glow along the curve — confined to a short strip near the
            bottom (not a full-viewport blurred layer) so it stays cheap to
            repaint even while the vortex canvas and video are animating */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-16 overflow-hidden sm:h-20">
          <svg
            viewBox="0 0 100 32"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-0 h-full w-full opacity-40 blur-[2px]"
            aria-hidden
          >
            <path
              d="M100,10 C75,26 25,26 0,10"
              fill="none"
              stroke="rgba(232,217,184,0.45)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Color bridge — fades hero into bridgeColor so the curve blends
            with whatever section follows instead of cutting to a gap */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-25 h-[22%]"
          style={{
            background: `linear-gradient(to bottom,
              color-mix(in srgb, ${bridgeColor} 0%, transparent) 0%,
              color-mix(in srgb, ${bridgeColor} 40%, transparent) 65%,
              color-mix(in srgb, ${bridgeColor} 82%, transparent) 90%,
              ${bridgeColor} 100%)`,
          }}
        />

        <style jsx global>{`
          @keyframes heroParticle {
            0% { transform: translate3d(0, 0, 0); opacity: 0; }
            12% { opacity: 0.75; }
            88% { opacity: 0.75; }
            100% { transform: translate3d(18px, -110vh, 0); opacity: 0; }
          }
        `}</style>
      </section>
    </LayoutGroup>
  );
}