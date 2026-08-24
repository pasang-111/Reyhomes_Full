"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  useWishlist,
} from "@/context/WishlistContext";

import EmptyWishlist from "@/components/home/wishlist/EmptyWishlist";

import LoginRequiredDialog from "@/components/auth/LoginRequiredDialog";

import WishlistButton from "@/components/auth/WishlistButton";

import SlugHoverPreview from "@/components/home/section/SlugHoverPreview";

export default function WishlistPage() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    items,
    remove,
    loading,
    count,
  } = useWishlist();

  const router =
    useRouter();

  const [
    loginOpen,
    setLoginOpen,
  ] = useState(false);

  useEffect(() => {
    if (
      !authLoading &&
      !user
    ) {
      setLoginOpen(true);
    }
  }, [
    authLoading,
    user,
  ]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#07080a] px-5 py-24 text-center text-white/50">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#D8C7A4]" />

          <p className="mt-5 text-sm">
            Loading your wishlist…
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="relative min-h-screen bg-[#07080a] px-5 py-24">
        <div className="mx-auto max-w-lg rounded-[28px] border border-white/10 bg-white/[0.03] p-10 text-center shadow-[0_30px_100px_rgba(0,0,0,.35)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D8C7A4]/35 bg-[#D8C7A4]/10">
            <Heart
              size={24}
              className="text-[#D8C7A4]"
            />
          </div>

          <h1 className="mt-6 font-display text-3xl text-[#F5F0E6]">
            Wishlist
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/55">
            Please log in to view and
            manage your saved homes and
            land packages.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?next=/wishlist"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#E8EAED] via-[#C8CCD4] to-[#9CA3AF] px-7 py-3.5 text-sm font-semibold text-[#0A1628]"
            >
              Log in
            </Link>

            <Link
              href="/register?next=/wishlist"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-sm text-white/80"
            >
              Create account
            </Link>
          </div>
        </div>

        <LoginRequiredDialog
          open={loginOpen}
          onClose={() => {
            setLoginOpen(false);
            router.push("/");
          }}
          nextPath="/wishlist"
          message="Please log in to view your wishlist."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07080a] text-[#F5F0E6]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#D8C7A4]/[0.035] blur-[140px]" />

        <div className="absolute -right-40 bottom-20 h-[500px] w-[500px] rounded-full bg-cyan-300/[0.025] blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        {/* Header */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D8C7A4]" />

            <p className="text-[11px] uppercase tracking-[0.35em] text-[#D8C7A4]">
              Saved Collection
            </p>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-4xl font-light sm:text-5xl lg:text-6xl">
                My Wishlist
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
                Your private collection of
                homes and home & land
                packages.
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5">
              <span className="text-sm text-white/50">
                {count} saved{" "}
                {count === 1
                  ? "property"
                  : "properties"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              1,
              2,
              3,
            ].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]"
              >
                <div className="aspect-[4/3] animate-pulse bg-white/[0.05]" />

                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded-full bg-white/10" />

                  <div className="h-6 w-2/3 animate-pulse rounded-full bg-white/10" />

                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-16"
          >
            <EmptyWishlist />
          </motion.div>
        ) : (
          <motion.ul
            layout
            className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {items.map(
                (item, index) => {
                  const href =
                    item.kind ===
                    "design"
                      ? `/home-designs/${item.slug}`
                      : `/home-land/${item.slug}`;

                  return (
                    <motion.li
                      layout
                      key={`${item.kind}-${item.id}`}
                      initial={{
                        opacity: 0,
                        y: 30,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        y: -20,
                      }}
                      transition={{
                        duration: 0.45,
                        delay:
                          Math.min(
                            index,
                            5
                          ) *
                          0.05,
                      }}
                    >
                      <SlugHoverPreview
                        kind={
                          item.kind ===
                          "design"
                            ? "design"
                            : "package"
                        }
                        slug={
                          item.slug
                        }
                        href={href}
                      >
                        <article className="group relative overflow-visible rounded-[26px] border border-white/10 bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,.25)] transition-all duration-500 hover:-translate-y-2 hover:border-[#D8C7A4]/30 hover:bg-white/[0.055]">
                          {/* Top shine */}
                          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#D8C7A4]/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                          {/* Image */}
                          <div className="relative aspect-[4/3] overflow-hidden rounded-t-[26px] bg-[#0A1628]">
                            {item.image ? (
                              <Image
                                src={
                                  item.image
                                }
                                alt={
                                  item.name
                                }
                                fill
                                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
                                sizes="(max-width:768px) 100vw, 33vw"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(216,199,164,.15),transparent_30%),linear-gradient(135deg,#10253b,#07111f)]" />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-80" />

                            {/* Type */}
                            <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D8C7A4] backdrop-blur-md">
                              {item.kind ===
                              "design"
                                ? "Home Design"
                                : "Home & Land"}
                            </div>

                            {/* Wishlist */}
                            <div className="absolute right-4 top-4 z-30">
                              <WishlistButton
                                size="sm"
                                entry={
                                  item
                                }
                              />
                            </div>

                            {/* Image content */}
                            <div className="absolute bottom-4 left-4 right-4">
                              <h2 className="font-display text-2xl leading-tight text-white">
                                {
                                  item.name
                                }
                              </h2>

                              {item.price && (
                                <p className="mt-1 text-sm text-white/65">
                                  {
                                    item.price
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Card content */}
                          <div className="p-5">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                                  Saved
                                  Property
                                </p>

                                <p className="mt-1 text-sm text-white/55">
                                  Hover to
                                  preview
                                </p>
                              </div>

                              <Link
                                href={
                                  href
                                }
                                onClick={(
                                  event
                                ) =>
                                  event.stopPropagation()
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50 transition hover:border-[#D8C7A4]/40 hover:text-[#D8C7A4]"
                                aria-label={`Open ${item.name}`}
                              >
                                <ArrowUpRight
                                  size={
                                    16
                                  }
                                />
                              </Link>
                            </div>

                            <button
                              type="button"
                              onClick={async (
                                event
                              ) => {
                                event.preventDefault();
                                event.stopPropagation();

                                await remove(
                                  item
                                );
                              }}
                              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45 transition hover:border-red-300/25 hover:bg-red-300/[0.05] hover:text-red-200"
                            >
                              <Trash2
                                size={
                                  14
                                }
                              />

                              Remove
                              from
                              wishlist
                            </button>
                          </div>
                        </article>
                      </SlugHoverPreview>
                    </motion.li>
                  );
                }
              )}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </main>
  );
}