"use client";

import Image from "next/image";
import { Check, Download } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  image: string;
  description: string;
  features: string[];
  index: number;
  slug: string;
  pdfUrl?: string | null;
};

export default function InclusionSection({
  title,
  subtitle,
  image,
  description,
  features,
  index,
  slug,
  pdfUrl,
}: Props) {
  const reversed = index % 2 === 1;
  const tinted = index % 2 === 1;

  const imageBlock = (
    <div className="relative">
      <div className="relative h-[380px] md:h-[480px] w-full overflow-hidden rounded-[28px] ring-1 ring-black/5 shadow-[0_35px_90px_-30px_rgba(0,0,0,0.25)]">
        <Image
          src={image || "/placeholder-inclusion.jpg"}
          alt={title}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      </div>
      <span className="absolute -top-5 -left-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B0B0C] font-display text-xl text-[#3D5A80] shadow-lg">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );

  const contentBlock = (
    <div>
      <p className="flex items-center gap-3 text-sm font-medium uppercase tracking-[4px] text-[#8C1D2C]">
        <span className="h-px w-8 bg-[#8C1D2C]" />
        {subtitle}
      </p>

      <h2 className="mt-5 text-4xl font-light leading-tight text-neutral-900 md:text-5xl">
        {title}
      </h2>

      <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-neutral-500">
        {description}
      </p>

      <ul className="mt-9 space-y-4">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8C1D2C]/10">
              <Check className="h-3 w-3 text-[#8C1D2C]" strokeWidth={3} />
            </span>
            <span className="text-[15px] text-neutral-700">{feature}</span>
          </li>
        ))}
      </ul>

      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#8C1D2C]/40 bg-[#8C1D2C]/5 px-6 py-3 text-[13px] font-medium uppercase tracking-wider text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
        >
          <Download size={15} />
          Download Brochure PDF
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="No PDF uploaded for this inclusion yet"
          className="mt-10 inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-[13px] font-medium uppercase tracking-wider text-neutral-400"
        >
          <Download size={15} />
          Download Brochure
          <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
            Coming Soon
          </span>
        </button>
      )}
    </div>
  );

  return (
    <section
      id={slug}
      className={`scroll-mt-32 py-24 md:py-28 ${tinted ? "bg-[#F8F6F2]" : "bg-white"}`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 md:grid-cols-2 lg:gap-20">
          {reversed ? (
            <>
              {contentBlock}
              {imageBlock}
            </>
          ) : (
            <>
              {imageBlock}
              {contentBlock}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
