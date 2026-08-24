"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import ReviewDialog from "./ReviewDialog";

type Props = {
  kind: "design" | "package";
  slug: string;
  /** Visual variant to match light (floor plan) vs dark (inclusions) sections */
  variant?: "light" | "dark" | "gold";
  label?: string;
  className?: string;
};

export default function ReviewTrigger({
  kind,
  slug,
  variant = "light",
  label = "Review & Share",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  if (!slug) return null;

  const styles =
    variant === "dark"
      ? "border border-white/20 text-white hover:border-[#D8C7A4] hover:text-[#D8C7A4]"
      : variant === "gold"
        ? "bg-[#D8C7A4] text-[#0A1628] hover:bg-[#E8D9B8]"
        : "border border-[#0A1628]/20 text-[#0A1628] hover:border-[#D8C7A4] hover:text-[#806D48]";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-3 rounded-full px-7 py-3.5 text-sm font-medium transition ${styles} ${className}`}
      >
        <FileText size={17} />
        {label}
      </button>
      <ReviewDialog open={open} onClose={() => setOpen(false)} kind={kind} slug={slug} />
    </>
  );
}
