"use client";

import Image from "next/image";

import { useState } from "react";
import {
  ArrowRight,
  Play,
  PlayCircle,
  Quote,
  Star,
} from "lucide-react";
import type { Testimonial } from "@/lib/api/testimonials";
import StoryOrbit from "@/components/testimonials/StoryOrbit";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@SandstoneConstructions";

function youtubeIdFromUrl(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  );
  return m?.[1] ?? null;
}

function youtubeThumb(url: string): string {
  const id = youtubeIdFromUrl(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}



type VideoItem = {
  id: number;
  title: string;
  subtitle?: string;
  thumbnail: string;
  embedUrl: string;
};

const FALLBACK_VIDEO: VideoItem = {
  id: 0,
  title: "Client Story",
  subtitle: "",
  thumbnail: "",
  embedUrl: "",
};

function toVideoItem(t: Testimonial): VideoItem {
  const anyT = t as Testimonial & { video_url?: string; thumbnail_url?: string };
  return {
    id: t.id,
    title: t.name,
    subtitle: [t.role, t.suburb].filter(Boolean).join(" \u00b7 "),
    thumbnail:
      anyT.thumbnail_url ||
      t.photo_url ||
      youtubeThumb(anyT.video_url || "") ||
      "",
    embedUrl: anyT.video_url || "",
  };
}

export default function TestimonialsPageClient({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const videos = testimonials.length > 0 ? testimonials.map(toVideoItem) : [FALLBACK_VIDEO];
  const [activeVideo, setActiveVideo] = useState(videos[0]);

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="rh-section relative overflow-hidden bg-[#060606] text-white">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-[#C5CAD3]/15 blur-[180px]" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-[radial-gradient(circle,rgba(63,90,128,.12),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#060606_0%,#0b0b0c_50%,#101010_100%)]" />
          {/* fine gold hairline grid, luxury print feel */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(#C5CAD3_1px,transparent_1px),linear-gradient(90deg,#C5CAD3_1px,transparent_1px)] bg-[size:80px_80px]" />
          {/* watermark monogram */}
          <div className="pointer-events-none absolute -right-24 -top-24 select-none font-display text-[420px] leading-none text-white/[0.03]">
            S
          </div>
        </div>
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-b"
            style={{ bottom: "-10%", left: "-6%", opacity: 0.3 }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-44 pb-36">
          <p className="inline-flex items-center gap-4 text-xs uppercase tracking-[0.55em] text-[#C5CAD3]">
            <span className="h-px w-14 bg-gradient-to-r from-transparent via-[#C5CAD3] to-[#C5CAD3]" />
            Client Stories
            <span className="h-px w-14 bg-gradient-to-l from-transparent via-[#C5CAD3] to-[#C5CAD3]" />
          </p>

          <h1 className="mt-8 max-w-5xl font-display text-6xl leading-[0.9] tracking-[-0.04em] md:text-8xl">
            Every Home
            <br />
            <span className="italic text-[#C5CAD3]">Has A Story.</span>
          </h1>

          <p className="mt-10 max-w-2xl text-xl leading-9 text-white/60">
            Discover the experiences of families who trusted ReyHomes to build homes that combine timeless design,
            exceptional craftsmanship and uncompromising quality.
          </p>

          <div className="mt-14 flex flex-wrap gap-5">
            <a
              href="#featured"
              className="moon-button rounded-full px-10 py-4 font-semibold"
            >
              Watch Client Stories
              <ArrowRight
                size={18}
                className="transition-transform duration-500 group-hover:translate-x-1"
              />
            </a>

            <a
              href="/contact"
              className="rounded-full border border-white/10 px-10 py-4 transition-all duration-500 hover:border-[#C5CAD3] hover:bg-white/5"
            >
              Build With Us
            </a>
          </div>

          {/* Stats */}
          <div className="mt-28 grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 pt-10 lg:grid-cols-4">
            {[
              ["500+", "Luxury Homes"],
              ["20+", "Years Experience"],
              ["98%", "Client Satisfaction"],
              ["5★", "Google Rating"],
            ].map(([number, label], i) => (
              <div key={number} className={i === 0 ? "" : "pl-8"}>
                <h2 className="bg-gradient-to-b from-[#9FB8D9] to-[#C5CAD3] bg-clip-text font-display text-5xl text-transparent">
                  {number}
                </h2>
                <p className="mt-3 text-sm uppercase tracking-[0.3em] text-white/45">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED VIDEO ================= */}
      <section
        id="featured"
        className="rh-section relative bg-[#0B0B0C] py-32 text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(63,90,128,.10),transparent_50%)]" />
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--navy rh-orb--md rh-orb--drift-a"
            style={{ top: "-15%", left: "5%", opacity: 0.3 }}
          />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-20 px-6 lg:grid-cols-[1.45fr_.8fr] lg:items-center">
          {/* Video */}
          <div className="relative overflow-hidden rounded-[36px] border border-[#C5CAD3]/20 shadow-[0_40px_120px_rgba(0,0,0,.55)]">
            {/* thin gold corner accents */}
            <div className="pointer-events-none absolute left-6 top-6 z-10 h-8 w-8 border-l-2 border-t-2 border-[#9FB8D9]/70" />
            <div className="pointer-events-none absolute bottom-6 right-6 z-10 h-8 w-8 border-b-2 border-r-2 border-[#9FB8D9]/70" />
            <iframe
              className="aspect-video w-full"
              src={activeVideo.embedUrl}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Content */}
          <div>
            <p className="flex items-center gap-3 text-sm uppercase tracking-[0.45em] text-[#C5CAD3]">
              <span className="h-px w-8 bg-[#C5CAD3]" />
              Featured Testimonial
            </p>

            <h2 className="mt-6 font-display text-5xl leading-tight">
              {activeVideo.title}
            </h2>

            <p className="mt-3 text-lg text-white/60">
              {activeVideo.subtitle}
            </p>

            <div className="mt-8 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className="fill-[#C5CAD3] text-[#C5CAD3]"
                />
              ))}
            </div>

            <Quote
              size={42}
              className="mt-12 text-[#C5CAD3]/40"
              strokeWidth={1.5}
            />

            <p className="mt-6 text-xl leading-9 text-white/70">
              Every project is built with meticulous attention to detail,
              premium craftsmanship and a commitment to delivering homes that
              exceed expectations. Hear directly from our clients as they share
              their journey with ReyHomes.
            </p>

            <a
              href="/contact"
              className="mt-12 inline-flex items-center gap-3 rounded-full border border-[#C5CAD3]/50 px-8 py-4 transition duration-500 hover:bg-[#C5CAD3] hover:text-black"
            >
              Start Your Journey
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* ================= VIDEO GALLERY ================= */}
      <section className="rh-section relative bg-[#0B0B0C] pb-32">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--lg rh-orb--drift-c"
            style={{ bottom: "-20%", right: "-10%", opacity: 0.25 }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-16 flex items-end justify-between">
            <div>
              <p className="flex items-center gap-3 text-xs uppercase tracking-[0.45em] text-[#C5CAD3]">
                <span className="h-px w-8 bg-[#C5CAD3]" />
                More Client Stories
              </p>
              <h2 className="mt-4 font-display text-5xl">
                Discover More
                <br />
                Homeowner Experiences
              </h2>
            </div>

            <p className="hidden max-w-sm text-right text-white/50 lg:block">
              Every family has a unique story. Explore how ReyHomes
              Constructions transformed ideas into exceptional homes.
            </p>
          </div>

          {/* Telepathy-style remote: orbit of client stories */}
          <div className="mb-16 flex flex-col items-center gap-8 lg:mb-20">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.4em] text-[#C5CAD3]">
              Choose a story · feel the field
            </p>
            <StoryOrbit
              stories={videos.filter((v) => v.id !== 0 || v.thumbnail)}
              activeId={activeVideo.id}
              onSelect={(story) => {
                setActiveVideo(story);
                document
                  .getElementById("featured")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
            <p className="max-w-sm text-center text-sm text-white/45">
              Hover the ring — stories lean toward your cursor. Select one to
              play in the feature stage above.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => {
              const active = activeVideo.id === video.id;

              return (
                <button
                  key={video.id}
                  onClick={() => {
                    setActiveVideo(video);
                    document
                      .getElementById("featured")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`group overflow-hidden rounded-[30px] border text-left transition-all duration-700 ${
                    active
                      ? "border-[#C5CAD3] shadow-[0_25px_80px_rgba(63,90,128,.18)]"
                      : "border-white/10 hover:-translate-y-2 hover:border-[#C5CAD3]/60"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden aspect-video">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`flex h-20 w-20 items-center justify-center rounded-full backdrop-blur-xl transition-all duration-500 ${
                          active
                            ? "bg-gradient-to-b from-[#9FB8D9] to-[#C5CAD3] text-black"
                            : "border border-white/20 bg-black/40 text-white group-hover:bg-gradient-to-b group-hover:from-[#9FB8D9] group-hover:to-[#C5CAD3] group-hover:text-black"
                        }`}
                      >
                        <Play size={30} fill="currentColor" />
                      </div>
                    </div>

                    {active && (
                      <div className="absolute left-5 top-5 rounded-full bg-gradient-to-b from-[#9FB8D9] to-[#C5CAD3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-black">
                        Now Playing
                      </div>
                    )}
                  </div>

                  {/* Card */}
                  <div className="bg-white/[0.03] p-8 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.35em] text-[#C5CAD3]">
                      Video Testimonial
                    </p>
                    <h3 className="mt-4 font-display text-3xl">{video.title}</h3>
                    <p className="mt-3 leading-7 text-white/55">
                      {video.subtitle}
                    </p>
                    <div className="mt-8 flex items-center justify-between">
                      <span className="text-sm uppercase tracking-[0.3em] text-white/35">
                        Watch Story
                      </span>
                      <ArrowRight
                        size={18}
                        className="transition-transform duration-500 group-hover:translate-x-2"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= YOUTUBE CHANNEL ================= */}
      <section className="rh-section relative overflow-hidden bg-[#060606] py-28 text-white">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C5CAD3]/10 blur-[200px]" />
        </div>
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-b"
            style={{ top: "-10%", left: "-8%", opacity: 0.25 }}
          />
        </div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#C5CAD3]/40 bg-white/[0.03]">
           <PlayCircle
  size={34}
  className="text-[#C5CAD3]"
  strokeWidth={1.5}
/>
          </div>

          <p className="text-xs uppercase tracking-[0.45em] text-[#C5CAD3]">
            More Stories, Beyond This Page
          </p>

          <h2 className="max-w-2xl font-display text-4xl leading-tight md:text-5xl">
            Watch Every Client Story On
            <br />
            <span className="italic text-[#C5CAD3]">Our YouTube Channel.</span>
          </h2>

          <p className="max-w-xl text-lg leading-8 text-white/55">
            From foundation to final walkthrough, subscribe to see the
            complete library of homeowner journeys, site tours and behind the
            build features.
          </p>

          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-4 inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-[#9FB8D9] via-[#3D5A80] to-[#C5CAD3] px-10 py-4 font-semibold text-white shadow-[0_20px_60px_rgba(63,90,128,.25)] transition-all duration-500 hover:scale-105 hover:shadow-[0_25px_80px_rgba(63,90,128,.4)]"
          >
           <PlayCircle
  size={20}
/>
            Visit Our YouTube Channel
            <ArrowRight
              size={18}
              className="transition-transform duration-500 group-hover:translate-x-1"
            />
          </a>
        </div>
      </section>

      {/* ================= TRUST SECTION ================= */}
      <section className="rh-section relative overflow-hidden bg-[#080808] py-36 text-white">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#C5CAD3]/10 blur-[180px]" />
        </div>
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--navy rh-orb--lg rh-orb--drift-c"
            style={{ bottom: "-20%", right: "-8%", opacity: 0.25 }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.45em] text-[#C5CAD3]">
              Trusted By Families
            </p>
            <h2 className="mt-5 font-display text-5xl leading-tight md:text-6xl">
              Built On Trust.
              <br />
              <span className="italic text-[#C5CAD3]">
                Backed By Experience.
              </span>
            </h2>
            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-white/55">
              Every home we build is a reflection of our commitment to
              exceptional craftsmanship, transparent communication and a
              client-first experience.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-24 grid gap-8 md:grid-cols-4">
            {[
              {
                number: "500+",
                title: "Luxury Homes",
                desc: "Beautiful homes delivered across Sydney.",
              },
              {
                number: "20+",
                title: "Years Experience",
                desc: "Building premium homes with confidence.",
              },
              {
                number: "98%",
                title: "Client Satisfaction",
                desc: "Families recommending ReyHomes.",
              },
              {
                number: "5★",
                title: "Google Rating",
                desc: "Trusted by homeowners.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-10 backdrop-blur-xl transition-all duration-700 hover:-translate-y-2 hover:border-[#C5CAD3] hover:bg-white/[0.05]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#C5CAD3]/0 via-[#C5CAD3]/0 to-[#C5CAD3]/0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-hover:from-[#C5CAD3]/[0.06]" />
                <h3 className="relative bg-gradient-to-b from-[#9FB8D9] to-[#C5CAD3] bg-clip-text font-display text-6xl text-transparent">
                  {item.number}
                </h3>
                <h4 className="relative mt-5 text-xl font-medium">
                  {item.title}
                </h4>
                <p className="relative mt-4 leading-7 text-white/50">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="rh-section relative overflow-hidden bg-black py-40">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C5CAD3]/15 blur-[220px]" />
        </div>
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-a"
            style={{ top: "-15%", right: "5%", opacity: 0.25 }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center text-white">
          <p className="text-xs uppercase tracking-[0.45em] text-[#C5CAD3]">
            Your Story Starts Here
          </p>

          <h2 className="mt-8 font-display text-6xl leading-tight md:text-7xl">
            Let's Build Something
            <br />
            <span className="italic text-[#C5CAD3]">Extraordinary.</span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-xl leading-9 text-white/60">
            Join hundreds of Australian families who have trusted ReyHomes to create homes designed for generations.
          </p>

          <div className="mt-14 flex flex-wrap justify-center gap-6">
            <a
              href="/contact"
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-[#9FB8D9] to-[#C5CAD3] px-10 py-5 text-lg font-semibold text-white transition-all duration-500 hover:scale-105 hover:shadow-[0_30px_80px_rgba(63,90,128,.35)]"
            >
              Book A Consultation
              <ArrowRight
                size={18}
                className="transition-transform duration-500 group-hover:translate-x-1"
              />
            </a>

            <a
              href="/display-homes"
              className="rounded-full border border-white/15 px-10 py-5 text-lg transition-all duration-500 hover:border-[#C5CAD3] hover:bg-white/5"
            >
              Explore Display Homes
            </a>
          </div>
        </div>
      </section>
    </>
  );
}