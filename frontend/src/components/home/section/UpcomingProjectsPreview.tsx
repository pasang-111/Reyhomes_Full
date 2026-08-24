"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

import type { ProjectListItem } from "@/lib/api/projects";
import {
  Reveal,
  ParallaxScale,
  luxeEase,
} from "@/components/common/motion";

type Props = {
  projects: ProjectListItem[];
};

export default function UpcomingProjectsPreview({
  projects,
}: Props) {
  if (!projects?.length) return null;

  return (
    <section className="rh-section performance-section bg-[#080909] py-20 text-white sm:py-28">
      <div className="rh-orbs" aria-hidden="true">
        <div
          className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-c"
          style={{ top: "10%", left: "-6%" }}
        />
        <div
          className="rh-orb rh-orb--navy rh-orb--lg rh-orb--drift-a"
          style={{ bottom: "-18%", right: "10%" }}
        />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.5em] text-[#d8c7a4]">
              Next addresses
            </p>

            <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[.9]">
              Upcoming projects.
            </h2>

            <p className="mt-6 max-w-xl text-white/50">
              A preview of residences and developments currently
              moving toward their next chapter.
            </p>
          </div>

          <Link
            href="/projects"
            className="moon-button-dark inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs uppercase tracking-[.14em]"
          >
            View all projects
            <ArrowUpRight size={15} />
          </Link>
        </Reveal>

        {/* Projects */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {projects.slice(0, 2).map((project, index) => (
            <motion.div
              key={project.id}
              initial={{
                opacity: 0,
                y: 60,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.9,
                delay: index * 0.15,
                ease: luxeEase,
              }}
            >
              <Link
                href={`/projects/${project.slug}`}
                className="group relative block overflow-hidden rounded-[30px] border border-white/10 bg-white/[.03]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {/* Hero Image */}
                  {project.hero_image_url ? (
                    <ParallaxScale
                      className="absolute inset-0"
                      yRange={["-36px", "36px"]}
                      scaleRange={[1.18, 1.04]}
                    >
                      <Image
                        src={project.hero_image_url}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition duration-1000 group-hover:scale-[1.06]"
                      />
                    </ParallaxScale>
                  ) : (
                    <div className="absolute inset-0 bg-[#121416]" />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-[.4em] text-[#d8c7a4]">
                        {project.status
                          ? project.status.replaceAll("_", " ")
                          : "Upcoming"}
                      </p>

                      <h3 className="mt-2 font-display text-3xl sm:text-4xl">
                        {project.title}
                      </h3>

                      {project.location && (
                        <p className="mt-1 text-sm text-white/50">
                          {project.location}
                        </p>
                      )}
                    </div>

                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/20 transition group-hover:bg-white group-hover:text-black">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}