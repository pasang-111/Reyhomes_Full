"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Shared skeleton primitives — cream / navy luxury language.
 * Use inside loading.tsx or while client auth/data is resolving.
 */

const pulse =
  "animate-pulse bg-gradient-to-r from-[#0A1628]/[0.06] via-[#0A1628]/[0.1] to-[#0A1628]/[0.06]";

const pulseDark =
  "animate-pulse bg-gradient-to-r from-white/[0.04] via-white/[0.09] to-white/[0.04]";

type BoneProps = {
  className?: string;
  style?: CSSProperties;
  dark?: boolean;
};

export function Bone({ className = "", style, dark }: BoneProps) {
  return (
    <div
      className={`rounded-md ${dark ? pulseDark : pulse} ${className}`}
      style={style}
      aria-hidden
    />
  );
}

export function SkeletonPage({
  children,
  className = "",
  dark,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={
        dark
          ? `min-h-screen bg-[#07080a] text-[#fbf7e6] ${className}`
          : `min-h-screen bg-[#F5F0E6] text-[#0A1628] ${className}`
      }
      role="status"
      aria-busy="true"
      aria-label="Loading page"
    >
      {children}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Home page skeleton — hero + section cards */
export function HomePageSkeleton() {
  return (
    <SkeletonPage dark className="overflow-hidden">
      {/* Hero */}
      <div className="relative h-[85vh] min-h-[520px] w-full">
        <Bone dark className="absolute inset-0 rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080a] via-transparent to-transparent" />
        <div className="absolute bottom-24 left-1/2 w-full max-w-4xl -translate-x-1/2 px-6 text-center">
          <Bone dark className="mx-auto h-3 w-28 rounded-full" />
          <Bone dark className="mx-auto mt-5 h-12 w-[min(90%,28rem)] rounded-lg" />
          <Bone dark className="mx-auto mt-3 h-12 w-[min(70%,20rem)] rounded-lg" />
          <Bone dark className="mx-auto mt-8 h-12 w-40 rounded-full" />
        </div>
      </div>

      {/* Featured designs */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <Bone dark className="h-3 w-24 rounded-full" />
        <Bone dark className="mt-4 h-10 w-64 rounded-lg" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.03]"
            >
              <Bone dark className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-3 p-5">
                <Bone dark className="h-4 w-2/3 rounded" />
                <Bone dark className="h-3 w-1/2 rounded" />
                <Bone dark className="h-3 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Packages strip */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <Bone dark className="h-3 w-28 rounded-full" />
        <Bone dark className="mt-4 h-10 w-72 rounded-lg" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.03]"
            >
              <Bone dark className="aspect-[16/9] w-full rounded-none" />
              <div className="space-y-3 p-5">
                <Bone dark className="h-4 w-1/2 rounded" />
                <Bone dark className="h-3 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </SkeletonPage>
  );
}

/** Account page skeleton — cream member layout */
export function AccountPageSkeleton() {
  return (
    <SkeletonPage className="px-5 pb-24 pt-32 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Bone className="h-3 w-28 rounded-full" />
        <Bone className="mt-4 h-12 w-72 max-w-full rounded-lg sm:h-14 sm:w-96" />
        <Bone className="mt-5 h-4 w-full max-w-xl rounded" />
        <Bone className="mt-2 h-4 w-2/3 max-w-md rounded" />

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[30px] bg-[#0A1628] p-7 sm:p-9">
            <div className="flex items-start gap-5">
              <Bone dark className="h-14 w-14 shrink-0 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-3">
                <Bone dark className="h-3 w-24 rounded" />
                <Bone dark className="h-8 w-48 max-w-full rounded" />
                <Bone dark className="h-4 w-40 max-w-full rounded" />
              </div>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Bone dark className="h-20 rounded-2xl" />
              <Bone dark className="h-20 rounded-2xl" />
            </div>
          </div>
          <div className="rounded-[30px] border border-[#0A1628]/10 bg-white/75 p-7 sm:p-9">
            <Bone className="h-3 w-24 rounded" />
            <div className="mt-6 space-y-3">
              <Bone className="h-14 rounded-2xl" />
              <Bone className="h-14 rounded-2xl" />
              <Bone className="h-14 rounded-2xl" />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-[26px] border border-[#0A1628]/10 bg-white/75 p-6"
            >
              <Bone className="h-6 w-6 rounded" />
              <Bone className="mt-5 h-6 w-32 rounded" />
              <Bone className="mt-3 h-4 w-full rounded" />
              <Bone className="mt-2 h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
}

/** Generic content page skeleton (optional reuse) */
export function ContentPageSkeleton({ dark }: { dark?: boolean }) {
  return (
    <SkeletonPage dark={dark} className="px-5 pb-24 pt-32 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Bone dark={dark} className="h-3 w-24 rounded-full" />
        <Bone dark={dark} className="mt-4 h-12 w-80 max-w-full rounded-lg" />
        <Bone dark={dark} className="mt-4 h-4 w-full max-w-2xl rounded" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={
                dark
                  ? "overflow-hidden rounded-[20px] border border-white/5"
                  : "overflow-hidden rounded-[20px] border border-[#0A1628]/8 bg-white/60"
              }
            >
              <Bone dark={dark} className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Bone dark={dark} className="h-4 w-2/3 rounded" />
                <Bone dark={dark} className="h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
}
