"use client";

import { ArrowRight } from "lucide-react";
import { HomeDesign } from "@/types/home";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/motion";

type Props = { home: HomeDesign };

export default function HomeFeatures({ home }: Props) {
  const features = home.features || [];

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#806D48]">Features</p>
          <h2 className="mt-4 font-display text-4xl text-[#0A1628] sm:text-5xl">Thoughtfully Designed</h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-[#0A1628]/60">
            Every detail is crafted for modern, enduring living.
          </p>
        </Reveal>

        <RevealGroup className="mt-20 grid gap-14 md:grid-cols-2" stagger={0.12}>
          {features.map((feature: any, i: number) => {
            const title = typeof feature === "string" ? feature : feature.title || "Feature";
            const description =
              typeof feature === "object" && feature.description
                ? feature.description
                : "Experience exceptional craftsmanship and thoughtful design in every detail.";

            return (
              <RevealItem key={i}>
                <div className="group">
                  <div className="flex items-start gap-5">
                    <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D8C7A4]/40 text-sm font-semibold text-[#806D48]">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl text-[#0A1628] transition group-hover:text-[#806D48] sm:text-3xl">
                        {title}
                      </h3>
                      <p className="mt-4 text-[16px] leading-relaxed text-[#0A1628]/65">{description}</p>
                      <button className="mt-6 flex items-center gap-2 text-sm font-medium text-[#0A1628] transition group-hover:text-[#806D48]">
                        Discover more
                        <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}