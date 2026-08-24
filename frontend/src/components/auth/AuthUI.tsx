"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* -------------------------------------------------------
   TOKENS — shared across Login / Register / Forgot Password
------------------------------------------------------- */
export const EASE = [0.32, 0.72, 0, 1] as const;
export const BRAND_FONT =
  '"Playfair Display", "Cormorant Garamond", Georgia, "Times New Roman", serif';

export const COLOR = {
  ink: "#061826",
  navy: "#0C2A44",
  navySoft: "#153A5B",
  brass: "#D8C7A4",
  brassSoft: "rgba(216, 199, 164, 0.14)",
  cream: "#F8F5F0",
  creamMuted: "rgba(248, 245, 240, 0.6)",
  creamFaint: "rgba(248, 245, 240, 0.35)",
  tide: "#4FA6A8",
  rust: "#C2795E",
  border: "rgba(248, 245, 240, 0.14)",
  borderSoft: "rgba(248, 245, 240, 0.08)",
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Official brand mark for auth screens (login / register / forgot). */
export function AuthBrandLogo({
  className = "",
  height = 40,
}: {
  className?: string;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href="/"
      className={`inline-flex items-center transition-opacity hover:opacity-90 ${className}`}
      aria-label="ReyHomes home"
    >
      {failed ? (
        <span
          className="font-light tracking-[0.2em]"
          style={{
            fontFamily: BRAND_FONT,
            color: COLOR.cream,
            fontSize: height * 0.55,
            textShadow: "0 0 24px rgba(216,199,164,0.25)",
          }}
        >
          REY HOMES
        </span>
      ) : (
        <Image
          src="/image/team/reyhomes.png"
          alt="ReyHomes"
          width={Math.round(height * 3.4)}
          height={height}
          priority
          className="w-auto object-contain"
          style={{
            height,
            maxWidth: height * 4,
            filter: "drop-shadow(0 0 18px rgba(216,199,164,0.22))",
          }}
          onError={() => setFailed(true)}
        />
      )}
    </Link>
  );
}


/** Shared page background + ambient glow, used by every auth page. */
export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${COLOR.navy} 0%, ${COLOR.ink} 100%)` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(55% 45% at 12% 8%, rgba(40,120,180,0.16) 0%, transparent 55%), radial-gradient(50% 40% at 92% 90%, rgba(216,199,164,0.10) 0%, transparent 55%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

/** The glass card shell every auth form sits inside. */
export function AuthCard({
  children,
  shake = false,
}: {
  children: React.ReactNode;
  shake?: boolean;
}) {
  return (
    <motion.div
      animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-[26px] border p-7 sm:p-9"
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
  );
}

/* -------------------------------------------------------
   BLUEPRINT — the signature element
   A top-down floor plan that constructs itself as the
   person moves through any auth flow.
   foundation -> outer walls only
   framed     -> + interior wall, door, windows, dimensions
   complete   -> + window glow and an approval stamp
------------------------------------------------------- */
export type BlueprintStage = "foundation" | "framed" | "complete";

export function Blueprint({
  stage,
  compact = false,
}: {
  stage: BlueprintStage;
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const framed = stage !== "foundation";
  const complete = stage === "complete";

  return (
    <div className={compact ? "h-16 w-16" : "h-full w-full"}>
      <svg viewBox="0 0 400 400" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden="true">
        <defs>
          <pattern id="bp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill={COLOR.borderSoft} />
          </pattern>
          <radialGradient id="bp-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLOR.tide} stopOpacity="0.65" />
            <stop offset="100%" stopColor={COLOR.tide} stopOpacity="0" />
          </radialGradient>
        </defs>
        {!compact && <rect x="0" y="0" width="400" height="400" fill="url(#bp-grid)" />}

        {!compact && (
          <motion.g
            style={{ transformOrigin: "360px 40px" }}
            animate={reduceMotion ? {} : { rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            opacity={0.35}
          >
            <circle cx="360" cy="40" r="16" fill="none" stroke={COLOR.creamFaint} strokeWidth="1" />
            <line x1="360" y1="26" x2="360" y2="54" stroke={COLOR.creamFaint} strokeWidth="1" />
            <line x1="346" y1="40" x2="374" y2="40" stroke={COLOR.creamFaint} strokeWidth="1" />
          </motion.g>
        )}

        <motion.rect
          x="70" y="90" width="260" height="220" rx="2"
          fill="none" stroke={COLOR.cream} strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
        />

        <motion.path
          d="M 200 90 L 200 220 L 330 220"
          fill="none" stroke={COLOR.brass} strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: framed ? 1 : 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        />

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: framed ? 1 : 0 }}
          transition={{ duration: 0.5, delay: framed ? 0.5 : 0 }}
        >
          <path d="M 150 310 L 150 270" stroke={COLOR.creamFaint} strokeWidth="1.5" fill="none" />
          <path d="M 150 270 A 40 40 0 0 1 190 310" stroke={COLOR.creamFaint} strokeWidth="1" strokeDasharray="3 4" fill="none" />
        </motion.g>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: framed ? 1 : 0 }}
          transition={{ duration: 0.5, delay: framed ? 0.7 : 0 }}
        >
          <rect x="110" y="87" width="26" height="6" fill={COLOR.navy} stroke={COLOR.cream} strokeWidth="1.5" />
          <rect x="260" y="87" width="26" height="6" fill={COLOR.navy} stroke={COLOR.cream} strokeWidth="1.5" />
        </motion.g>

        <AnimatePresence>
          {complete && (
            <motion.circle
              cx="273" cy="90" r="0"
              fill="url(#bp-glow)"
              initial={{ r: 0, opacity: 0 }}
              animate={{ r: [0, 46, 34], opacity: [0, 1, 0.75] }}
              transition={{ duration: 1.4, ease: EASE }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {complete && !compact && (
            <motion.g
              initial={{ opacity: 0, scale: 1.6, rotate: -8 }}
              animate={{ opacity: 0.9, scale: 1, rotate: -8 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
              style={{ transformOrigin: "205px 205px" }}
            >
              <circle cx="205" cy="205" r="34" fill="none" stroke={COLOR.tide} strokeWidth="2" />
              <text x="205" y="200" textAnchor="middle" fontSize="8" letterSpacing="1.5" fill={COLOR.tide} fontWeight={600}>
                APPROVED
              </text>
              <text x="205" y="215" textAnchor="middle" fontSize="6.5" fill={COLOR.tide} letterSpacing="1">
                REYHOMES
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: framed ? 0.5 : 0 }}
          transition={{ duration: 0.6, delay: framed ? 0.9 : 0 }}
        >
          <line x1="70" y1="325" x2="330" y2="325" stroke={COLOR.creamFaint} strokeWidth="1" />
          <text x="200" y="340" textAnchor="middle" fontSize="9" fill={COLOR.creamFaint} letterSpacing="2">
            12.4 M
          </text>
        </motion.g>
      </svg>
    </div>
  );
}

/** Left-hand blueprint panel used by full split-screen auth pages. */
export function BlueprintPanel({
  stage,
  eyebrow,
  title,
}: {
  stage: BlueprintStage;
  eyebrow: string;
  title: React.ReactNode;
}) {
  return (
    <div className="relative hidden items-center justify-center border-r lg:flex" style={{ borderColor: COLOR.borderSoft }}>
      <div className="max-w-md px-12">
        <AuthBrandLogo height={48} className="mb-10" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.4em]" style={{ color: COLOR.brass }}>
          {eyebrow}
        </p>
        <h1 className="mt-4 text-5xl font-light leading-[1.05] tracking-tight" style={{ color: COLOR.cream, fontFamily: BRAND_FONT }}>
          {title}
        </h1>
        <div className="mt-10 aspect-square w-full max-w-[380px]">
          <Blueprint stage={stage} />
        </div>
      </div>
    </div>
  );
}

/** Compact blueprint chip shown above the form on mobile. */
export function BlueprintMobileHeader({ stage, label }: { stage: BlueprintStage; label: string }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
      <AuthBrandLogo height={32} />
      <div className="flex items-center gap-3">
        <div style={{ filter: "drop-shadow(0 0 12px rgba(216,199,164,0.15))" }}>
          <Blueprint stage={stage} compact />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em]" style={{ color: COLOR.brass }}>
          {label}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   FLOATING-LABEL INPUT
------------------------------------------------------- */
export function FloatingField({
  id,
  label,
  icon,
  type = "text",
  value,
  onChange,
  autoComplete,
  valid,
  rightSlot,
  onKeyUp,
  inputRef,
  compactLabel = false,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  valid?: boolean;
  rightSlot?: React.ReactNode;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
  inputRef?: React.Ref<HTMLInputElement>;
  compactLabel?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div
      className="relative rounded-xl border transition-colors duration-300"
      style={{
        borderColor: focused ? "rgba(216,199,164,0.6)" : COLOR.border,
        background: focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
      }}
    >
      <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: COLOR.brass, opacity: 0.75 }}>
        {icon}
      </div>
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-11 transition-all duration-200"
        style={{
          top: floated ? "9px" : "50%",
          fontSize: floated ? "10px" : compactLabel ? "13px" : "15px",
          transform: floated ? "translateY(0)" : "translateY(-50%)",
          color: floated ? COLOR.brass : COLOR.creamFaint,
          letterSpacing: floated ? "0.06em" : "normal",
        }}
      >
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyUp={onKeyUp}
        className="w-full bg-transparent pb-2 pl-11 pr-11 pt-6 text-[15px] font-light text-[#F5F0E6] focus:outline-none"
      />
      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {valid && <CheckCircle2 size={15} style={{ color: COLOR.tide }} />}
        {rightSlot}
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   PASSWORD STRENGTH METER
------------------------------------------------------- */
export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const level = Math.min(score, 4);
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const colors = [COLOR.rust, COLOR.rust, "#C9A15E", COLOR.tide, COLOR.tide];

  return (
    <div className="pt-1">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ background: i < level ? colors[level] : COLOR.borderSoft }}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[10px]" style={{ color: colors[level] }}>
        {labels[level]}
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   ERROR BANNER
------------------------------------------------------- */
export function ErrorBanner({ message }: { message: string | null }) {
  return (
    <div aria-live="assertive">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px]"
            style={{ borderColor: "rgba(194,121,94,0.4)", background: "rgba(194,121,94,0.1)", color: COLOR.cream }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}