import Link from "next/link";

import {
  ArrowRight,
  Building2,
  Clock3,
} from "lucide-react";

import { getHeroSlides } from "@/lib/api/hero";
import { getDesigns } from "@/lib/api/designs";
import { getPackages } from "@/lib/api/packages";
import { getInclusions } from "@/lib/api/inclusions";
import { getTestimonials } from "@/lib/api/testimonials";
import { getProjects } from "@/lib/api/projects";
import { safeList } from "@/lib/api/safe";
import ApiErrorBanner from "@/components/common/ApiErrorBanner";

import HeroCarousel from "@/components/home/hero/HeroCarousel";

import FeaturedDesigns from "@/components/home/section/FeaturedDesigns";

import HomeLandPackages from "@/components/home/section/HomeLandPackages";

import InclusionsPreview from "@/components/home/section/InclusionsPreview";

import VideoCarousel from "@/components/home/section/VideoCarousel";

import Stats from "@/components/home/section/Stats";

import Testimonials from "@/components/home/section/Testimonials";

import UpcomingProjectsPreview from "@/components/home/section/UpcomingProjectsPreview";

import PracticeStrip from "@/components/home/section/PracticeStrip";
import AboutPreview from "@/components/home/section/AboutPreview";

export default async function HomePage() {
  const [
    heroRes,
    designsRes,
    packagesRes,
    inclusionsRes,
    testimonialsRes,
    upcomingRes,
  ] = await Promise.all([
    safeList(() => getHeroSlides()),
    safeList(() => getDesigns()),
    safeList(() => getPackages()),
    safeList(() => getInclusions()),
    safeList(() => getTestimonials()),
    safeList(() => getProjects({ status: "upcoming" })),
  ]);

  const heroSlides = heroRes.data;
  const designs = designsRes.data;
  const packages = packagesRes.data;
  const inclusions = inclusionsRes.data;
  const testimonials = testimonialsRes.data;
  const upcomingProjects = upcomingRes.data;

  const pageError =
    heroRes.error ||
    designsRes.error ||
    packagesRes.error ||
    inclusionsRes.error ||
    testimonialsRes.error ||
    upcomingRes.error;

  return (
    <>
      <ApiErrorBanner
        message={pageError}
        className="mx-auto max-w-7xl mt-6 px-5 relative z-20"
      />
      <HeroCarousel
        slides={heroSlides ?? []}
        designs={designs ?? []}
        packages={packages ?? []}
      />

      <FeaturedDesigns
        designs={designs ?? []}
      />

      <PracticeStrip />

      <AboutPreview />

      <HomeLandPackages
        packages={packages ?? []}
      />

      <InclusionsPreview
        inclusions={inclusions ?? []}
      />

      {/* PROCESS + PROJECTS */}
      <section className="relative overflow-hidden bg-[#07111f] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="pointer-events-none absolute left-[-10%] top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-400/[0.05] blur-[150px]" />

        <div className="pointer-events-none absolute bottom-[-20%] right-[-5%] h-[600px] w-[600px] rounded-full bg-[#D8C7A4]/[0.05] blur-[180px]" />

        <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <Link
            href="/process-timeline"
            className="group relative min-h-[420px] overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.025] p-8 transition duration-500 hover:-translate-y-2 hover:border-[#D8C7A4]/40 sm:p-10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,199,164,.12),transparent_45%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D8C7A4]/25 bg-[#D8C7A4]/[0.06] text-[#D8C7A4]">
                  <Clock3 size={24} />
                </div>

                <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D8C7A4]">
                  The ReyHomes Journey
                </p>

                <h2 className="mt-4 max-w-md font-display text-4xl font-light leading-tight text-[#F8F5F0] sm:text-5xl">
                  From vision to
                  <br />
                  your new beginning.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/50">
                  Discover every stage of
                  the ReyHomes building
                  journey, from your first
                  consultation through to
                  handover.
                </p>
              </div>

              <div className="mt-10 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#F8F5F0]">
                Explore our process

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-2"
                />
              </div>
            </div>
          </Link>

          <Link
            href="/projects"
            className="group relative min-h-[420px] overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.025] p-8 transition duration-500 hover:-translate-y-2 hover:border-cyan-300/30 sm:p-10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(80,180,255,.12),transparent_45%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.04] text-cyan-100">
                  <Building2 size={24} />
                </div>

                <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-100/70">
                  ReyHomes Projects
                </p>

                <h2 className="mt-4 max-w-md font-display text-4xl font-light leading-tight text-[#F8F5F0] sm:text-5xl">
                  Addresses designed
                  <br />
                  to stand apart.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/50">
                  Explore upcoming,
                  current and completed
                  ReyHomes projects and
                  discover the places we
                  are creating.
                </p>
              </div>

              <div className="mt-10 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#F8F5F0]">
                View all projects

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-2"
                />
              </div>
            </div>
          </Link>
        </div>
      </section>

      <UpcomingProjectsPreview
        projects={upcomingProjects ?? []}
      />

      <VideoCarousel
        testimonials={testimonials ?? []}
      />

      <Stats />

      <Testimonials
        testimonials={testimonials ?? []}
      />
    </>
  );
}