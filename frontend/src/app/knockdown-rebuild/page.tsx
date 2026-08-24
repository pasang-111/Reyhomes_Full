"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Reveal,
  RevealGroup,
  RevealItem,
  luxeEase,
} from "@/components/common/motion";

const highlights = [
  { value: "26", label: "Weeks Timeline" },
  { value: "40%", label: "New Living Space" },
  { value: "25%", label: "Value Increase" },
  { value: "7-Star", label: "Energy Rating" },
];

const steps = [
  {
    number: "01",
    title: "Consultation",
    desc: "We assess your existing home, discuss design options, and put together a plan tailored to your site and budget.",
  },
  {
    number: "02",
    title: "Design & Documentation",
    desc: "From layout to finishes, we work through every detail with you and prepare the full set of working drawings.",
  },
  {
    number: "03",
    title: "Approvals & Demolition",
    desc: "We manage council permits and safely clear the existing structure, leaving a clean site ready to build on.",
  },
  {
    number: "04",
    title: "Construction",
    desc: "Your new home takes shape with regular updates and quality checks at every stage of the build.",
  },
  {
    number: "05",
    title: "Handover",
    desc: "A final inspection and walkthrough before the keys — plus support from us long after you've moved in.",
  },
];

const faqs = [
  {
    q: "How long does a knockdown rebuild take?",
    a: "Most projects run 6–12 months from initial consultation to handover, depending on approvals, site conditions, and the scale of the build.",
  },
  {
    q: "Do I need council approval to demolish my existing home?",
    a: "Yes — we manage the permit and approval process for you, including demolition notices and any conditions your council requires.",
  },
  {
    q: "Is a knockdown rebuild cheaper than renovating?",
    a: "Often, yes. Rebuilding can work out cheaper per square metre than a major renovation or extension, while giving you a home built entirely to current standards.",
  },
];

export default function KnockdownRebuildPage() {
  return (
    <>
      {/* HERO */}
      <section className="rh-section relative overflow-hidden bg-[#0A1420] py-36 text-[#F8F5F0] md:py-44">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#F8F5F0]/[0.06] blur-[160px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[#1E2A44]/40 blur-[100px]" />
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-b"
            style={{ top: "5%", left: "-8%" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.4em] text-[#F8F5F0]/60">
              <span className="h-px w-10 bg-[#F8F5F0]/40" />
              Knockdown & Rebuild
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="max-w-3xl font-display text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
              Love the Street.
              <br />
              <span className="text-[#F8F5F0]/70">Rebuild the House.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-8 max-w-xl text-lg font-light leading-relaxed text-[#F8F5F0]/50 md:text-xl">
              You’ve outgrown your home, but not your neighbourhood. A knockdown
              rebuild lets you keep the location you love and start fresh with a
              home built for how you live now.
            </p>
          </Reveal>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="rh-section bg-[#F8F5F0] py-20">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-a"
            style={{ top: "-20%", right: "5%", opacity: 0.35 }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <RevealGroup
            className="grid gap-8 border-t border-[#0F1C2E]/10 pt-12 sm:grid-cols-2 md:grid-cols-4"
            stagger={0.1}
          >
            {highlights.map((item) => (
              <RevealItem key={item.label}>
                <h3 className="font-display text-5xl font-semibold text-[#0F1C2E]">
                  {item.value}
                </h3>
                <p className="mt-2 text-sm uppercase tracking-[0.3em] text-[#0F1C2E]/50">
                  {item.label}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* PROCESS */}
      <section className="rh-section bg-white py-28">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--navy rh-orb--md rh-orb--drift-c"
            style={{ bottom: "-15%", left: "-8%", opacity: 0.2 }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#0F1C2E]/55">
              How It Works
            </p>
            <h2 className="mt-4 font-display text-4xl font-light text-[#0F1C2E] md:text-5xl">
              Simpler than you’d expect.
            </h2>
          </Reveal>

          <div className="relative mt-16">
            <div className="absolute bottom-2 left-[27px] top-2 w-px bg-[#0F1C2E]/15 md:left-[35px]" />

            <RevealGroup className="space-y-14" stagger={0.12}>
              {steps.map((step) => (
                <RevealItem key={step.number}>
                  <div className="relative flex gap-8">
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#0F1C2E]/15 bg-[#0F1C2E] font-display text-lg text-[#F8F5F0] md:h-[70px] md:w-[70px] md:text-xl">
                      {step.number}
                    </div>
                    <div className="pt-2 md:pt-4">
                      <h3 className="text-2xl font-semibold text-[#0F1C2E]">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-xl leading-7 text-[#0F1C2E]/55">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="rh-section bg-[#F8F5F0] py-28">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-b"
            style={{ top: "-15%", right: "-8%", opacity: 0.35 }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#0F1C2E]/55">
              Common Questions
            </p>
            <h2 className="mt-4 font-display text-4xl font-light text-[#0F1C2E] md:text-5xl">
              What people usually ask
            </h2>
          </Reveal>

          <div className="mt-12 divide-y divide-[#0F1C2E]/10">
            {faqs.map((item, i) => (
              <Reveal key={item.q} delay={i * 0.06}>
                <div className="py-8">
                  <h3 className="text-xl font-semibold text-[#0F1C2E]">
                    {item.q}
                  </h3>
                  <p className="mt-3 leading-7 text-[#0F1C2E]/55">{item.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rh-section relative overflow-hidden bg-[#0A1420] py-32 text-center text-[#F8F5F0]">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F8F5F0]/[0.05] blur-[160px]" />
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-a"
            style={{ bottom: "-10%", left: "5%" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <Reveal>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-[#F8F5F0]/55">
              Thinking About It?
            </p>
            <h2 className="font-display text-4xl font-light leading-tight md:text-6xl">
              Let’s Look at Your Block
            </h2>
            <p className="mt-6 text-lg font-light text-[#F8F5F0]/50">
              Book a free site assessment and we’ll tell you exactly what’s
              possible for your knockdown rebuild.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <Link
              href="/contact"
              className="group mt-12 inline-flex items-center gap-2 rounded-full bg-[#F8F5F0] px-10 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#0F1C2E] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_20px_50px_-12px_rgba(248,245,240,0.35)]"
            >
              Enquire Now
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}