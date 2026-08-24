"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Quote,
  Sparkles,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

/* -------------------------------------------------------------------------- */
/*  Motion helpers                                                            */
/* -------------------------------------------------------------------------- */
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: EASE },
  }),
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */
const stats = [
  { number: 3, suffix: "+", label: "Years of Excellence" },
  { number: 50, suffix: "+", label: "Bespoke Designs" },
  { number: 20, suffix: "+", label: "Homes Built" },
  { number: 100, suffix: "%", label: "Commitment to Quality" },
];

const values = [
  {
    number: "01",
    title: "Designed Around You",
    desc: "Every ReyHomes project begins with understanding the people who will live there. Your lifestyle, ambitions and aspirations shape the design.",
  },
  {
    number: "02",
    title: "Crafted Without Compromise",
    desc: "We believe luxury is found in the details — considered materials, refined proportions and craftsmanship that stands the test of time.",
  },
  {
    number: "03",
    title: "A More Personal Experience",
    desc: "From the first conversation to handover, we keep the process transparent, considered and genuinely personal.",
  },
  {
    number: "04",
    title: "Built for Generations",
    desc: "Our goal isn't simply to create beautiful houses. We create enduring homes designed to become part of your family's story.",
  },
];

const milestones = [
  {
    year: "01",
    title: "The Conversation",
    desc: "We listen first. Your block, your lifestyle, your vision and the way you want to experience your home.",
  },
  {
    year: "02",
    title: "The Vision",
    desc: "Concepts become plans as architecture, materials, light and living spaces begin to take shape.",
  },
  {
    year: "03",
    title: "The Craft",
    desc: "Our team brings the design to life through carefully managed construction and uncompromising attention to detail.",
  },
  {
    year: "04",
    title: "The Home",
    desc: "A considered space designed around you — ready to be lived in, loved and passed forward.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                 */
/* -------------------------------------------------------------------------- */
export default function AboutPage() {
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const element = statsRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0C2A44] text-[#F5F0E6]">
      <HeroParallax />

      {/* STATS */}
      <section
        ref={statsRef}
        className="rh-section relative z-20 mx-auto -mt-1 max-w-[1400px] px-5 md:px-8"
      >
        <div className="relative z-10 overflow-hidden rounded-[30px] border border-white/10 bg-[#0A2035]">
          <div className="rh-orbs" aria-hidden="true">
            <div
              className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-a"
              style={{ top: "-20%", left: "8%" }}
            />
            <div
              className="rh-orb rh-orb--navy rh-orb--md rh-orb--drift-b"
              style={{ bottom: "-25%", right: "8%" }}
            />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-[60%] -translate-x-1/2 bg-[#D8C7A4]/[0.06] blur-[100px]" />

          <div className="relative grid grid-cols-2 divide-x divide-y divide-white/10 md:grid-cols-4 md:divide-y-0">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="px-6 py-10 text-center md:px-8 md:py-14"
              >
                <div className="font-display text-5xl font-light tracking-[-0.04em] text-[#D8C7A4] md:text-6xl">
                  {statsVisible ? (
                    <AnimatedNumber target={stat.number} suffix={stat.suffix} />
                  ) : (
                    `0${stat.suffix}`
                  )}
                </div>
                <p className="mt-3 text-[9px] font-medium uppercase tracking-[0.3em] text-white/40">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StorySection />
      <FounderSection />

      {/* VALUES */}
      <section className="rh-section mx-auto max-w-[1500px] px-6 py-32 md:px-10 lg:px-16 lg:py-44">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--lg rh-orb--drift-c"
            style={{ top: "-10%", right: "-10%" }}
          />
        </div>
        <motion.div
          className="relative z-10 mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <div>
            <motion.div className="mb-6 flex items-center gap-3" variants={fadeUp}>
              <Sparkles size={14} className="text-[#D8C7A4]" />
              <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-[#D8C7A4]">
                The ReyHomes Difference
              </p>
            </motion.div>

            <motion.h2
              className="font-display text-5xl font-light leading-none tracking-[-0.04em] md:text-7xl"
              variants={fadeUp}
              custom={1}
            >
              The standard
              <br />
              <span className="italic text-[#D8C7A4]">we live by.</span>
            </motion.h2>
          </div>

          <motion.p
            className="max-w-md text-sm leading-7 text-white/40"
            variants={fadeUp}
            custom={2}
          >
            Luxury isn't a finish. It's the feeling created when everything has
            been considered.
          </motion.p>
        </motion.div>

        <div className="relative z-10 grid gap-px overflow-hidden rounded-[30px] border border-white/10 bg-white/10 md:grid-cols-2">
          {values.map((value, index) => (
            <motion.div
              key={value.number}
              className="group relative bg-[#0A2035] p-9 transition-colors duration-500 hover:bg-[#0C2A44] md:p-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: index * 0.12, ease: EASE }}
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-5xl font-light text-[#D8C7A4]/25 transition-colors duration-500 group-hover:text-[#D8C7A4]/60">
                  {value.number}
                </span>
                <ArrowUpRight
                  size={19}
                  className="text-white/15 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#D8C7A4]"
                />
              </div>

              <h3 className="mt-16 font-display text-3xl font-light text-white">
                {value.title}
              </h3>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/40">
                {value.desc}
              </p>

              <div className="mt-8 flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-[#D8C7A4]/60">
                <Check size={11} />
                ReyHomes standard
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* APPROACH */}
      <section className="rh-section relative bg-[#F5F0E6] py-32 text-[#0C2A44] md:py-44">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-a"
            style={{ top: "-15%", left: "-8%", opacity: 0.35 }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1500px] px-6 md:px-10 lg:px-16">
          <div className="grid gap-20 lg:grid-cols-12">
            <motion.div
              className="lg:col-span-4"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-[#806D48]">
                Our Approach
              </p>

              <h2 className="mt-6 font-display text-5xl font-light leading-[0.95] tracking-[-0.04em] md:text-6xl">
                From first
                <br />
                conversation
                <br />
                to <i>forever.</i>
              </h2>

              <p className="mt-8 max-w-sm text-sm leading-7 text-[#0C2A44]/55">
                A considered journey designed to make building your home feel as
                rewarding as living in it.
              </p>
            </motion.div>

            <div className="lg:col-span-8">
              <div className="divide-y divide-[#0C2A44]/10 border-t border-[#0C2A44]/10">
                {milestones.map((item, index) => (
                  <motion.div
                    key={item.year}
                    className="group grid gap-5 py-9 md:grid-cols-[90px_220px_1fr] md:items-start"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.65,
                      delay: index * 0.1,
                      ease: EASE,
                    }}
                  >
                    <span className="font-display text-3xl font-light text-[#806D48]">
                      {item.year}
                    </span>
                    <h3 className="font-display text-2xl font-light">
                      {item.title}
                    </h3>
                    <p className="max-w-lg text-sm leading-7 text-[#0C2A44]/55">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="rh-section relative overflow-hidden bg-[#0C2A44] py-36 text-center md:py-48">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1A4A6E]/20 blur-[160px]" />
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-b"
            style={{ bottom: "-10%", left: "5%" }}
          />
        </div>

        <motion.div
          className="relative z-10 mx-auto max-w-4xl px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.p
            className="text-[9px] font-semibold uppercase tracking-[0.45em] text-[#D8C7A4]"
            variants={fadeUp}
          >
            Your next chapter
          </motion.p>

          <motion.h2
            className="mt-7 font-display text-6xl font-light leading-[0.9] tracking-[-0.05em] md:text-8xl"
            variants={fadeUp}
            custom={1}
          >
            Let's create
            <br />
            <span className="italic text-[#D8C7A4]">something lasting.</span>
          </motion.h2>

          <motion.p
            className="mx-auto mt-8 max-w-xl text-base leading-7 text-white/40"
            variants={fadeUp}
            custom={2}
          >
            Tell us about your vision, your block and the life you want to
            build. We'll take it from there.
          </motion.p>

          <motion.div variants={fadeUp} custom={3}>
            <Link
              href="/contact"
              className="group mt-12 inline-flex items-center gap-3 rounded-full bg-[#D8C7A4] px-9 py-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#0C2A44] transition-all duration-500 hover:-translate-y-1 hover:bg-[#E8D9B8] hover:shadow-[0_25px_80px_-25px_rgba(216,199,164,.6)]"
            >
              Schedule a private consultation
              <ArrowUpRight
                size={15}
                className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  HERO – Parallax                                                           */
/* -------------------------------------------------------------------------- */
function HeroParallax() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "32%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const opacityContent = useTransform(scrollYProgress, [0, 0.65], [1, 0.1]);
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section
      ref={ref}
      className="rh-section relative flex min-h-[92vh] items-end overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#0C2A44]" />

      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "18%"]) }}
        className="pointer-events-none absolute -left-[20%] top-[-20%] h-[700px] w-[700px] rounded-full bg-[#1A4A6E]/25 blur-[180px]"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]) }}
        className="pointer-events-none absolute right-[-15%] top-[10%] h-[650px] w-[650px] rounded-full bg-[#D8C7A4]/12 blur-[180px]"
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
        }}
      />

      <motion.div
        style={{ y: yBg, scale: scaleBg }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
          alt="Luxury ReyHomes residence"
          fill
          priority
          className="object-cover object-center opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C2A44]/60 via-[#0C2A44]/35 to-[#0C2A44]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C2A44]/90 via-[#0C2A44]/30 to-transparent" />
      </motion.div>

      <motion.div
        style={{ y: yContent, opacity: opacityContent }}
        className="relative z-10 mx-auto w-full max-w-[1500px] px-6 pb-24 pt-40 will-change-transform md:px-10 lg:px-16 lg:pb-32"
      >
        <div className="max-w-5xl">
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px w-14 bg-[#D8C7A4]" />
            <p className="text-[10px] font-medium uppercase tracking-[0.45em] text-[#D8C7A4]">
              The ReyHomes Story
            </p>
          </div>

          <h1 className="font-display text-[clamp(4rem,9vw,9rem)] font-light leading-[0.86] tracking-[-0.055em] text-[#F5F0E6]">
            Homes with
            <br />
            <span className="italic text-[#D8C7A4]">intention.</span>
          </h1>

          <p className="mt-10 max-w-2xl text-lg font-light leading-8 text-white/60 md:text-xl">
            We believe the most remarkable homes aren't defined by extravagance.
            They're defined by how beautifully they belong to the people who
            live in them.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="#our-story"
              className="group inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-7 py-4 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-all duration-500 hover:border-[#D8C7A4]/50 hover:bg-white/10"
            >
              Discover our story
              <ArrowDown
                size={14}
                className="transition-transform duration-500 group-hover:translate-y-1"
              />
            </Link>

            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 rounded-full bg-[#D8C7A4] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0C2A44] transition-all duration-500 hover:-translate-y-1 hover:bg-[#E8D9B8] hover:shadow-[0_20px_60px_-20px_rgba(216,199,164,.55)]"
            >
              Begin your journey
              <ArrowUpRight
                size={14}
                className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>

        <div className="mt-20 flex items-end justify-between border-t border-white/10 pt-5">
          <p className="text-[9px] uppercase tracking-[0.35em] text-white/30">
            Established 2023 · Australia
          </p>
          <p className="hidden text-[9px] uppercase tracking-[0.35em] text-white/30 md:block">
            Architecture · Craft · Living
          </p>
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  STORY – scroll animations + image parallax                                */
/* -------------------------------------------------------------------------- */
function StorySection() {
  const imageRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const yImage = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      id="our-story"
      className="rh-section mx-auto max-w-[1500px] px-6 py-32 md:px-10 lg:px-16 lg:py-44"
    >
      <div className="rh-orbs" aria-hidden="true">
        <div
          className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-c"
          style={{ top: "10%", left: "-10%" }}
        />
      </div>
      <div className="relative z-10 grid items-center gap-16 lg:grid-cols-12 lg:gap-24">
        <motion.div
          className="lg:col-span-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.div className="mb-7 flex items-center gap-3" variants={fadeUp}>
            <span className="h-px w-10 bg-[#D8C7A4]" />
            <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-[#D8C7A4]">
              Our Philosophy
            </p>
          </motion.div>

          <motion.h2
            className="font-display text-5xl font-light leading-[0.95] tracking-[-0.04em] md:text-7xl"
            variants={fadeUp}
            custom={1}
          >
            Building
            <br />
            <span className="text-[#D8C7A4]">legacies,</span>
            <br />
            not just houses.
          </motion.h2>

          <div className="mt-10 space-y-6 text-base leading-8 text-white/50">
            {[
              "ReyHomes was founded around a simple belief: a home should feel deeply personal.",
              "It should respond to the way you live, the people you love and the future you're building. That's why we approach every project with patience, precision and genuine care.",
              "From the first sketch to the moment you turn the key, every decision is considered with the same question in mind — will this still feel right years from now?",
            ].map((text, i) => (
              <motion.p key={i} variants={fadeUp} custom={i + 2}>
                {text}
              </motion.p>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative lg:col-span-7"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <div className="absolute -right-4 -top-4 h-28 w-28 border-r border-t border-[#D8C7A4]/40" />

          <div
            ref={imageRef}
            className="relative aspect-[1.15] overflow-hidden rounded-[32px] border border-white/10"
          >
            <motion.div
              style={{ y: yImage }}
              className="absolute inset-[-12%] will-change-transform"
            >
              <Image
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d"
                alt="ReyHomes interior"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-7 left-7">
              <p className="text-[8px] uppercase tracking-[0.4em] text-white/50">
                Considered living
              </p>
              <p className="mt-2 font-display text-2xl font-light text-white">
                Designed to belong.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  FOUNDER – image parallax + text reveals                                   */
/* -------------------------------------------------------------------------- */
function FounderSection() {
  const imageRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const yImage = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section className="relative overflow-hidden border-y border-white/[0.07] bg-[#0A2035]">
      <div className="pointer-events-none absolute left-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-[#1A4A6E]/20 blur-[160px]" />

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-2">
        <div
          ref={imageRef}
          className="relative min-h-[650px] overflow-hidden lg:min-h-[820px]"
        >
          <motion.div
            style={{ y: yImage }}
            className="absolute inset-[-12%] will-change-transform"
          >
            <Image
              src="/image/team/pasang_sherpa.jpeg"
              alt="Pasang Sherpa — Founder of ReyHomes"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2035] via-transparent to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#0A2035]" />

          <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-12">
            <p className="text-[9px] uppercase tracking-[0.35em] text-[#D8C7A4]">
              Founder
            </p>
            <h3 className="mt-2 font-display text-3xl font-light text-white md:text-4xl">
              Pasang Sherpa
            </h3>
          </div>
        </div>

        <div className="flex items-center px-7 py-24 md:px-14 lg:px-20">
          <motion.div
            className="max-w-xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <Quote
                size={38}
                strokeWidth={1}
                className="mb-10 text-[#D8C7A4]/50"
              />
            </motion.div>

            <motion.p
              className="font-display text-4xl font-light leading-[1.12] tracking-[-0.025em] text-[#F5F0E6] md:text-5xl"
              variants={fadeUp}
              custom={1}
            >
              “A home should be more than a beautiful space. It should become
              part of your story.”
            </motion.p>

            <motion.div
              className="my-10 h-px w-16 bg-[#D8C7A4]"
              variants={fadeUp}
              custom={2}
            />

            <motion.p
              className="text-base leading-8 text-white/50"
              variants={fadeUp}
              custom={3}
            >
              At ReyHomes, my vision has always been to create homes where
              thoughtful design and genuine craftsmanship come together. We
              don't believe in building simply for the sake of building. We
              believe in creating places that people are proud to call home.
            </motion.p>

            <motion.p
              className="mt-6 text-base leading-8 text-white/50"
              variants={fadeUp}
              custom={4}
            >
              Every project carries our name, and with that comes a
              responsibility — to listen carefully, communicate honestly and
              deliver a home that exceeds expectations.
            </motion.p>

            <motion.div className="mt-10" variants={fadeUp} custom={5}>
              <p className="font-display text-2xl font-light text-[#D8C7A4]">
                Pasang Sherpa
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.35em] text-white/30">
                Founder · ReyHomes
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated Number                                                           */
/* -------------------------------------------------------------------------- */
function AnimatedNumber({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let current = 0;
    const duration = 1200;
    const steps = 45;
    const increment = target / steps;

    const timer = window.setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        window.clearInterval(timer);
      }
      setValue(Math.round(current));
    }, duration / steps);

    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <>
      {value}
      {suffix}
    </>
  );
}