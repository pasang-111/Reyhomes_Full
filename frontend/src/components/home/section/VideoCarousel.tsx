"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Testimonial } from "@/lib/api/testimonials";
import VideoPlayer from "./VideoPlayer";
import VideoThumbnail from "./VideoThumbnail";
import { Reveal } from "@/components/common/motion";
import {
  toVideoItem,
  filterVideoTestimonials,
  type VideoItem,
} from "@/lib/video";

const FALLBACK_VIDEO: VideoItem = {
  id: 0,
  title: "Client Story",
  subtitle: "",
  thumbnail: "",
  embedUrl: "",
  videoFileUrl: "",
};

type Props = {
  testimonials: Testimonial[];
};

export default function VideoCarousel({ testimonials }: Props) {
  const videos =
    (() => {
    const withVideo = filterVideoTestimonials(testimonials);
    return withVideo.length > 0
      ? withVideo.map(toVideoItem)
      : testimonials.length > 0
        ? testimonials.map(toVideoItem)
        : [FALLBACK_VIDEO];
  })();

  const [selectedVideo, setSelectedVideo] = useState<VideoItem>(videos[0]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const drag = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  const CARD_WIDTH = 364;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -CARD_WIDTH * 2 : CARD_WIDTH * 2,
      behavior: "smooth",
    });
  };

  return (
    <section className="rh-section relative overflow-hidden bg-[#0A1420] py-36 text-[#F8F5F0]">
      <div className="rh-orbs" aria-hidden="true">
        <div
          className="rh-orb rh-orb--navy rh-orb--lg rh-orb--drift-b"
          style={{ top: "-16%", left: "-10%" }}
        />
        <div
          className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-a"
          style={{ bottom: "-10%", right: "-6%" }}
        />
      </div>
      {/* Soft navy glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,42,68,0.35),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(248,245,240,0.03),transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <Reveal className="mb-16 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#F8F5F0]/60">
              VIDEO COLLECTION
            </p>

            <h2 className="mt-5 font-display text-5xl leading-tight text-[#F8F5F0] md:text-6xl">
              Experience Our
              <br />
              Display Homes
            </h2>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#F8F5F0]/55">
              Explore premium walkthroughs showcasing architectural
              craftsmanship, luxury interiors and timeless family living.
            </p>
          </div>

          <div className="hidden text-right lg:block">
            <p className="text-[11px] uppercase tracking-[0.4em] text-[#F8F5F0]/40">
              Featured Tour
            </p>
            <h3 className="mt-3 text-3xl font-display text-[#F8F5F0]">
              {selectedVideo.title}
            </h3>
          </div>
        </Reveal>

        {/* Main Player – updates when a thumbnail is clicked */}
        <VideoPlayer
          title={selectedVideo.title}
          description={
            selectedVideo.subtitle ||
            "Take a cinematic walkthrough of Rey Homes display homes."
          }
          videoFileUrl={selectedVideo.videoFileUrl}
          embedUrl={selectedVideo.embedUrl}
          current={videos.findIndex((v) => v.id === selectedVideo.id) + 1}
          total={videos.length}
        />

        {/* Thumbnail Rail */}
        <div className="relative mt-16">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#F8F5F0]/15 bg-[#F8F5F0]/5 backdrop-blur-xl transition hover:border-[#F8F5F0] hover:bg-[#F8F5F0] hover:text-[#0F1C2E] lg:flex"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#F8F5F0]/15 bg-[#F8F5F0]/5 backdrop-blur-xl transition hover:border-[#F8F5F0] hover:bg-[#F8F5F0] hover:text-[#0F1C2E] lg:flex"
          >
            <ChevronRight size={22} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar"
            onMouseDown={(e) => {
              drag.current.isDown = true;
              drag.current.startX = e.pageX;
              drag.current.scrollLeft = scrollRef.current?.scrollLeft ?? 0;
            }}
            onMouseLeave={() => (drag.current.isDown = false)}
            onMouseUp={() => (drag.current.isDown = false)}
            onMouseMove={(e) => {
              if (!drag.current.isDown || !scrollRef.current) return;
              e.preventDefault();
              const walk = e.pageX - drag.current.startX;
              scrollRef.current.scrollLeft = drag.current.scrollLeft - walk * 0.9;
            }}
          >
            {videos.map((video) => (
              <VideoThumbnail
                key={video.id}
                active={selectedVideo.id === video.id}
                title={video.title}
                thumbnail={video.thumbnail}
                onClick={() => setSelectedVideo(video)} // ← redirects to main player
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}