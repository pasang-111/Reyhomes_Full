"use client";

import { Download } from "lucide-react";
import { API_BASE } from "@/lib/api/client";

type Props = { slug: string; name?: string };

/** Downloads design review pack PDF from Django API */
export default function DesignPackButton({ slug, name }: Props) {
  const href = `${API_BASE}/api/designs/${encodeURIComponent(slug)}/review-pdf/`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 rounded-full border border-[#D8C7A4]/45 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D8C7A4] transition hover:bg-[#D8C7A4]/10"
      aria-label={`Download design pack for ${name || slug}`}
    >
      <Download size={14} className="transition group-hover:-translate-y-0.5" />
      Design pack PDF
    </a>
  );
}
