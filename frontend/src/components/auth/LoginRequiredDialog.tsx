"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Heart, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Where to return after login */
  nextPath?: string;
  message?: string;
};

export default function LoginRequiredDialog({
  open,
  onClose,
  nextPath = "/wishlist",
  message = "Please log in to save homes to your wishlist and view saved properties.",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;
  const registerHref = `/register?next=${encodeURIComponent(nextPath)}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-required-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[#D8C7A4]/25 bg-[#0A1628] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.55)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-white/30 hover:text-white"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D8C7A4]/40 bg-[#D8C7A4]/10">
          <Heart size={24} className="text-[#D8C7A4]" strokeWidth={1.8} />
        </div>

        <h2
          id="login-required-title"
          className="mt-5 text-center font-display text-2xl text-[#F5F0E6]"
        >
          Please log in
        </h2>
        <p className="mt-3 text-center text-sm leading-6 text-white/60">{message}</p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={loginHref}
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#E8EAED] via-[#C8CCD4] to-[#9CA3AF] px-6 py-3.5 text-sm font-semibold text-[#0A1628] transition hover:-translate-y-0.5"
          >
            Log in
          </Link>
          <Link
            href={registerHref}
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-medium text-[#F5F0E6] transition hover:border-[#D8C7A4]/50 hover:bg-white/10"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
