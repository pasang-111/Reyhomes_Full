"use client";

import {
  MapPin,
  Ruler,
  Home,
  BedDouble,
  Bath,
  CarFront,
  Trees,
  School,
  ShoppingBag,
} from "lucide-react";
import { HomeLandPackage } from "@/types/land";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/motion";

type Props = { land: HomeLandPackage };

export default function LandInformation({ land }: Props) {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal className="mb-16 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#806D48]">
            Estate Information
          </p>
          <h2 className="mt-4 font-display text-4xl text-[#0A1628] sm:text-5xl">
            A Location You’ll Love
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-[#0A1628]/60">
            Discover premium living in one of Australia’s most desirable
            communities.
          </p>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Specs Card */}
          <Reveal>
            <div className="rounded-[28px] border border-[#0A1628]/08 bg-[#F5F0E6] p-8 sm:p-10">
              <h3 className="font-display text-2xl text-[#0A1628] sm:text-3xl">
                Package Specifications
              </h3>

              <div className="mt-10 space-y-5">
                <InfoRow
                  icon={<MapPin size={18} />}
                  title="Location"
                  value={`${land.suburb ?? ""}, ${land.state ?? ""}`}
                />
                <InfoRow
                  icon={<Ruler size={18} />}
                  title="Land Size"
                  value={land.landSize ?? "—"}
                />
                <InfoRow
                  icon={<Home size={18} />}
                  title="House Size"
                  value={land.houseSize ?? "—"}
                />
                <InfoRow
                  icon={<BedDouble size={18} />}
                  title="Bedrooms"
                  value={String(land.beds ?? "—")}
                />
                <InfoRow
                  icon={<Bath size={18} />}
                  title="Bathrooms"
                  value={String(land.baths ?? "—")}
                />
                <InfoRow
                  icon={<CarFront size={18} />}
                  title="Garage"
                  value={String(land.garage ?? "—")}
                />
              </div>
            </div>
          </Reveal>

          {/* Lifestyle */}
          <div>
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#806D48]">
                Lifestyle
              </p>
              <h3 className="mt-4 font-display text-3xl text-[#0A1628] sm:text-4xl">
                Everything Within Reach
              </h3>
              <p className="mt-6 text-lg leading-8 text-[#0A1628]/60">
                Located within a thriving master-planned community,{" "}
                <strong className="text-[#0A1628]">{land.title}</strong> offers
                excellent connectivity, beautiful parklands and outstanding
                amenities.
              </p>
            </Reveal>

            <RevealGroup className="mt-10 space-y-4" stagger={0.08}>
              <RevealItem>
                <Amenity
                  icon={<Trees size={18} />}
                  title="Parks & Recreation"
                  text="Walking trails, playgrounds and green open spaces."
                />
              </RevealItem>
              <RevealItem>
                <Amenity
                  icon={<School size={18} />}
                  title="Schools Nearby"
                  text="Highly regarded public and private education options."
                />
              </RevealItem>
              <RevealItem>
                <Amenity
                  icon={<ShoppingBag size={18} />}
                  title="Shopping & Dining"
                  text="Retail centres, cafés and everyday convenience."
                />
              </RevealItem>
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#0A1628]/10 pb-4">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D8C7A4]/20 text-[#806D48]">
          {icon}
        </div>
        <span className="text-[#0A1628]/65">{title}</span>
      </div>
      <span className="font-semibold text-[#0A1628]">{value}</span>
    </div>
  );
}

function Amenity({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-5 rounded-2xl border border-[#0A1628]/08 bg-[#F5F0E6] p-5 transition hover:border-[#D8C7A4]/50">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D8C7A4]/20 text-[#806D48]">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-[#0A1628]">{title}</h4>
        <p className="mt-1 text-sm leading-6 text-[#0A1628]/60">{text}</p>
      </div>
    </div>
  );
}