"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, LogOut, X } from "lucide-react";

/* -------------------------------------------------------
   MOTION
------------------------------------------------------- */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------
   AUTH TOAST
   Confirmation pill for login / register / sign-out.
------------------------------------------------------- */
type AuthToastColors = {
  bg?: string;
  border?: string;
  text?: string;
};

type AuthToastProps = {
  message: string | null;
  onDone: () => void;
  /** Auto-dismiss after this many ms (default 3200) */
  duration?: number;
  colors?: AuthToastColors;
};

function resolveVariant(message: string | null): "success" | "signout" {
  const m = (message || "").toLowerCase();
  if (
    m.includes("signed out") ||
    m.includes("sign out") ||
    m.includes("logged out")
  ) {
    return "signout";
  }
  return "success";
}

export function AuthToast({
  message,
  onDone,
  duration = 3200,
  colors = {},
}: AuthToastProps) {
  const [visible, setVisible] = useState(false);
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setDisplayMessage(message);
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      // give exit animation time to finish before clearing parent state
      setTimeout(() => {
        setDisplayMessage(null);
        onDone();
      }, 320);
    }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onDone]);

  const variant = resolveVariant(displayMessage);
  const bg = colors.bg ?? "rgba(8, 32, 54, 0.97)";
  const border = colors.border ?? "rgba(248, 245, 240, 0.16)";
  const text = colors.text ?? "#F8F5F0";

  const iconBg =
    variant === "signout"
      ? "linear-gradient(135deg, rgba(248,245,240,.12), rgba(216,199,164,.15))"
      : "linear-gradient(135deg, rgba(79,166,168,.25), rgba(216,199,164,.2))";

  const iconColor = variant === "signout" ? "rgba(248,245,240,.75)" : "#D8C7A4";

  return (
    <AnimatePresence>
      {visible && displayMessage && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.38, ease: EASE_OUT }}
          className="pointer-events-auto fixed left-1/2 top-6 z-[3000] -translate-x-1/2"
        >
          <div
            className="flex items-center gap-3 rounded-full border px-5 py-3 shadow-2xl backdrop-blur-xl"
            style={
              {
                background: bg,
                borderColor: border,
                boxShadow:
                  "0 20px 50px -12px rgba(0,0,0,.55), 0 0 0 1px rgba(248,245,240,.06), inset 0 1px 0 rgba(255,255,255,.06)",
              } as CSSProperties
            }
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{
                background: iconBg,
                color: iconColor,
              }}
            >
              {variant === "signout" ? (
                <LogOut size={14} strokeWidth={2} />
              ) : (
                <CheckCircle2 size={15} strokeWidth={2} />
              )}
            </span>
            <p
              className="max-w-[280px] truncate text-[13px] font-medium tracking-wide"
              style={{ color: text }}
            >
              {displayMessage}
            </p>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => {
                setVisible(false);
                setTimeout(() => {
                  setDisplayMessage(null);
                  onDone();
                }, 280);
              }}
              className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/5"
              style={{ color: "rgba(248,245,240,.45)" }}
            >
              <X size={14} strokeWidth={1.8} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------
   DROPLET PULSE
   Soft expanding rings that bloom around identity icons
   (wishlist / account) right after a successful auth event.
------------------------------------------------------- */
type DropletPulseProps = {
  active: boolean;
  /** Accent colour of the rings (defaults to brass) */
  color?: string;
};

export function DropletPulse({
  active,
  color = "rgba(216, 199, 164, 0.55)",
}: DropletPulseProps) {
  return (
    <AnimatePresence>
      {active && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                border: `1.5px solid ${color}`,
                width: 36,
                height: 36,
              }}
              initial={{ scale: 0.55, opacity: 0.7 }}
              animate={{
                scale: 2.4 + i * 0.35,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.85,
                delay: i * 0.12,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            />
          ))}
          {/* soft inner glow bloom */}
          <motion.span
            className="absolute rounded-full"
            style={{
              width: 28,
              height: 28,
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            }}
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </span>
      )}
    </AnimatePresence>
  );
}
