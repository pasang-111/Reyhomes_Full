"use client";

import Image from "next/image";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getReviewByToken,
  reviewPdfAbsoluteUrl,
  type ReviewPayload,
} from "@/lib/api/review";
import { ApiError } from "@/lib/api/client";

export default function PublicReviewPage() {
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "";
  const [data, setData] = useState<ReviewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getReviewByToken(token)
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "This review link is invalid or expired."
        )
      )
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <main className="min-h-screen bg-[#07080a] px-4 py-10 text-[var(--theme-fg,#fbf7e6)]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-xs text-white/40 hover:text-white/70">
          ← ReyHomes
        </Link>
        {loading ? (
          <p className="mt-16 text-center text-white/50">Loading review…</p>
        ) : error ? (
          <p className="mt-16 text-center text-red-300/90">{error}</p>
        ) : data ? (
          <div className="mt-8 space-y-8">
            <header>
              <h1 className="font-serif text-3xl text-white">{data.title}</h1>
              {data.subtitle ? (
                <p className="mt-1 text-white/50">{data.subtitle}</p>
              ) : null}
              {data.pdf_url ? (
                <a
                  href={reviewPdfAbsoluteUrl(data.pdf_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-full bg-[#D8C7A4] px-4 py-2 text-sm font-medium text-[#0A1628]"
                >
                  Open combined PDF
                </a>
              ) : null}
            </header>
            {data.floor_plan_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <Image
                src={data.floor_plan_url}
                alt="Floor plan"
                width={1200}
                height={900}
                className="w-full rounded-2xl border border-white/10"
                unoptimized
              />
            ) : null}
            <div className="space-y-4">
              {data.inclusions?.map((inc) => (
                <div
                  key={inc.id}
                  className="rounded-2xl border border-white/10 bg-white/[.03] p-4"
                >
                  <h2 className="text-lg text-white">{inc.title}</h2>
                  {inc.description ? (
                    <p className="mt-1 text-sm text-white/60">{inc.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
