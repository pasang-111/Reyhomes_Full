"use client";

import {
  Heart,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  useWishlist,
  WishlistEntry,
} from "@/context/WishlistContext";

import LoginRequiredDialog from "@/components/auth/LoginRequiredDialog";

export const WISHLIST_ACCENT =
  "#D8C7A4";

type Props = {
  entry: WishlistEntry;

  className?: string;

  size?: "sm" | "md" | "lg";
};

export default function WishlistButton({
  entry,
  className = "",
  size = "md",
}: Props) {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    isSaved,
    toggle,
  } = useWishlist();

  const pathname =
    usePathname();

  const [busy, setBusy] =
    useState(false);

  const [loginOpen, setLoginOpen] =
    useState(false);

  const saved = isSaved(
    entry.kind,
    entry.id
  );

  const dims =
    size === "lg"
      ? "h-12 w-12 sm:h-14 sm:w-14"
      : size === "sm"
        ? "h-10 w-10"
        : "h-11 w-11";

  const icon =
    size === "lg"
      ? 20
      : size === "sm"
        ? 17
        : 18;

  const handleClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    event.stopPropagation();

    if (
      busy ||
      authLoading
    ) {
      return;
    }

    /**
     * Do not allow invalid IDs.
     */
    if (!entry.id) {
      console.error(
        "WishlistButton: invalid entry id",
        entry
      );

      return;
    }

    if (!user) {
      setLoginOpen(true);
      return;
    }

    setBusy(true);

    try {
      await toggle(entry);
    } catch (error) {
      console.error(
        "Wishlist toggle failed:",
        error
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        data-wishlist-button="true"
        data-wishlist-kind={
          entry.kind
        }
        data-wishlist-id={
          entry.id
        }
        disabled={
          busy ||
          authLoading
        }
        onClick={handleClick}
        whileHover={{
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.88,
        }}
        aria-pressed={saved}
        aria-label={
          !user
            ? "Log in to save to wishlist"
            : saved
              ? "Remove from wishlist"
              : "Save to wishlist"
        }
        title={
          !user
            ? "Log in to save"
            : saved
              ? "Saved"
              : "Add to wishlist"
        }
        className={`
          group relative inline-flex
          ${dims}
          items-center justify-center
          rounded-full
          border
          transition-all
          duration-300
          disabled:cursor-wait
          disabled:opacity-60
          shadow-[0_8px_24px_rgba(0,0,0,0.35)]

          ${
            saved
              ? "border-[#D8C7A4] bg-[#D8C7A4] text-[#0A1628]"
              : "border-[#D8C7A4]/70 bg-[#0A1628]/75 text-[#D8C7A4] backdrop-blur-md hover:border-[#D8C7A4] hover:bg-[#D8C7A4]/25"
          }

          ${className}
        `}
      >
        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                opacity: [
                  0,
                  0.25,
                  0,
                ],
                scale: [
                  0.8,
                  1.5,
                  1.7,
                ],
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.7,
              }}
              className="pointer-events-none absolute inset-0 rounded-full border border-[#D8C7A4]"
            />
          )}
        </AnimatePresence>

        <motion.div
          className="pointer-events-none"
          animate={{
            scale: saved
              ? [1, 1.22, 1]
              : 1,

            rotate: saved
              ? [0, -8, 8, 0]
              : 0,
          }}
          transition={{
            duration: 0.42,
            ease: "easeOut",
          }}
        >
          <Heart
            size={icon}
            className={
              saved
                ? "text-[#0A1628]"
                : "text-[#D8C7A4] group-hover:text-[#E8D9B8]"
            }
            fill={
              saved
                ? "#0A1628"
                : "none"
            }
            stroke={
              saved
                ? "#0A1628"
                : "currentColor"
            }
            strokeWidth={2}
          />
        </motion.div>
      </motion.button>

      <LoginRequiredDialog
        open={loginOpen}
        onClose={() =>
          setLoginOpen(false)
        }
        nextPath={
          pathname || "/wishlist"
        }
        message="Please log in to add this property to your wishlist."
      />
    </>
  );
}