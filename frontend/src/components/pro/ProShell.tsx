"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, type ReactNode } from "react";
import {
  Home,
  HardHat,
  MessageCircle,
  Sparkles,
  Bell,
  ArrowLeft,
} from "lucide-react";

const NAV = [
  { href: "/pro/home", label: "Home", icon: Home },
  { href: "/pro/build", label: "Build", icon: HardHat },
  { href: "/pro/messages", label: "Messages", icon: MessageCircle },
  { href: "/pro/inclusions", label: "Inclusions", icon: Sparkles },
  { href: "/pro/notifications", label: "Alerts", icon: Bell },
];

export default function ProShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/pro/home")}`);
      return;
    }
    if (!user.is_reypro) {
      router.replace("/account");
    }
  }, [loading, user, router, pathname]);

  if (loading || !user || !user.is_reypro) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07080a] text-white/50">
        Opening ReyHomes Pro…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-[#F5F0E6]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07080a]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-white/40 transition hover:text-white"
              aria-label="Back to site"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#D8C7A4]">
                ReyHomes Pro
              </p>
              <p className="text-sm text-white/70">
                {user.first_name || user.email}
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition ${
                    active
                      ? "bg-[#D8C7A4] text-[#0A1628]"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-t border-white/5 px-2 py-2 md:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] ${
                  active
                    ? "bg-[#D8C7A4] text-[#0A1628]"
                    : "text-white/50"
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
