"use client";

import Image from "next/image";

import { useCallback, useEffect, useState } from "react";
import { X, Share2, Copy, Download, Loader2 } from "lucide-react";
import {
  getDesignReview,
  getPackageReview,
  reviewPdfAbsoluteUrl,
  type ReviewPayload,
} from "@/lib/api/review";
import { ApiError } from "@/lib/api/client";

type Props = {
  open: boolean;
  onClose: () => void;
  kind: "design" | "package";
  slug: string;
};

export default function ReviewDialog({ open, onClose, kind, slug }: Props) {
  const [data, setData] = useState<ReviewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    const load = kind === "design" ? getDesignReview(slug) : getPackageReview(slug);
    load
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg =
          err instanceof ApiError
            ? err.message
            : "Could not load the review. Please try again.";
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, kind, slug]);

  const shareUrl =
    typeof window !== "undefined" && data?.share_path
      ? `${window.location.origin}${data.share_path}`
      : data?.share_path || "";

  const pdfUrl = data ? reviewPdfAbsoluteUrl(data.pdf_url) : "";

  const handleShare = useCallback(async () => {
    if (!shareUrl) return;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: data?.title || "ReyHomes review",
          text: data?.subtitle || "Floor plan & inclusions review",
          url: shareUrl,
        });
        return;
      }
    } catch {
      /* user cancelled or share failed — fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy link. Copy it manually from the address bar on the share page.");
    }
  }, [shareUrl, data]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Floor plan and inclusions review"
      onClick={onClose}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#0c1219] shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {data?.title || "Review"}
            </p>
            {data?.subtitle ? (
              <p className="truncate text-xs text-white/45">{data.subtitle}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </a>
            ) : null}
            <button
              type="button"
              onClick={handleShare}
              disabled={!shareUrl}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#D8C7A4] px-3 py-1.5 text-xs font-medium text-[#0A1628] disabled:opacity-40"
            >
              {copied ? (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copied
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" /> Share
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-24 text-white/50">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading review…
            </div>
          ) : error ? (
            <div className="space-y-3 px-5 py-16 text-center">
              <p className="text-sm text-red-300/90">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  const load =
                    kind === "design" ? getDesignReview(slug) : getPackageReview(slug);
                  load
                    .then(setData)
                    .catch((err) =>
                      setError(
                        err instanceof ApiError
                          ? err.message
                          : "Could not load the review."
                      )
                    )
                    .finally(() => setLoading(false));
                }}
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/80 hover:bg-white/5"
              >
                Retry
              </button>
            </div>
          ) : data ? (
            <div className="space-y-6 p-4 sm:p-6">
              {data.floor_plan_url ? (
                <section>
                  <h3 className="mb-2 text-xs uppercase tracking-wider text-white/40">
                    Floor plan
                  </h3>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <Image
                    src={data.floor_plan_url}
                    alt={`${data.title} floor plan`}
                    width={1000}
                    height={750}
                    className="w-full rounded-xl border border-white/10 bg-white/5 object-contain"
                    unoptimized
                  />
                </section>
              ) : (
                <p className="text-sm text-white/40">No floor plan available.</p>
              )}

              {data.inclusions?.length ? (
                <section className="space-y-4">
                  <h3 className="text-xs uppercase tracking-wider text-white/40">
                    Inclusions
                  </h3>
                  {data.inclusions.map((inc) => (
                    <article
                      key={inc.id}
                      className="rounded-xl border border-white/10 bg-white/[.03] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row">
                        {inc.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <Image
                            src={inc.image_url}
                            alt={inc.title}
                            width={288}
                            height={112}
                            className="h-28 w-full rounded-lg object-cover sm:h-24 sm:w-36"
                            unoptimized
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-white">{inc.title}</h4>
                          {inc.category ? (
                            <p className="text-xs text-white/40">{inc.category}</p>
                          ) : null}
                          {inc.description ? (
                            <p className="mt-1 text-sm text-white/65">{inc.description}</p>
                          ) : null}
                          {inc.features?.length ? (
                            <ul className="mt-2 list-inside list-disc text-xs text-white/50">
                              {inc.features.map((f) => (
                                <li key={f}>{f}</li>
                              ))}
                            </ul>
                          ) : null}
                          {inc.pdf_url ? (
                            <a
                              href={inc.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-xs text-[#D8C7A4] underline-offset-2 hover:underline"
                            >
                              Download brochure PDF
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </section>
              ) : (
                <p className="text-sm text-white/40">No linked inclusions yet.</p>
              )}

              {pdfUrl ? (
                <section>
                  <h3 className="mb-2 text-xs uppercase tracking-wider text-white/40">
                    Combined PDF
                  </h3>
                  <iframe
                    title="Combined review PDF"
                    src={pdfUrl}
                    className="h-[50vh] w-full rounded-xl border border-white/10 bg-white"
                  />
                </section>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
