"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  Loader2,
  Lock,
  Mail,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { formatAuthError } from "@/lib/authErrors";
import {
  AuthBackground,
  AuthCard,
  BlueprintMobileHeader,
  BlueprintPanel,
  BlueprintStage,
  COLOR,
  EASE,
  EMAIL_RE,
  ErrorBanner,
  FloatingField,
  BRAND_FONT,
} from "@/components/auth/AuthUI";
import { armCinematicWelcome } from "@/components/ui/CinematicWelcome";
import { resolveNextPath } from "@/lib/navigation";

type Stage = "email" | "password" | "success";
const stageToBlueprint: Record<Stage, BlueprintStage> = {
  email: "foundation",
  password: "framed",
  success: "complete",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, authEvent } = useAuth();
  const justRegistered = searchParams.get("registered") === "1";

  const [stage, setStage] = useState<Stage>("email");
  const [direction, setDirection] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [passkeyNote, setPasskeyNote] = useState<string | null>(null);

  const passwordRef = useRef<HTMLInputElement>(null);
  const emailValid = EMAIL_RE.test(email);

  useEffect(() => {
    if (typeof window !== "undefined" && "PublicKeyCredential" in window)
      setPasskeySupported(true);
  }, []);

  useEffect(() => {
    if (stage === "password") {
      const t = setTimeout(() => passwordRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const goToPassword = () => {
    if (!emailValid) {
      setError("Enter a valid email address to continue.");
      return;
    }
    setError(null);
    setDirection(1);
    setStage("password");
  };

  const goBackToEmail = () => {
    setError(null);
    setDirection(-1);
    setStage("email");
  };

  const handlePasskey = () => {
    setPasskeyNote(
      "Passkey sign-in isn't set up on this account yet — continue with your password below."
    );
    setTimeout(() => setPasskeyNote(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stage === "email") return goToPassword();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      setStage("success");

      // Arm cinematic intro; SiteChrome's CinematicWelcome will pick it up on home.
      armCinematicWelcome("login");

      const target = resolveNextPath(searchParams.get("next"), "/");
      window.setTimeout(() => {
        router.replace(target);
      }, 700);
    } catch (err) {
      setError(formatAuthError(err, "Incorrect email or password. Please try again."));
      setSubmitting(false);
    }
  };

  const slide = {
    enter: { x: direction > 0 ? 24 : -24, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: EASE } },
    exit: {
      x: direction > 0 ? -24 : 24,
      opacity: 0,
      transition: { duration: 0.25, ease: EASE },
    },
  };

  return (
    <AuthBackground>
      <Link
        href="/"
        aria-label="Exit sign in and return home"
        title="Return home"
        className="fixed right-5 top-5 z-[100] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/60 backdrop-blur-xl transition hover:border-[#D8C7A4]/40 hover:bg-black/40 hover:text-[#D8C7A4]"
      >
        <X size={18} strokeWidth={1.6} />
      </Link>
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
        <BlueprintPanel
          stage={stageToBlueprint[stage]}
          eyebrow="REY HOMES — MEMBER ACCESS"
          title={
            <>
              Your plan takes
              <br />
              shape as you sign in.
            </>
          }
        />

        <div className="flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-md">
            <BlueprintMobileHeader
              stage={stageToBlueprint[stage]}
              label="Member Access"
            />

            {justRegistered && (
              <div
                className="mb-5 rounded-2xl border px-4 py-3 text-center text-sm"
                style={{
                  borderColor: "rgba(216,199,164,0.35)",
                  background: "rgba(216,199,164,0.08)",
                  color: "rgba(248,245,240,0.85)",
                }}
              >
                Account created successfully. Sign in to begin your luxury residential experience.
              </div>
            )}
            <AuthCard shake={Boolean(error)}>
              <AnimatePresence mode="wait">
                {stage === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center py-10 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      <CheckCircle2 size={40} style={{ color: COLOR.tide }} />
                    </motion.div>
                    <p
                      className="mt-4 text-lg font-light"
                      style={{ color: COLOR.cream, fontFamily: BRAND_FONT }}
                    >
                      {authEvent?.message ||
                        `Welcome back${user?.first_name ? `, ${user.first_name}` : ""}.`}
                    </p>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: COLOR.creamFaint }}
                    >
                      Entering ReyHomes…
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form">
                    <p
                      className="text-[10px] font-medium uppercase tracking-[0.35em]"
                      style={{ color: COLOR.brass }}
                    >
                      {stage === "email" ? "Member Access" : "Almost there"}
                    </p>
                    <h2
                      className="mt-2 text-3xl font-light tracking-tight"
                      style={{ color: COLOR.cream, fontFamily: BRAND_FONT }}
                    >
                      {stage === "email"
                        ? "Welcome back"
                        : "Enter your password"}
                    </h2>

                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className="mt-7 space-y-4"
                    >
                      <AnimatePresence mode="wait" custom={direction}>
                        {stage === "email" ? (
                          <motion.div
                            key="email-step"
                            custom={direction}
                            variants={slide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="space-y-4"
                          >
                            <FloatingField
                              id="email"
                              label="Email address"
                              icon={<Mail size={16} />}
                              type="email"
                              value={email}
                              onChange={setEmail}
                              autoComplete="email"
                              valid={emailValid}
                            />

                            <button
                              type="submit"
                              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-4 text-[13px] font-semibold uppercase tracking-[1.5px] text-[#0A1628] transition-transform duration-300 hover:-translate-y-0.5"
                              style={{
                                background:
                                  "linear-gradient(135deg, #F5F0E6, #E8D9B8, #D8C7A4)",
                                boxShadow:
                                  "0 12px 32px -10px rgba(216,199,164,0.45)",
                              }}
                            >
                              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                              <span className="relative">Continue</span>
                              <ArrowRight size={15} className="relative" />
                            </button>

                            {passkeySupported && (
                              <>
                                <div className="flex items-center gap-3 py-1">
                                  <div
                                    className="h-px flex-1"
                                    style={{ background: COLOR.borderSoft }}
                                  />
                                  <span
                                    className="text-[10px] uppercase tracking-[0.25em]"
                                    style={{ color: COLOR.creamFaint }}
                                  >
                                    or
                                  </span>
                                  <div
                                    className="h-px flex-1"
                                    style={{ background: COLOR.borderSoft }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handlePasskey}
                                  className="flex w-full items-center justify-center gap-2 rounded-xl border py-3.5 text-[13px] transition-colors"
                                  style={{
                                    borderColor: COLOR.border,
                                    color: COLOR.creamMuted,
                                  }}
                                >
                                  <Fingerprint size={16} />
                                  Continue with a passkey
                                </button>
                                {passkeyNote && (
                                  <p
                                    className="text-center text-[11px] leading-relaxed"
                                    style={{ color: COLOR.creamFaint }}
                                  >
                                    {passkeyNote}
                                  </p>
                                )}
                              </>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="password-step"
                            custom={direction}
                            variants={slide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="space-y-4"
                          >
                            <button
                              type="button"
                              onClick={goBackToEmail}
                              className="flex items-center gap-1.5 text-[11px] transition-colors"
                              style={{ color: COLOR.creamFaint }}
                            >
                              <ArrowLeft size={13} />
                              {email}
                              <span style={{ color: COLOR.brass }}>
                                · change
                              </span>
                            </button>

                            <FloatingField
                              id="password"
                              label="Password"
                              icon={<Lock size={16} />}
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={setPassword}
                              autoComplete="current-password"
                              inputRef={passwordRef}
                              onKeyUp={(e) =>
                                setCapsLock(
                                  e.getModifierState?.("CapsLock") ?? false
                                )
                              }
                              rightSlot={
                                <button
                                  type="button"
                                  tabIndex={-1}
                                  onClick={() => setShowPassword((v) => !v)}
                                  style={{ color: COLOR.creamFaint }}
                                  aria-label={
                                    showPassword
                                      ? "Hide password"
                                      : "Show password"
                                  }
                                >
                                  {showPassword ? (
                                    <EyeOff size={15} />
                                  ) : (
                                    <Eye size={15} />
                                  )}
                                </button>
                              }
                            />

                            {capsLock && (
                              <p
                                className="flex items-center gap-1.5 text-[11px]"
                                style={{ color: COLOR.rust }}
                              >
                                <AlertCircle size={12} />
                                Caps Lock is on
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-1 text-[12px]">
                              <label
                                className="flex items-center gap-2"
                                style={{ color: COLOR.creamFaint }}
                              >
                                <input
                                  type="checkbox"
                                  checked={remember}
                                  onChange={(e) =>
                                    setRemember(e.target.checked)
                                  }
                                  className="accent-[#D8C7A4]"
                                />
                                Remember me
                              </label>
                              <Link
                                href="/forgot-password"
                                style={{ color: COLOR.brass }}
                              >
                                Forgot password?
                              </Link>
                            </div>

                            <button
                              type="submit"
                              disabled={submitting}
                              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-4 text-[13px] font-semibold uppercase tracking-[1.5px] text-[#0A1628] transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                              style={{
                                background:
                                  "linear-gradient(135deg, #F5F0E6, #E8D9B8, #D8C7A4)",
                                boxShadow:
                                  "0 12px 32px -10px rgba(216,199,164,0.45)",
                              }}
                            >
                              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                              <span className="relative flex items-center gap-2">
                                {submitting && (
                                  <Loader2
                                    size={14}
                                    className="animate-spin"
                                  />
                                )}
                                {submitting ? "Signing in…" : "Sign in"}
                              </span>
                              {!submitting && (
                                <ArrowRight size={15} className="relative" />
                              )}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <ErrorBanner message={error} />
                    </form>

                    <p
                      className="mt-7 text-center text-sm"
                      style={{ color: COLOR.creamFaint }}
                    >
                      New to ReyHomes?{" "}
                      <Link
                        href="/register"
                        className="transition-colors"
                        style={{ color: COLOR.brass }}
                      >
                        Create an account
                      </Link>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </AuthCard>
          </div>
        </div>
      </div>
    </AuthBackground>
  );
}