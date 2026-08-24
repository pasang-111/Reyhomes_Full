"use client";

import { Check, FileText, ExternalLink } from "lucide-react";
import type { HomeDesign, InclusionItem } from "@/types/home";
import { inclusionLabel } from "@/types/home";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/motion";
import ReviewTrigger from "@/components/review/ReviewTrigger";
import { API_BASE } from "@/lib/api/client";

type Props = { home: HomeDesign };

function absUrl(url?: string | null) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = (API_BASE || "").replace(/\/$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

export default function HomeInclusions({ home }: Props) {
  const inclusions = home.inclusions || [];
  if (!inclusions.length) return null;

  return (
    <section id="inclusions" className="scroll-mt-24 bg-[#F5F0E6] py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#806D48]">
            Inclusions
          </p>
          <h2 className="mt-4 font-display text-4xl text-[#0A1628] sm:text-5xl">
            What’s included
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-[#0A1628]/55">
            Brochure PDFs open without signing in.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2" stagger={0.06}>
          {inclusions.map((item: InclusionItem, i: number) => {
            const label = inclusionLabel(item);
            const pdf =
              typeof item === "object" && item && "pdf_url" in item
                ? absUrl(item.pdf_url)
                : "";
            const features =
              typeof item === "object" && item && Array.isArray(item.features)
                ? item.features
                : [];
            return (
              <RevealItem key={typeof item === "object" ? item.id : i}>
                <div className="rounded-2xl border border-[#0A1628]/08 bg-white/80 px-5 py-4 transition hover:border-[#D8C7A4]/50">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D8C7A4]/25">
                      <Check size={14} className="text-[#806D48]" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-[#0A1628]/90">{label}</span>
                      {features.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-[#0A1628]/55">
                          {features.slice(0, 4).map((f) => (
                            <li key={f}>· {f}</li>
                          ))}
                        </ul>
                      )}
                      {pdf ? (
                        <a
                          href={pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#806D48] hover:text-[#0A1628]"
                        >
                          <FileText size={13} /> Brochure PDF <ExternalLink size={12} />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {home.slug ? (
          <div className="mt-12 flex justify-center">
            <ReviewTrigger
              kind="design"
              slug={home.slug}
              variant="light"
              label="Review floor plan & inclusions"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
