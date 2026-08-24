"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { Testimonial as ApiTestimonial } from "@/lib/api/testimonials";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/motion";

const FALLBACK_TESTIMONIALS = [
  {
    id: 1,
    name: "Thomas & Kamana",
    title: "Custom Luxury Home",
    embedUrl: "https://www.youtube.com/embed/-DnmOq5WxQE?rel=0",
    fileUrl: "",
  },
  {
    id: 2,
    name: "Sudha & Devraj",
    title: "Architectural Family Home",
    embedUrl: "https://www.youtube.com/embed/Gp3HvUGdCqk?rel=0",
    fileUrl: "",
  },
  {
    id: 3,
    name: "Sandstone Client",
    title: "Luxury Home Journey",
    embedUrl: "https://www.youtube.com/embed/ttKPhXsayWc?rel=0",
    fileUrl: "",
  },
];

/** Convert watch/share YouTube URLs to embed URLs. */
function toYoutubeEmbed(url: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/embed/"))
    return url.includes("rel=0") ? url : `${url}${url.includes("?") ? "&" : "?"}rel=0`;
  const m =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/youtube\.com\/shorts\/([^?&]+)/);
  if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}?rel=0`;
  return url;
}

type Props = {
  testimonials?: ApiTestimonial[];
};

export default function Testimonials({ testimonials: apiTestimonials }: Props) {
  const [playing, setPlaying] = useState<Record<number, boolean>>({});

  const testimonials =
    apiTestimonials && apiTestimonials.length > 0
      ? apiTestimonials.slice(0, 3).map((t) => {
          const fileUrl = t.video_file_url || "";
          const rawUrl = t.video_url || "";
          const isYoutube =
            /youtube\.com|youtu\.be/.test(rawUrl) || rawUrl.includes("youtube.com/embed/");
          return {
            id: t.id,
            name: t.name,
            title: [t.role, t.design].filter(Boolean).join(" · ") || t.review?.slice(0, 80) || "",
            embedUrl: !fileUrl && isYoutube ? toYoutubeEmbed(rawUrl) : "",
            fileUrl: fileUrl || (!isYoutube && rawUrl ? rawUrl : ""),
          };
        })
      : FALLBACK_TESTIMONIALS;

  return (
    <section className="rh-section relative overflow-hidden bg-gradient-to-b from-[#05060A] via-[#0B1220] to-[#05060A] py-28 text-white">
      <div className="rh-orbs" aria-hidden="true">
        <div
          className="rh-orb rh-orb--silver rh-orb--lg rh-orb--drift-a"
          style={{ top: "-14%", left: "-8%" }}
        />
        <div
          className="rh-orb rh-orb--navy rh-orb--md rh-orb--drift-b"
          style={{ bottom: "-12%", right: "-6%" }}
        />
      </div>
      {/* Sapphire ambient glow, slow ambient drift */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[560px] w-[560px] rounded-full bg-[#1B3B6F]/30 blur-[180px] drift-slow" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#C9A227]/[0.07] blur-[180px] drift-slow-reverse" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <Reveal className="mb-16 text-center">
          <p className="text-sm uppercase tracking-[0.45em] text-[#C9A227]">Client Stories</p>
          <h2 className="font-display mt-4 text-5xl md:text-6xl">Hear From Our Homeowners</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/50">
            Discover why families across Sydney trust us to bring their dream homes to life.
          </p>
        </Reveal>

        <RevealGroup className="grid gap-10 lg:grid-cols-3" stagger={0.15}>
          {testimonials.map((video) => {
            const isPlaying = playing[video.id];
            return (
              <RevealItem
                key={video.id}
                className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-700 ease-out hover:-translate-y-1.5 hover:border-[#C9A227]/50 hover:shadow-[0_35px_90px_rgba(201,162,39,0.12)]"
              >
                <span className="pointer-events-none absolute inset-x-6 top-0 z-10 h-px scale-x-0 bg-gradient-to-r from-transparent via-[#C9A227] to-transparent transition-transform duration-500 ease-out group-hover:scale-x-100" />

                <div className="relative aspect-video bg-black">
                  {video.fileUrl ? (
                    <video
                      className="h-full w-full object-cover"
                      src={video.fileUrl}
                      controls
                      playsInline
                      preload="metadata"
                    />
                  ) : video.embedUrl ? (
                    <>
                      {isPlaying ? (
                        <iframe
                          className="h-full w-full"
                          src={`${video.embedUrl}&autoplay=1`}
                          title={video.name}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPlaying((p) => ({ ...p, [video.id]: true }))}
                          aria-label={`Play testimonial from ${video.name}`}
                          className="relative flex h-full w-full items-center justify-center"
                        >
                          <iframe
                            className="pointer-events-none h-full w-full opacity-70"
                            src={video.embedUrl}
                            title={video.name}
                          />
                          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
                          <span className="absolute flex h-16 w-16 items-center justify-center rounded-full border border-[#C9A227]/60 bg-white/10 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-[#C9A227] group-hover:shadow-[0_0_40px_rgba(201,162,39,0.45)]">
                            <Play size={22} className="ml-1 fill-[#E8D9A8] text-[#E8D9A8]" />
                          </span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/40">
                      No video yet
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-medium text-white">{video.name}</h3>
                  <p className="mt-1 text-sm text-white/45 line-clamp-2">{video.title}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>

      <style jsx>{`
        .drift-slow {
          animation: drift 16s ease-in-out infinite;
        }
        .drift-slow-reverse {
          animation: drift 20s ease-in-out infinite reverse;
        }
        @keyframes drift {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(40px, -30px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .drift-slow,
          .drift-slow-reverse {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}