"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  name: string;
  slug: string;
  price?: string;
  category?: string;
};

/** Sticky enquire — uses site brand tokens only (no palette rewrite). */
export default function StickyEnquireBar({ name, slug, price, category }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-6 sm:pb-5"
        >
          <div
            className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4"
            style={{
              background:
                "linear-gradient(180deg, rgba(12,42,68,0.97) 0%, rgba(8,32,54,0.99) 100%)",
              borderColor: "rgba(248,245,240,0.16)",
              boxShadow: "0 28px 90px -32px rgba(0,0,0,.82), inset 0 1px 0 rgba(255,255,255,.08)",
            }}
          >
            <div className="min-w-0">
              {category ? (
                <p
                  className="text-[10px] font-medium uppercase tracking-[0.28em]"
                  style={{ color: "rgba(216,199,164,0.9)" }}
                >
                  {category}
                </p>
              ) : null}
              <p className="truncate font-display text-lg font-light sm:text-xl" style={{ color: "#F8F5F0" }}>
                {name}
              </p>
              {price ? (
                <p className="mt-0.5 text-xs" style={{ color: "rgba(248,245,240,0.55)" }}>
                  From {price}
                </p>
              ) : null}
            </div>
            <Link
              href={`/enquire?design=${encodeURIComponent(slug)}`}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                background: "linear-gradient(135deg, #F5F0E6, #E8D9B8, #D8C7A4)",
                color: "#0C2A44",
              }}
            >
              Enquire
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
