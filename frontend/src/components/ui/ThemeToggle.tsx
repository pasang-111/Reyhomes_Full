"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

type ThemeToggleProps = {
  className?: string;
  size?: number;
  /** compact = icon-only circle matching navbar icons */
  compact?: boolean;
};

export default function ThemeToggle({
  className = "",
  size = 16,
  compact = true,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={
        compact
          ? `relative flex items-center justify-center rounded-full transition-all duration-300 ${className}`
          : `inline-flex items-center justify-center gap-2 rounded-full transition-all duration-300 ${className}`
      }
      style={{
        color: "var(--theme-icon)",
        background: "var(--theme-icon-bg)",
        border: "1px solid var(--theme-icon-border)",
      }}
    >
      {isDark ? (
        <Sun size={size} strokeWidth={1.7} />
      ) : (
        <Moon size={size} strokeWidth={1.7} />
      )}
      {!compact && (
        <span className="text-[11px] uppercase tracking-[0.2em]">
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </span>
      )}
    </button>
  );
}
