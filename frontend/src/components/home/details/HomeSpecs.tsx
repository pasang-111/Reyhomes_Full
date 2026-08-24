"use client";

import { BedDouble, Bath, CarFront, Ruler, Building2, Sofa, BookOpen } from "lucide-react";
import { HomeDesign } from "@/types/home";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/motion";
import { formatArea, formatMetres } from "@/lib/units";

type Props = { home: HomeDesign };

const getSpecs = (home: HomeDesign) => [
  { icon: Ruler, label: "House Area", value: formatArea(home.houseSize || home.house_size) },
  { icon: BedDouble, label: "Bedrooms", value: home.beds },
  { icon: Bath, label: "Bathrooms", value: home.baths },
  { icon: Sofa, label: "Living", value: home.living },
  { icon: CarFront, label: "Garage", value: home.garage },
  { icon: Building2, label: "Width", value: formatMetres(home.width || home.frontage) },
  { icon: Ruler, label: "Length", value: formatMetres(home.length || home.depth) },
  { icon: BookOpen, label: "Study", value: home.study },
];

export default function HomeSpecs({ home }: Props) {
  return (
    <section className="bg-[#F5F0E6] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#806D48]">Home Information</p>
          <h2 className="mt-4 font-display text-4xl text-[#0A1628] sm:text-5xl">Every Detail Matters</h2>
          <p className="mt-5 text-lg leading-8 text-[#0A1628]/60">
            Carefully planned dimensions and premium features create a home that feels luxurious every day.
          </p>
        </Reveal>

        <RevealGroup className="mt-16 grid border-t border-[#0A1628]/10 md:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
          {getSpecs(home).map((item) => {
            const Icon = item.icon;
            return (
              <RevealItem key={item.label}>
                <div className="group border-b border-[#0A1628]/10 p-7 transition hover:bg-white/60">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D8C7A4]/15 transition group-hover:bg-[#D8C7A4]">
                      <Icon className="h-5 w-5 text-[#806D48] transition group-hover:text-[#0A1628]" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#0A1628]/40">{item.label}</p>
                      <p className="mt-1 font-display text-2xl text-[#0A1628]">{item.value || "—"}</p>
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