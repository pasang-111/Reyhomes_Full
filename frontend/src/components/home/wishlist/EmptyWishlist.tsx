"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export default function EmptyWishlist() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center text-center px-6">
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(140,29,44,0.15), rgba(199,201,204,0.06))",
          border: "1px solid rgba(140,29,44,0.25)",
        }}
      >
        <Heart size={44} className="text-[#D8C7A4]" fill="#D8C7A4" fillOpacity={0.2} />
      </div>

      <h2 className="mt-8 text-4xl sm:text-5xl font-light text-white tracking-tight">
        Your wishlist is empty
      </h2>

      <p className="mt-4 max-w-md text-white/45 leading-relaxed">
        Save your favourite home designs and home &amp; land packages here to
        compare them later — sign in to keep them synced across devices.
      </p>

      <div className="flex flex-wrap justify-center gap-4 mt-10">
        <Link
          href="/home-designs"
          className="rounded-full px-8 py-4 font-semibold text-[13px] uppercase tracking-[1.5px] text-white transition-transform duration-300 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(180deg, #8C1D2C, #5A0F17)", boxShadow: "0 10px 30px -10px rgba(140,29,44,0.5)" }}
        >
          Browse Designs
        </Link>
        <Link
          href="/home-land"
          className="rounded-full px-8 py-4 font-semibold text-[13px] uppercase tracking-[1.5px] text-[#0B0B0C] transition-transform duration-300 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(180deg, #F1F1F3, #C7C9CC)" }}
        >
          Browse Home &amp; Land
        </Link>
      </div>
    </section>
  );
}
