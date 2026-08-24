"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  ArrowUpRight,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { useRef } from "react";
import {
  Reveal,
  RevealGroup,
  RevealItem,
  luxeEase,
} from "@/components/common/motion";

const explore = [
  { label: "Home Designs", href: "/home-designs" },
  { label: "Home & Land Packages", href: "/home-land" },
  { label: "Knockdown Rebuild", href: "/knockdown-rebuild" },
  { label: "Inclusions", href: "/inclusions" },
];

const company = [
  { label: "About Us", href: "/about" },
  { label: "Our Process", href: "/process-timeline" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "Facebook", href: "#", icon: Facebook },
  { label: "LinkedIn", href: "#", icon: Linkedin },
];

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  /* Smooth springs so parallax doesn’t feel jittery */
  const glowY = useSpring(
    useTransform(scrollYProgress, [0, 1], [80, -40]),
    { stiffness: 80, damping: 28, mass: 0.5 }
  );
  const glowScale = useSpring(
    useTransform(scrollYProgress, [0, 1], [0.85, 1.15]),
    { stiffness: 70, damping: 26 }
  );
  const orbY = useSpring(
    useTransform(scrollYProgress, [0, 1], [60, -30]),
    { stiffness: 60, damping: 24 }
  );
  const contentY = useSpring(
    useTransform(scrollYProgress, [0, 1], [48, 0]),
    { stiffness: 90, damping: 26, mass: 0.45 }
  );
  const contentOpacity = useTransform(scrollYProgress, [0, 0.35], [0.4, 1]);
  const logoY = useSpring(
    useTransform(scrollYProgress, [0, 1], [28, 0]),
    { stiffness: 100, damping: 22 }
  );
  const dividerScale = useTransform(scrollYProgress, [0.2, 0.7], [0.2, 1]);

  return (
    <footer
      ref={sectionRef}
      className="relative overflow-hidden border-t border-[#F8F5F0]/10 bg-[#0A1420] text-[#F8F5F0]"
    >
      {/* Parallax ambient — moves slower / opposite to scroll */}
      <motion.div
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
        style={{
          y: glowY,
          scale: glowScale,
          background:
            "radial-gradient(ellipse, rgba(248,245,240,0.14), transparent 70%)",
        }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 right-0 h-[320px] w-[320px] rounded-full bg-[#1E2A44]/50 blur-[100px]"
        style={{ y: orbY }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-20 left-[10%] h-2 w-2 rounded-full bg-[#F8F5F0]/25"
        style={{
          y: useTransform(scrollYProgress, [0, 1], [40, -20]),
        }}
      />
      <motion.div
        className="pointer-events-none absolute top-32 right-[18%] h-1.5 w-1.5 rounded-full bg-[#F8F5F0]/20"
        style={{
          y: useTransform(scrollYProgress, [0, 1], [30, -50]),
        }}
      />

      <motion.div
        className="relative mx-auto max-w-7xl px-6 pb-10 pt-20 sm:px-10"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <RevealGroup
          className="grid gap-14 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]"
          stagger={0.1}
          amount={0.12}
        >
          {/* Brand + logo */}
          <RevealItem>
            <motion.div style={{ y: logoY }}>
              <Link href="/" className="group inline-flex items-center">
                <Image
                  src="/image/team/reyhomes.png"
                  alt="ReyHomes"
                  width={200}
                  height={56}
                  className="h-11 w-auto object-contain transition duration-500 group-hover:opacity-90 sm:h-12"
                  style={{ maxWidth: "200px" }}
                />
              </Link>
            </motion.div>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#F8F5F0]/55">
              Futuristic residences and curated house &amp; land packages,
              crafted with the finish and calm of a seven-figure build — as
              standard.
            </p>

            <div className="mt-8 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -3, scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F8F5F0]/12 bg-[#F8F5F0]/[0.04] text-[#F8F5F0]/60 transition-colors duration-300 hover:border-[#F8F5F0]/35 hover:bg-[#F8F5F0]/[0.1] hover:text-[#F8F5F0]"
                  >
                    <Icon size={17} strokeWidth={1.7} />
                  </motion.a>
                );
              })}
            </div>
          </RevealItem>

          {/* Explore */}
          <RevealItem>
            <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#F8F5F0]/50">
              Explore
            </h3>
            <ul className="space-y-3">
              {explore.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1.5"
                  >
                    <span className="text-sm text-[#F8F5F0]/55 transition-colors duration-300 group-hover:text-[#F8F5F0]">
                      {item.label}
                    </span>
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-60"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </RevealItem>

          {/* Company */}
          <RevealItem>
            <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#F8F5F0]/50">
              Company
            </h3>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1.5"
                  >
                    <span className="text-sm text-[#F8F5F0]/55 transition-colors duration-300 group-hover:text-[#F8F5F0]">
                      {item.label}
                    </span>
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-60"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </RevealItem>

          {/* Contact */}
          <RevealItem>
            <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#F8F5F0]/50">
              Get In Touch
            </h3>
            <ul className="space-y-4 text-sm text-[#F8F5F0]/55">
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-[#F8F5F0]/70" />
                <a
                  href="tel:1300745837"
                  className="transition-colors hover:text-[#F8F5F0]"
                >
                  1300 SILVER (1300 745 837)
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-[#F8F5F0]/70" />
                <a
                  href="mailto:hello@reyhomes.com.au"
                  className="transition-colors hover:text-[#F8F5F0]"
                >
                  hello@reyhomes.com.au
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#F8F5F0]/70" />
                <span>Level 12, 1 ReyHomes Way, Sydney NSW</span>
              </li>
            </ul>

            <Link
              href="/enquire"
              className="group mt-8 inline-flex items-center gap-2 rounded-full border border-[#F8F5F0]/25 bg-[#F8F5F0]/[0.06] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#F8F5F0] transition-all duration-300 hover:border-[#F8F5F0]/50 hover:bg-[#F8F5F0] hover:text-[#0A1420]"
            >
              Begin your journey
              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </RevealItem>
        </RevealGroup>

        {/* Parallax divider */}
        <motion.div
          className="my-12 h-px w-full origin-center bg-gradient-to-r from-transparent via-[#F8F5F0]/15 to-transparent"
          style={{ scaleX: dividerScale }}
        />

        <Reveal className="flex flex-col items-center justify-between gap-4 text-xs text-[#F8F5F0]/40 sm:flex-row">
          <p>© {new Date().getFullYear()} ReyHomes. All rights reserved.</p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="transition-colors hover:text-[#F8F5F0]/70"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-[#F8F5F0]/70"
            >
              Terms of Service
            </Link>
          </div>
        </Reveal>
      </motion.div>
    </footer>
  );
}