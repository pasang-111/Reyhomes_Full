"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";

import AuthShell from "@/components/auth/AuthShell";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  BRAND_FONT,
  COLOR,
  EASE,
  EMAIL_RE,
  ErrorBanner,
  FloatingField,
} from "@/components/auth/AuthUI";

function ForgotPasswordInner() {
  const params = useSearchParams();
  const uid = (params.get("uid") || "").trim();
  const token = (params.get("token") || "").trim();
  const isConfirm = Boolean(uid && token);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const emailValid = EMAIL_RE.test(email);
  const passwordOk = password.length >= 8 && password === passwordConfirm;

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      // Still show success-style path for network soft fails is intentional on backend;
      // only surface hard client/API errors here.
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await authApi.confirmPasswordReset({
        uid,
        token,
        password,
        password_confirm: passwordConfirm,
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Invalid or expired reset link. Request a new one."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const title = useMemo(() => {
    if (done) return "Password updated";
    if (isConfirm) return "Choose a new password";
    if (sent) return "Check your inbox";
    return "Forgot your password?";
  }, [done, isConfirm, sent]);

  return (
    <AuthShell
      eyebrow="Reset Password"
      title={title}
      subtitle={
        isConfirm
          ? "Enter a new password for your ReyHomes member account."
          : "Enter the email on your account and we'll send you a link to reset it."
      }
    >
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-6 text-center"
          >
            <CheckCircle2 size={36} style={{ color: COLOR.tide }} />
            <p
              className="mt-4 text-lg font-light"
              style={{ color: COLOR.cream, fontFamily: BRAND_FONT }}
            >
              You can sign in now
            </p>
            <p
              className="mt-2 max-w-xs text-[13px] leading-relaxed"
              style={{ color: COLOR.creamFaint }}
            >
              Your password has been updated successfully.
            </p>
            <Link
              href="/login"
              className="mt-6 flex items-center gap-1.5 text-[12px]"
              style={{ color: COLOR.brass }}
            >
              <ArrowLeft size={13} />
              Back to sign in
            </Link>
          </motion.div>
        ) : sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-6 text-center"
          >
            <CheckCircle2 size={36} style={{ color: COLOR.tide }} />
            <p
              className="mt-4 text-lg font-light"
              style={{ color: COLOR.cream, fontFamily: BRAND_FONT }}
            >
              Check your inbox
            </p>
            <p
              className="mt-2 max-w-xs text-[13px] leading-relaxed"
              style={{ color: COLOR.creamFaint }}
            >
              If an account exists for{" "}
              <span style={{ color: COLOR.brass }}>{email}</span>, a reset link
              is on its way.
            </p>
            <Link
              href="/login"
              className="mt-6 flex items-center gap-1.5 text-[12px]"
              style={{ color: COLOR.brass }}
            >
              <ArrowLeft size={13} />
              Back to sign in
            </Link>
          </motion.div>
        ) : isConfirm ? (
          <motion.form
            key="confirm"
            onSubmit={handleConfirm}
            noValidate
            className="space-y-4"
          >
            <ErrorBanner message={error} />
            <FloatingField
              id="new-password"
              label="New password"
              type="password"
              icon={<Lock size={15} />}
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <FloatingField
              id="confirm-password"
              label="Confirm password"
              type="password"
              icon={<Lock size={15} />}
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={submitting || !passwordOk}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] transition disabled:opacity-50"
              style={{ background: COLOR.brass, color: COLOR.ink }}
            >
              {submitting ? "Saving…" : "Update password"}
              <ArrowRight size={14} />
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleRequest}
            noValidate
            className="space-y-4"
          >
            <ErrorBanner message={error} />
            <FloatingField
              id="reset-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              icon={<Mail size={15} />}
            />
            <button
              type="submit"
              disabled={submitting || !emailValid}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] transition disabled:opacity-50"
              style={{ background: COLOR.brass, color: COLOR.ink }}
            >
              {submitting ? "Sending…" : "Send reset link"}
              <ArrowRight size={14} />
            </button>
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 pt-2 text-[12px]"
              style={{ color: COLOR.brass }}
            >
              <ArrowLeft size={13} />
              Back to sign in
            </Link>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A1420]" />}>
      <ForgotPasswordInner />
    </Suspense>
  );
}
