"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { motion } from "framer-motion";

import { AuthBackground, AuthBrandLogo, BRAND_FONT, COLOR, EASE } from "@/components/auth/AuthUI";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
  return (
    <AuthBackground>
      <Link
        href="/"
        aria-label="Exit and return home"
        title="Return home"
        className="fixed right-5 top-5 z-[100] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/60 backdrop-blur-xl transition hover:border-[#D8C7A4]/40 hover:bg-black/40 hover:text-[#D8C7A4]"
      >
        <X size={18} strokeWidth={1.6} />
      </Link>
      <div className="flex min-h-screen items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <div className="mb-9 text-center">
            <div className="mb-8 flex justify-center">
              <AuthBrandLogo height={44} />
            </div>
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.35em]" style={{ color: COLOR.brass }}>
              {eyebrow}
            </p>
            <h1 className="text-4xl font-light tracking-tight" style={{ color: COLOR.cream, fontFamily: BRAND_FONT }}>
              {title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: COLOR.creamFaint }}>
              {subtitle}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="rounded-[26px] border p-7 sm:p-9"
            style={{
              borderColor: COLOR.border,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(12,42,68,0.85) 50%, rgba(8,32,54,0.95) 100%)",
              backdropFilter: "blur(28px) saturate(160%)",
              WebkitBackdropFilter: "blur(28px) saturate(160%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 25px 70px -20px rgba(0,0,0,0.65)",
            }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </AuthBackground>
  );
}