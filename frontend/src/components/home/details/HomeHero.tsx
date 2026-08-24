"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BedDouble, Bath, CarFront, ArrowRight, MoveDiagonal } from "lucide-react";
import Link from "next/link";
import { HomeDesign } from "@/types/home";
import { luxeEase } from "@/components/common/motion";
import WishlistButton from "@/components/auth/WishlistButton";
import ImageSpotlight from "@/components/effects/ImageSpotlight";

type Props = { home: HomeDesign };

export default function HomeHero({ home }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.4]);

  const image =
    home.image || home.hero_image_url || "/placeholder-home.jpg";

  return (
    <section className="relative h-[92dvh] min-h-[580px] overflow-hidden bg-[#0A1628]">
      <motion.div style={{ y }} className="absolute inset-0">
        <ImageSpotlight className="absolute inset-0" radius={260}>
          <Image
            src={image}
            alt={home.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
        </ImageSpotlight>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/85 via-[#0A1628]/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent" />

      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-5 pb-12 pt-28 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20"
      >
        <div className="w-full max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: luxeEase }}
            className="inline-block rounded-full border border-[#D8C7A4]/30 bg-[#D8C7A4]/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D8C7A4]"
          >
            {home.category || "Signature Collection"}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: luxeEase }}
            className="mt-5 font-display text-[clamp(2.4rem,6vw,4.8rem)] leading-[1.05] tracking-tight text-[#F5F0E6]"
          >
            {home.name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: luxeEase }}
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#F5F0E6]/85"
          >
            {home.price ? (
              <span className="text-lg font-medium text-[#D8C7A4]">From {home.price}</span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <BedDouble size={16} className="text-[#D8C7A4]" /> {home.beds} bed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bath size={16} className="text-[#D8C7A4]" /> {home.baths} bath
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CarFront size={16} className="text-[#D8C7A4]" /> {home.garage} car
            </span>
            {home.status ? (
              <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/70">
                {home.status}
              </span>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: luxeEase }}
            className="mt-5 max-w-xl"
          >
            <p
              className={`text-base leading-7 text-[#F5F0E6]/70 transition-all duration-300 sm:text-lg ${
                isExpanded ? "max-h-[280px] overflow-y-auto" : "line-clamp-3"
              }`}
            >
              {home.description}
            </p>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 flex items-center gap-2 text-sm font-medium text-[#D8C7A4] transition hover:text-white"
            >
              {isExpanded ? "Read Less" : "Read More"}
              <ArrowRight size={15} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: luxeEase }}
            className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4"
          >
            {[
              { icon: BedDouble, label: "Bedrooms", value: home.beds },
              { icon: Bath, label: "Bathrooms", value: home.baths },
              { icon: CarFront, label: "Garage", value: home.garage },
              { icon: MoveDiagonal, label: "House Size", value: home.houseSize },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl sm:px-5 sm:py-3.5"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="shrink-0 text-[#D8C7A4]" size={18} />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40">{item.label}</p>
                    <p className="text-lg font-semibold text-white">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: luxeEase }}
            className="mt-10 flex flex-wrap items-center gap-4 sm:gap-5"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">From</p>
              <p className="mt-1 text-3xl font-semibold text-[#D8C7A4] sm:text-4xl">{home.price}</p>
            </div>

            <Link
              href={`/enquire?design=${home.slug}`}
              className="flex items-center gap-3 rounded-full bg-gradient-to-r from-[#E8EAED] via-[#C8CCD4] to-[#9CA3AF] px-7 py-3.5 text-sm font-semibold text-[#0A1628] shadow-[0_10px_28px_rgba(200,204,212,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(200,204,212,0.4)]"
            >
              Enquire Now
              <ArrowRight size={17} />
            </Link>

            <WishlistButton
              size="lg"
              entry={{
                kind: "design",
                id: home.id,
                slug: home.slug,
                name: home.name,
                image: typeof image === "string" ? image : "",
                price: home.price || "",
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
