"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { HomeDesign, HomeDesignListItem } from "@/types/home";
import DesignCard from "@/components/home/section/DesignCard";
import { Reveal, luxeEase } from "@/components/common/motion";

type Props = {
  home: HomeDesign;
  designs: HomeDesignListItem[];
};

export default function RelatedHomes({ home, designs }: Props) {
  const related = designs
    .filter((d) => d.slug !== home.slug && d.category === home.category)
    .slice(0, 3);

  if (!related.length) return null;

  return (
    <section className="relative overflow-hidden bg-[#0A1628] py-28 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#D8C7A4]/08 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mb-16 flex flex-col justify-between gap-10 border-b border-white/10 pb-12 md:flex-row md:items-end">
          <Reveal>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#D8C7A4]">
              <span className="h-px w-8 bg-[#D8C7A4]" />
              Explore More
            </p>
            <h2 className="mt-5 font-display text-4xl font-light text-[#F5F0E6] sm:text-5xl">
              Similar Home Designs
            </h2>
            <p className="mt-4 max-w-lg text-lg text-white/50">
              Discover more residences crafted with the same exceptional standard.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <Link
              href="/home-designs"
              className="group inline-flex items-center gap-3 rounded-full border border-[#D8C7A4]/40 px-7 py-3.5 font-medium text-[#D8C7A4] transition hover:bg-[#D8C7A4] hover:text-[#0A1628]"
            >
              View All Designs
              <ArrowUpRight size={17} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-7 lg:grid-cols-2">
          {related.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: luxeEase }}
            >
              <DesignCard
                id={item.id}
                name={item.name}
                beds={item.beds}
                baths={Number(item.baths) || 0}
                garage={item.garage}
                image={item.image || item.hero_image_url || ""}
                price={item.price}
                slug={item.slug}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}