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
  Lock,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { formatAuthError } from "@/lib/authErrors";
import { loginAfterRegisterPath } from "@/lib/navigation";
import {
  AuthBackground,
  AuthCard,
  BlueprintMobileHeader,
  BlueprintPanel,
  BlueprintStage,
  BRAND_FONT,
  COLOR,
  EASE,
  EMAIL_RE,
  ErrorBanner,
  FloatingField,
  PasswordStrength,
} from "@/components/auth/AuthUI";

type Stage = "details" | "security" | "success";
const stageToBlueprint: Record<Stage, BlueprintStage> = {
  details: "foundation",
  security: "framed",
  success: "complete",
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, user, authEvent } = useAuth();

  const [stage, setStage] = useState<Stage>("details");
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirm: "",
    marketing_opt_in: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);
  const update = (key: keyof typeof form, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));

  const emailValid = EMAIL_RE.test(form.email);
  const detailsValid = form.first_name.trim() && form.last_name.trim() && emailValid;
  const confirmMatches = form.password.length > 0 && form.password === form.password_confirm;

  useEffect(() => {
    if (stage === "security") {
      const t = setTimeout(() => passwordRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const goToSecurity = () => {
    if (!detailsValid) {
      setError("Fill in your name and a valid email to continue.");
      return;
    }
    setError(null);
    setDirection(1);
    setStage("security");
  };

  const goBackToDetails = () => {
    setError(null);
    setDirection(-1);
    setStage("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stage === "details") return goToSecurity();

    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      setStage("success");
      // No cinematic on register — send them to login to sign in first.
      try {
        sessionStorage.setItem(
          "auth_toast",
          "Account created. Please sign in to continue."
        );
      } catch {
        /* ignore */
      }
      const target = loginAfterRegisterPath(searchParams.get("next"));
      window.setTimeout(() => {
        router.replace(target);
      }, 1200);
    } catch (err) {
      setError(formatAuthError(err, "Could not create your account. Please try again."));
      setSubmitting(false);
    }
  };

  const slide = {
    enter: { x: direction > 0 ? 24 : -24, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: EASE } },
    exit: { x: direction > 0 ? -24 : 24, opacity: 0, transition: { duration: 0.25, ease: EASE } },
  };

  return (
    <AuthBackground>
      <Link
        href="/"
        aria-label="Exit registration and return home"
        title="Return home"
        className="fixed right-5 top-5 z-[100] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/60 backdrop-blur-xl transition hover:border-[#D8C7A4]/40 hover:bg-black/40 hover:text-[#D8C7A4]"
      >
        <X size={18} strokeWidth={1.6} />
      </Link>
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
        <BlueprintPanel
          stage={stageToBlueprint[stage]}
          eyebrow="REY HOMES — BECOME A MEMBER"
          title={<>Save your favourites.<br />Build with us.</>}
        />

        <div className="flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-md">
            <BlueprintMobileHeader stage={stageToBlueprint[stage]} label="Become a Member" />

            <AuthCard shake={Boolean(error)}>
              <AnimatePresence mode="wait">
                {stage === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center py-10 text-center"
                  >
                    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
                      <CheckCircle2 size={40} style={{ color: COLOR.tide }} />
                    </motion.div>
                    <p className="mt-4 text-lg font-light" style={{ color: COLOR.cream, fontFamily: BRAND_FONT }}>
                      {authEvent?.message || "Account created. Please sign in to continue."}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: COLOR.creamFaint }}>
                      Setting up your account…
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form">
                    <p className="text-[10px] font-medium uppercase tracking-[0.35em]" style={{ color: COLOR.brass }}>
                      {stage === "details" ? "Become a Member" : "Almost there"}
                    </p>
                    <h2 className="mt-2 text-3xl font-light tracking-tight" style={{ color: COLOR.cream, fontFamily: BRAND_FONT }}>
                      {stage === "details" ? "Create your account" : "Secure your account"}
                    </h2>

                    <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
                      <AnimatePresence mode="wait" custom={direction}>
                        {stage === "details" ? (
                          <motion.div key="details-step" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <FloatingField id="first_name" label="First name" icon={<User size={16} />} value={form.first_name} onChange={(v) => update("first_name", v)} autoComplete="given-name" compactLabel />
                              <FloatingField id="last_name" label="Last name" icon={<User size={16} />} value={form.last_name} onChange={(v) => update("last_name", v)} autoComplete="family-name" compactLabel />
                            </div>

                            <FloatingField id="email" label="Email address" icon={<Mail size={16} />} type="email" value={form.email} onChange={(v) => update("email", v)} autoComplete="email" valid={emailValid} />

                            <FloatingField id="phone" label="Phone (optional)" icon={<Phone size={16} />} value={form.phone} onChange={(v) => update("phone", v)} autoComplete="tel" />

                            <button
                              type="submit"
                              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-4 text-[13px] font-semibold uppercase tracking-[1.5px] text-[#0A1628] transition-transform duration-300 hover:-translate-y-0.5"
                              style={{ background: "linear-gradient(135deg, #F5F0E6, #E8D9B8, #D8C7A4)", boxShadow: "0 12px 32px -10px rgba(216,199,164,0.45)" }}
                            >
                              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                              <span className="relative">Continue</span>
                              <ArrowRight size={15} className="relative" />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div key="security-step" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" className="space-y-4">
                            <button type="button" onClick={goBackToDetails} className="flex items-center gap-1.5 text-[11px] transition-colors" style={{ color: COLOR.creamFaint }}>
                              <ArrowLeft size={13} />
                              {form.email}
                              <span style={{ color: COLOR.brass }}>· change</span>
                            </button>

                            <div>
                              <FloatingField
                                id="password"
                                label="Password"
                                icon={<Lock size={16} />}
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={(v) => update("password", v)}
                                autoComplete="new-password"
                                inputRef={passwordRef}
                                onKeyUp={(e) => setCapsLock(e.getModifierState?.("CapsLock") ?? false)}
                                rightSlot={
                                  <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)} style={{ color: COLOR.creamFaint }} aria-label={showPassword ? "Hide password" : "Show password"}>
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                  </button>
                                }
                              />
                              <PasswordStrength password={form.password} />
                            </div>

                            <FloatingField
                              id="password_confirm"
                              label="Confirm password"
                              icon={<Lock size={16} />}
                              type={showConfirm ? "text" : "password"}
                              value={form.password_confirm}
                              onChange={(v) => update("password_confirm", v)}
                              autoComplete="new-password"
                              valid={confirmMatches}
                              rightSlot={
                                <button type="button" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)} style={{ color: COLOR.creamFaint }} aria-label={showConfirm ? "Hide password" : "Show password"}>
                                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                              }
                            />

                            {capsLock && (
                              <p className="flex items-center gap-1.5 text-[11px]" style={{ color: COLOR.rust }}>
                                <AlertCircle size={12} />
                                Caps Lock is on
                              </p>
                            )}

                            <label className="flex items-start gap-2.5 pt-1 text-[12px]" style={{ color: COLOR.creamFaint }}>
                              <input type="checkbox" checked={form.marketing_opt_in} onChange={(e) => update("marketing_opt_in", e.target.checked)} className="mt-0.5 accent-[#D8C7A4]" />
                              Keep me updated on new designs & land releases
                            </label>

                            <button
                              type="submit"
                              disabled={submitting}
                              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-4 text-[13px] font-semibold uppercase tracking-[1.5px] text-[#0A1628] transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                              style={{ background: "linear-gradient(135deg, #F5F0E6, #E8D9B8, #D8C7A4)", boxShadow: "0 12px 32px -10px rgba(216,199,164,0.45)" }}
                            >
                              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                              <span className="relative flex items-center gap-2">
                                {submitting && <Loader2Icon />}
                                {submitting ? "Creating account…" : "Create account"}
                              </span>
                              {!submitting && <ArrowRight size={15} className="relative" />}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <ErrorBanner message={error} />
                    </form>

                    <p className="mt-7 text-center text-sm" style={{ color: COLOR.creamFaint }}>
                      Already a member?{" "}
                      <Link href="/login" className="transition-colors" style={{ color: COLOR.brass }}>Sign in</Link>
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

function Loader2Icon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}