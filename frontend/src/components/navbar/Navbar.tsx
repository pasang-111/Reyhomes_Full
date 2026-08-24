"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ExternalLink,
  FileText,
  Heart,
  LogOut,
  Menu as MenuIcon,
  Search,
  Sparkles,
  Star,
  User,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import type { HomeDesignListItem } from "@/types/home";
import type { HomeLandPackageListItem } from "@/types/land";
import type { Inclusion } from "@/lib/api/inclusions";
import { trackSearchEvent } from "@/lib/api/searchAnalytics";

import { useAuth } from "@/context/AuthContext";
import { normalizePath, isSafeInternalPath } from "@/lib/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { API_BASE } from "@/lib/api/client";
import { useWishlist } from "@/context/WishlistContext";
import { AuthToast, DropletPulse } from "@/components/ui/AuthEffects";

/* -------------------------------------------------------
   MOTION VARIANTS — smoother, more deliberate
------------------------------------------------------- */
const EASE = [0.22, 0.68, 0, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_IN_OUT = [0.45, 0, 0.15, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.055,
      duration: 0.52,
      ease: EASE_OUT,
    },
  }),
  exit: {
    opacity: 0,
    y: 10,
    filter: "blur(2px)",
    transition: { duration: 0.22, ease: EASE_IN_OUT },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.08 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.48, ease: EASE_OUT },
  },
};

const megaPanel = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: EASE_OUT,
      opacity: { duration: 0.36 },
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.32,
      ease: EASE_IN_OUT,
      opacity: { duration: 0.22 },
    },
  },
};

const mobileSlide = {
  hidden: { opacity: 0, x: "100%", scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.48, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    x: "100%",
    scale: 0.98,
    transition: { duration: 0.36, ease: EASE_IN_OUT },
  },
};

/* -------------------------------------------------------
   CONSTANTS
------------------------------------------------------- */
const BRAND_FONT =
  '"Playfair Display", "Cormorant Garamond", Georgia, "Times New Roman", serif';

const asText = (value: unknown): string =>
  typeof value === "string" ? value : "";

const DESIGN_CATEGORIES = [
  "Single Storey",
  "Double Storey",
  "Duplex",
] as const;

type DesignCategory = (typeof DESIGN_CATEGORIES)[number];
type DesignTab = "All" | DesignCategory;

const DESIGN_TABS: DesignTab[] = ["All", ...DESIGN_CATEGORIES];

const INCLUSION_CATEGORIES = [
  "All",
  "Kitchen",
  "Bathroom",
  "Electrical",
  "Flooring",
  "Facade",
  "Living",
  "Exterior",
  "Other",
] as const;

const INCLUSION_CATEGORY_MAP: Record<string, string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  electrical: "Electrical",
  flooring: "Flooring",
  facade: "Facade",
  living: "Living",
  exterior: "Exterior",
  other: "Other",
};

const CATEGORY_IMAGES: Record<string, string> = {
  kitchen:
    "https://images.unsplash.com/photo-1696986681606-b156ccd761c5?auto=format&fit=crop&w=800&q=80",
  bathroom:
    "https://images.unsplash.com/photo-1754788358645-d6e6cca12e25?auto=format&fit=crop&w=800&q=80",
  electrical:
    "https://images.unsplash.com/photo-1531762948975-73032b7b61f4?auto=format&fit=crop&w=800&q=80",
  flooring:
    "https://images.unsplash.com/photo-1635603498472-bd44fd7b0735?auto=format&fit=crop&w=800&q=80",
  facade:
    "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=800&q=80",
  living:
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
  exterior:
    "https://images.unsplash.com/photo-1706808849780-7a04fbac83ef?auto=format&fit=crop&w=800&q=80",
  other:
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
};

type NavbarProps = {
  projects?: any[];
  designs: HomeDesignListItem[];
  packages: HomeLandPackageListItem[];
  inclusions: Inclusion[];
};

const NAV_ITEMS = [
  { key: "HOME DESIGNS", label: "Home Designs", href: "/home-designs", mega: true },
  { key: "HOME & LAND", label: "Home & Land", href: "/home-land", mega: true },
  { key: "INCLUSIONS", label: "Inclusions", href: "/inclusions", mega: true },
  { key: "PROJECTS", label: "Projects", href: "/projects", mega: false },
  { key: "ABOUT US", label: "About", href: "/about", mega: true },
] as const;

/* -------------------------------------------------------
   COLOR TOKENS — REY HOMES (Oceanic Blue)
------------------------------------------------------- */
const COLOR = {
  // Main backgrounds – lighter oceanic navy
  bgStrong: "linear-gradient(180deg, rgba(12, 42, 68, 0.97) 0%, rgba(8, 32, 54, 0.99) 100%)",
  bgStrongScrolled: "linear-gradient(180deg, rgba(10, 36, 58, 0.96) 0%, rgba(6, 26, 44, 0.99) 100%)",
  bgExpanded: "linear-gradient(180deg, rgba(12, 44, 72, 0.98) 0%, rgba(8, 34, 56, 0.995) 100%)",

  // Brand blues
  brand: "#0C2A44",
  brandSoft: "#1A4A6E",
  brandGlow: "rgba(26, 90, 140, 0.35)",

  // Cream
  cream: "#F8F5F0",
  creamSoft: "rgba(248, 245, 240, 0.22)",
  creamMuted: "rgba(248, 245, 240, 0.55)",

  // Text
  text: "#F8F5F0",
  textMuted: "rgba(248, 245, 240, 0.72)",
  textSubtle: "rgba(248, 245, 240, 0.48)",

  // Borders
  border: "rgba(248, 245, 240, 0.16)",
  borderSoft: "rgba(248, 245, 240, 0.09)",

  // Brass — matches the auth pages' CTA/accent (the "member identity" color)
  brass: "#D8C7A4",
  brassGradient: "linear-gradient(135deg, #F5F0E6, #E8D9B8, #D8C7A4)",
  tide: "#4FA6A8",

  // Silver — capsule ring + active-link underline
  silver: "#C5CAD3",
};

function getInitials(
  u: { first_name?: string; last_name?: string; email?: string } | null
) {
  if (!u) return "";
  const f = u.first_name?.[0] ?? "";
  const l = u.last_name?.[0] ?? "";
  if (f || l) return (f + l).toUpperCase();
  return (u.email?.[0] ?? "?").toUpperCase();
}

export default function Navbar({
  designs: homeDesigns,
  packages: homeLandPackages,
  inclusions,
  projects = [],
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { user, logout, authEvent, loading: authLoading } = useAuth();
  const { count: wishlistCount } = useWishlist();

  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [renderedMenu, setRenderedMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [designTab, setDesignTab] = useState<DesignTab>("All");
  const [inclusionTab, setInclusionTab] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activePdf, setActivePdf] = useState<{ url: string; title: string } | null>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [dropletActive, setDropletActive] = useState(false);
  const [localToast, setLocalToast] = useState<string | null>(null);

  const capsuleRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 70);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (panelTimer.current) clearTimeout(panelTimer.current);
    };
  }, []);

  useEffect(() => {
    if (activeMenu === renderedMenu) return;
    if (panelTimer.current) clearTimeout(panelTimer.current);

    if (!activeMenu) {
      // Wait for exit animation to finish before unmounting
      panelTimer.current = setTimeout(() => setRenderedMenu(null), 340);
      return;
    }
    if (!renderedMenu) {
      setRenderedMenu(activeMenu);
      return;
    }
    // Cross-fade between different mega panels
    panelTimer.current = setTimeout(() => setRenderedMenu(activeMenu), 140);
  }, [activeMenu, renderedMenu]);

  useEffect(() => {
    if (!mobileOpen && !searchOpen && !activePdf) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, searchOpen, activePdf]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (activePdf) return setActivePdf(null);
      if (searchOpen) {
        setSearchOpen(false);
        setQuery("");
        return;
      }
      setActiveMenu(null);
      setMobileOpen(false);
      setMobileSubmenu(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activePdf, searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [searchOpen]);

  // Login / register / sign-out: droplet flourish only.
  // Cinematic welcome + redirect are owned by login/register pages + SiteChrome.
  useEffect(() => {
    if (!authEvent) return;
    setDropletActive(true);
    const t = setTimeout(() => setDropletActive(false), 950);
    return () => clearTimeout(t);
  }, [authEvent]);

  // Restore sign-out (or other) toast after navigation / remount
  useEffect(() => {
    try {
      const msg = sessionStorage.getItem("auth_toast");
      if (msg) {
        setLocalToast(msg);
        sessionStorage.removeItem("auth_toast");
      }
    } catch {
      /* ignore */
    }
  }, []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const words = q.split(/\s+/).filter(Boolean);
    const match = (...fields: unknown[]) => {
      const hay = fields.map((f) => asText(f).toLowerCase()).join(" ");
      return words.every((w) => hay.includes(w));
    };
    return {
      designs: homeDesigns
        .filter((d) =>
          match(
            d.name,
            d.slug,
            d.category,
            d.beds,
            d.baths,
            d.price
          )
        )
        .slice(0, 6),
      packages: homeLandPackages
        .filter((p) =>
          match(
            p.title,
            p.slug,
            p.suburb,
            p.estate_name,
            p.badge,
            p.price,
            p.beds
          )
        )
        .slice(0, 6),
      projects: (projects || [])
        .filter((pr: any) =>
          match(pr.title, pr.slug, pr.location, pr.category, pr.status)
        )
        .slice(0, 6),
      inclusions: inclusions
        .filter((i) => match(i.title, i.slug, i.category, i.tier))
        .slice(0, 6),
    };
  }, [query, homeDesigns, homeLandPackages, inclusions, projects]);

  // Debounced search analytics (queries with 2+ chars)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || !searchResults) return;
    const timer = setTimeout(() => {
      const count =
        searchResults.designs.length +
        searchResults.packages.length +
        ((searchResults as { projects?: unknown[] }).projects?.length || 0) +
        searchResults.inclusions.length;
      trackSearchEvent({
        event_type: "query",
        query: q,
        result_count: count,
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [query, searchResults]);


  const scheduleOpen = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openTimer.current) clearTimeout(openTimer.current);
    // Slightly longer open delay feels intentional and avoids flicker
    openTimer.current = setTimeout(() => setActiveMenu(key), 90);
  };

  const scheduleClose = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    // Longer grace period so cursor can travel into the panel without closing
    closeTimer.current = setTimeout(() => setActiveMenu(null), 360);
  };

  /* -------------------------------------------------------
     ROUTING
     - closeOverlays → use on <Link onClick> (Link handles the URL)
     - navigateTo / handleRoute → buttons, menu cards, CTAs
     - replaceTo → logout / auth gates (no back-stack to form)
  ------------------------------------------------------- */
  const closeOverlays = () => {
    setActiveMenu(null);
    setMobileOpen(false);
    setMobileSubmenu(null);
    setSearchOpen(false);
    setQuery("");
  };

  const scrollTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  /** Client navigation that always attempts to change route when needed. */
  const navigateTo = (href: string) => {
    if (!href || typeof href !== "string") return;
    closeOverlays();

    // External or protocol links
    if (/^https?:\/\//i.test(href) || href.startsWith("mailto:")) {
      window.location.href = href;
      return;
    }

    const target = normalizePath(href);
    const current = normalizePath(pathname);

    if (target !== current) {
      // Prefer App Router soft navigation
      try {
        router.push(target);
      } catch {
        window.location.assign(target);
      }
    } else {
      // Same path — still refresh content and scroll
      try {
        router.refresh();
      } catch {
        /* ignore */
      }
    }
    scrollTop();
  };

  const handleRoute = navigateTo;

  const replaceTo = (href: string) => {
    if (!href) return;
    closeOverlays();
    const target = isSafeInternalPath(href) ? normalizePath(href) : href;
    try {
      router.replace(target);
    } catch {
      window.location.replace(target);
    }
    scrollTop();
  };

  const handleLogout = () => {
    logout();
    try {
      sessionStorage.setItem("auth_toast", "You have been signed out");
    } catch {
      /* ignore */
    }
    setLocalToast("You have been signed out");
    replaceTo("/login");
  };

  const openPdf = (url: string, title: string) => {
    setActiveMenu(null);
    setMobileOpen(false);
    setMobileSubmenu(null);
    setSearchOpen(false);
    setQuery("");
    // Resolve relative media paths so the iframe can load the file
    let resolved = url || "";
    if (resolved && !/^https?:\/\//i.test(resolved)) {
      const base = (API_BASE || "").replace(/\/$/, "");
      resolved = resolved.startsWith("/")
        ? `${base}${resolved}`
        : `${base}/${resolved}`;
    }
    setActivePdf({ url: resolved, title });
  };

  const handleGlow = (e: MouseEvent<HTMLDivElement>) => {
    const rect = capsuleRef.current?.getBoundingClientRect();
    if (!rect) return;
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const designsInTab = useMemo(() => {
    if (designTab === "All") return homeDesigns;
    return homeDesigns.filter((d) => d.category === designTab);
  }, [homeDesigns, designTab]);

  const inclusionCategories = useMemo(() => {
    const available = new Set(
      inclusions
        .map((i) => INCLUSION_CATEGORY_MAP[asText(i.category).toLowerCase()])
        .filter(Boolean)
    );
    return INCLUSION_CATEGORIES.filter(
      (c) => c === "All" || available.has(c)
    );
  }, [inclusions]);

  const inclusionsInTab = useMemo(() => {
    if (inclusionTab === "All") return inclusions;
    return inclusions.filter(
      (i) =>
        INCLUSION_CATEGORY_MAP[asText(i.category).toLowerCase()] === inclusionTab
    );
  }, [inclusions, inclusionTab]);

  // Group inclusions by category for the book-style mega menu
  const inclusionBooks = useMemo(() => {
    const byCategory = new Map<string, Inclusion[]>();
    for (const item of inclusions) {
      const cat = item.category || "other";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(item);
    }
    return Array.from(byCategory.entries())
      .map(([category, items]) => ({
        category,
        items,
        featured: items.find((i) => i.pdf_url) || items[0],
        label: INCLUSION_CATEGORY_MAP[category] || category,
      }))
      .filter((b) => Boolean(b.featured?.pdf_url))
      .sort((a, b) => b.items.length - a.items.length)
      .slice(0, 4);
  }, [inclusions]);

  const capsuleExpanded = Boolean(activeMenu);

  return (
    <>
      {/* Ambient aura – oceanic */}
      <div
        className={`pointer-events-none fixed left-1/2 z-[1] -translate-x-1/2 transition-all duration-[850ms] ${
          capsuleExpanded
            ? "top-3 h-[92px] w-[96vw] max-w-[1180px]"
            : scrolled
              ? "top-2 h-[66px] w-[94vw] max-w-[960px]"
              : "top-4 h-[92px] w-[96vw] max-w-[1120px]"
        }`}
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(30, 110, 170, 0.22), rgba(248,245,240,0.05) 45%, transparent 75%)",
          filter: "blur(42px)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* Local toast for sign-out after navigation (global toast also lives in SiteChrome) */}
      <AuthToast
        message={localToast}
        onDone={() => setLocalToast(null)}
        colors={{ bg: "rgba(8, 32, 54, 0.97)", border: COLOR.border, text: COLOR.cream }}
      />

      {/* HEADER */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[10]">
        <div
          ref={capsuleRef}
          onMouseMove={handleGlow}
          onMouseLeave={scheduleClose}
          className={`pointer-events-auto absolute left-1/2 -translate-x-1/2 w-[96vw] transition-all duration-[850ms] ${
            capsuleExpanded
              ? "top-4 max-w-[1180px]"
              : scrolled
                ? "top-3 max-w-[960px]"
                : "top-5 max-w-[1120px]"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <div
            className={`nav-silver-ring relative border transition-all duration-[850ms] ${
              capsuleExpanded
                ? "overflow-hidden rounded-[28px]"
                : "overflow-visible rounded-full"
            }`}
            style={{
              borderColor: COLOR.border,
              background: capsuleExpanded
                ? COLOR.bgExpanded
                : scrolled
                  ? COLOR.bgStrongScrolled
                  : COLOR.bgStrong,
              backdropFilter: "blur(34px) saturate(120%)",
              WebkitBackdropFilter: "blur(34px) saturate(120%)",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: capsuleExpanded
                ? `0 40px 120px -28px rgba(0,0,0,.88), 0 0 0 1px ${COLOR.border}, 0 0 100px ${COLOR.brandGlow}, inset 0 1px 0 rgba(255,255,255,.12)`
                : `0 28px 90px -32px rgba(0,0,0,.82), 0 0 0 1px ${COLOR.border}, inset 0 1px 0 rgba(255,255,255,.08)`,
            }}
          >
            {/* sheen + glow layers */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,.04), transparent 35%, rgba(0,0,0,.15))",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(260px circle at ${glow.x}% ${glow.y}%, ${COLOR.creamSoft}, transparent 70%)`,
              }}
            />

            {/* MAIN ROW — min-height so content never clips while shrinking */}
            <div
              className={`relative flex items-center justify-between gap-2 px-4 sm:px-6 transition-all duration-[650ms] ${
                capsuleExpanded
                  ? "min-h-[76px] h-[76px]"
                  : scrolled
                    ? "min-h-[58px] h-[58px]"
                    : "min-h-[82px] h-[82px]"
              }`}
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              {/* Logo */}
              <Link
                href="/"
                onClick={() => closeOverlays()}
                className="group relative flex shrink-0 items-center"
              >
                <Image
                  src="/image/team/reyhomes.png"
                  alt="ReyHomes"
                  width={220}
                  height={64}
                  priority
                  className={`w-auto object-contain transition-all duration-[650ms] ${
                    scrolled ? "h-9 sm:h-10" : "h-10 sm:h-12"
                  }`}
                  style={{
                    maxWidth: scrolled ? "170px" : "200px",
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </Link>

              {/* Desktop Nav */}
              <nav
                className={`hidden items-center md:flex transition-all duration-500 ${
                  scrolled ? "gap-0.5" : "gap-1"
                }`}
              >
                {NAV_ITEMS.map((item) => {
                  const active =
                    activeMenu === item.key || pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onMouseEnter={() => item.mega && scheduleOpen(item.key)}
                      onFocus={() => item.mega && scheduleOpen(item.key)}
                      onClick={() => {
                        setActiveMenu(null);
                      }}
                      className={`group relative flex items-center gap-1.5 rounded-full font-medium tracking-[.01em] transition-all duration-300 ${
                        scrolled
                          ? "px-2.5 py-2 text-[12.5px]"
                          : "px-3.5 py-2.5 text-[13.5px]"
                      }`}
                      style={{
                        color: active ? COLOR.text : COLOR.textMuted,
                        opacity: active ? 1 : 0.85,
                      }}
                    >
                      {item.label}
                      {item.mega && (
                        <ChevronDown
                          size={13}
                          strokeWidth={1.7}
                          style={{
                            color: active ? COLOR.textMuted : "rgba(248,245,240,.3)",
                            transform: active ? "rotate(180deg)" : "none",
                            transition: "transform 300ms",
                          }}
                        />
                      )}
                      <span
                        className={`absolute bottom-1 left-1/2 h-px -translate-x-1/2 transition-all duration-300 ${
                          active ? "w-8 opacity-100" : "w-0 opacity-0"
                        }`}
                        style={{
                          background: `linear-gradient(90deg, transparent, ${COLOR.silver}, transparent)`,
                        }}
                      />
                    </Link>
                  );
                })}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                {/* Welcome chip — hide when scrolled so the compact bar never overflows */}
                {!authLoading && user && !scrolled && !capsuleExpanded && (
                  <span
                    className="mr-1 hidden max-w-[140px] items-center truncate rounded-full px-3 py-1.5 text-[11px] lg:inline-flex"
                    style={{
                      color: COLOR.creamMuted,
                      border: `1px solid ${COLOR.borderSoft}`,
                      background: "rgba(255,255,255,.03)",
                    }}
                  >
                    Welcome, {user.first_name || user.email}
                  </span>
                )}

                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => setSearchOpen(true)}
                  className={`hidden items-center justify-center rounded-full transition-all duration-300 sm:flex ${
                    scrolled ? "h-8 w-8" : "h-9 w-9"
                  }`}
                  style={{
                    color: COLOR.textMuted,
                    background: "rgba(255,255,255,.03)",
                    border: `1px solid ${COLOR.borderSoft}`,
                  }}
                >
                  <Search size={scrolled ? 15 : 16} strokeWidth={1.7} />
                </button>

                <div className="relative hidden sm:block">
                  <ThemeToggle
                    compact
                    size={scrolled ? 15 : 16}
                    className={scrolled ? "h-8 w-8" : "h-9 w-9"}
                  />
                </div>

                <div className="relative hidden sm:block">
                  <DropletPulse active={dropletActive} />
                  <button
                    type="button"
                    aria-label="Wishlist"
                    onClick={() => handleRoute("/wishlist")}
                    className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                      scrolled ? "h-8 w-8" : "h-9 w-9"
                    }`}
                    style={{
                      color: COLOR.textMuted,
                      background: "rgba(255,255,255,.03)",
                      border: `1px solid ${COLOR.borderSoft}`,
                    }}
                  >
                    <Heart
                      size={16}
                      strokeWidth={1.7}
                      color={COLOR.creamMuted}
                      fill={wishlistCount > 0 ? COLOR.brass : "none"}
                      style={{ color: wishlistCount > 0 ? COLOR.brass : COLOR.creamMuted }}
                    />
                    {wishlistCount > 0 && (
                      <span
                        className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[9px] font-bold"
                        style={{
                          background: COLOR.brass,
                          color: COLOR.brand,
                          boxShadow: "0 0 12px rgba(216, 199, 164, 0.35)",
                        }}
                      >
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="relative hidden sm:block">
                  <DropletPulse active={dropletActive} />

                  {authLoading ? (
                    // Skeleton — avoids the guest icon flashing before we know if there's a session
                    <div
                      className={`animate-pulse rounded-full transition-all duration-300 ${
                        scrolled ? "h-8 w-8" : "h-9 w-9"
                      }`}
                      style={{
                        background: "rgba(255,255,255,.06)",
                        border: `1px solid ${COLOR.borderSoft}`,
                      }}
                    />
                  ) : user ? (
                    <button
                      type="button"
                      aria-label="Account"
                      aria-expanded={activeMenu === "ACCOUNT"}
                      onClick={() => {
                        if (activeMenu === "ACCOUNT") {
                          setActiveMenu(null);
                        } else {
                          // Open as a mega-panel (same system as nav items)
                          if (closeTimer.current) clearTimeout(closeTimer.current);
                          if (openTimer.current) clearTimeout(openTimer.current);
                          setActiveMenu("ACCOUNT");
                        }
                      }}
                      onMouseEnter={() => {
                        // Keep open while hovering the avatar when ACCOUNT is active
                        if (activeMenu === "ACCOUNT" && closeTimer.current) {
                          clearTimeout(closeTimer.current);
                        }
                      }}
                      className={`flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                        scrolled ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-[11px]"
                      }`}
                      style={{
                        background: COLOR.brassGradient,
                        color: COLOR.brand,
                        boxShadow:
                          activeMenu === "ACCOUNT"
                            ? `0 0 0 2px ${COLOR.brass}`
                            : "0 4px 14px rgba(0,0,0,.25)",
                      }}
                    >
                      {getInitials(user)}
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label="Sign in"
                      onClick={() => handleRoute("/login")}
                      className={`group flex items-center justify-center rounded-full transition-all duration-300 ${
                        scrolled ? "h-8 w-8" : "h-9 w-9"
                      }`}
                      style={{
                        color: COLOR.textMuted,
                        background: "rgba(255,255,255,.03)",
                        border: `1px solid ${COLOR.borderSoft}`,
                      }}
                    >
                      <User
                        size={scrolled ? 15 : 16}
                        strokeWidth={1.7}
                        className="transition-colors group-hover:text-[#D8C7A4]"
                      />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRoute("/enquire")}
                  className={`group relative hidden overflow-hidden rounded-full font-semibold tracking-[.08em] transition-all duration-300 hover:-translate-y-0.5 sm:flex ${
                    scrolled
                      ? "px-4 py-2 text-[10.5px]"
                      : "px-5 py-2.5 text-[11.5px]"
                  }`}
                  style={{
                    background: COLOR.brassGradient,
                    color: COLOR.brand,
                    boxShadow: "0 10px 32px rgba(30, 110, 170, 0.18)",
                  }}
                >
                  <span className="relative z-10">ENQUIRE</span>
                  <span
                    className="absolute inset-0 -translate-x-full transition-transform duration-700 group-hover:translate-x-full"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent)",
                    }}
                  />
                </button>

                <button
                  type="button"
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  onClick={() => setMobileOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition md:hidden"
                  style={{
                    color: "rgba(248,245,240,.9)",
                    background: "rgba(255,255,255,.04)",
                    border: `1px solid ${COLOR.borderSoft}`,
                  }}
                >
                  {mobileOpen ? <X size={19} /> : <MenuIcon size={19} />}
                </button>
              </div>
            </div>

            {/* MEGA MENU */}
            <AnimatePresence mode="wait">
              {renderedMenu && (
                <motion.div
                  key={renderedMenu}
                  variants={megaPanel}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="hidden border-t md:block"
                  style={{
                    borderColor: COLOR.borderSoft,
                    background:
                      "linear-gradient(180deg, rgba(8, 34, 58, 0.98), rgba(6, 26, 46, 0.99))",
                  }}
                  onMouseEnter={() => {
                    if (closeTimer.current) clearTimeout(closeTimer.current);
                  }}
                >
                  <div
                    className="relative max-h-[560px] overflow-y-auto px-7 pb-8 pt-7"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 0%, rgba(40, 120, 180, 0.14), transparent 42%)",
                    }}
                  >
                    {/* ========== HOME DESIGNS ========== */}
                    {renderedMenu === "HOME DESIGNS" && (
                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.div
                          variants={fadeUp}
                          className="mb-6 flex items-end justify-between gap-5"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Star size={11} style={{ color: COLOR.textMuted }} />
                              <p
                                className="text-[8px] font-semibold uppercase tracking-[.4em]"
                                style={{ color: COLOR.cream }}
                              >
                                SIGNATURE COLLECTION
                              </p>
                            </div>
                            <h2
                              className="mt-2 text-3xl font-light tracking-tight"
                              style={{ color: COLOR.text, fontFamily: BRAND_FONT }}
                            >
                              Homes with presence.
                            </h2>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRoute("/home-designs")}
                            className="flex items-center gap-2 rounded-full px-4 py-2 text-[10px] transition"
                            style={{
                              border: `1px solid ${COLOR.border}`,
                              color: COLOR.textMuted,
                            }}
                          >
                            View collection
                            <ArrowUpRight size={13} />
                          </button>
                        </motion.div>

                        <motion.div
                          variants={fadeUp}
                          className="mb-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar"
                        >
                          {DESIGN_TABS.map((tab) => {
                            const count =
                              tab === "All"
                                ? homeDesigns.length
                                : homeDesigns.filter((d) => d.category === tab)
                                    .length;
                            const active = designTab === tab;
                            return (
                              <button
                                key={tab}
                                type="button"
                                disabled={count === 0}
                                onClick={() => setDesignTab(tab)}
                                className={`shrink-0 rounded-full border px-4 py-1.5 text-[9px] font-medium transition-all ${
                                  count === 0 ? "cursor-not-allowed opacity-30" : ""
                                }`}
                                style={{
                                  borderColor: active
                                    ? "rgba(248,245,240,.9)"
                                    : COLOR.borderSoft,
                                  background: active
                                    ? COLOR.cream
                                    : "rgba(255,255,255,.04)",
                                  color: active ? COLOR.brand : COLOR.textMuted,
                                }}
                              >
                                {tab}
                                {count > 0 && (
                                  <span className="ml-1.5 opacity-55">{count}</span>
                                )}
                              </button>
                            );
                          })}
                        </motion.div>

                        <div className="grid grid-cols-3 gap-4">
                          {designsInTab.slice(0, 6).map((item, i) => {
                            const image = asText(item.image || item.hero_image_url);
                            return (
                              <motion.button
                                key={item.id}
                                variants={fadeUp}
                                custom={i}
                                type="button"
                                onClick={() =>
                                  handleRoute(`/home-designs/${asText(item.slug)}`)
                                }
                                className="group relative overflow-hidden rounded-2xl border text-left transition-all duration-500 hover:-translate-y-1"
                                style={{
                                  borderColor: "rgba(248,245,240,.09)",
                                  background: "rgba(255,255,255,.03)",
                                }}
                              >
                                <div className="relative h-[155px] overflow-hidden">
                                  {image ? (
                                    <Image
                                      src={image}
                                      alt={asText(item.name)}
                                      fill
                                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                      sizes="300px"
                                    />
                                  ) : (
                                    <div
                                      className="absolute inset-0"
                                      style={{
                                        background:
                                          "linear-gradient(135deg, #1A4A6E, #0C2A44)",
                                      }}
                                    />
                                  )}
                                  <div
                                    className="absolute inset-0"
                                    style={{
                                      background:
                                        "linear-gradient(to top, rgba(0,0,0,.8), transparent)",
                                    }}
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <p
                                      className="truncate text-sm font-medium"
                                      style={{ color: COLOR.text }}
                                    >
                                      {asText(item.name)}
                                    </p>
                                    <p
                                      className="mt-1 text-[9px] uppercase tracking-[.15em]"
                                      style={{ color: COLOR.creamMuted }}
                                    >
                                      {asText(item.category)}
                                    </p>
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* ========== HOME & LAND ========== */}
                    {renderedMenu === "HOME & LAND" && (
                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.div
                          variants={fadeUp}
                          className="mb-6 flex items-end justify-between"
                        >
                          <div>
                            <p
                              className="text-[8px] font-semibold uppercase tracking-[.4em]"
                              style={{ color: COLOR.cream }}
                            >
                              CURATED OPPORTUNITIES
                            </p>
                            <h2
                              className="mt-2 text-3xl font-light"
                              style={{ color: COLOR.text, fontFamily: BRAND_FONT }}
                            >
                              Home & Land.
                            </h2>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRoute("/home-land")}
                            className="flex items-center gap-2 rounded-full px-4 py-2 text-[10px] transition"
                            style={{
                              border: `1px solid ${COLOR.border}`,
                              color: COLOR.textMuted,
                            }}
                          >
                            Explore all
                            <ArrowUpRight size={13} />
                          </button>
                        </motion.div>

                        <div className="grid grid-cols-3 gap-4">
                          {homeLandPackages.slice(0, 6).map((pkg, i) => {
                            const image = asText(
                              pkg.heroImage || pkg.hero_image_url || pkg.image
                            );
                            return (
                              <motion.button
                                key={pkg.id}
                                variants={fadeUp}
                                custom={i}
                                type="button"
                                onClick={() =>
                                  handleRoute(`/home-land/${asText(pkg.slug)}`)
                                }
                                className="group overflow-hidden rounded-2xl border text-left transition-all duration-500 hover:-translate-y-1"
                                style={{
                                  borderColor: "rgba(248,245,240,.09)",
                                  background: "rgba(255,255,255,.035)",
                                }}
                              >
                                <div className="relative h-[145px] overflow-hidden">
                                  {image && (
                                    <Image
                                      src={image}
                                      alt={asText(pkg.title)}
                                      fill
                                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                      sizes="300px"
                                    />
                                  )}
                                  <div
                                    className="absolute inset-0"
                                    style={{
                                      background:
                                        "linear-gradient(to top, rgba(0,0,0,.85), transparent)",
                                    }}
                                  />
                                </div>
                                <div className="p-4">
                                  <p
                                    className="truncate text-sm font-medium"
                                    style={{ color: COLOR.text }}
                                  >
                                    {asText(pkg.title)}
                                  </p>
                                  <p
                                    className="mt-1 text-[9px] uppercase tracking-[.12em]"
                                    style={{ color: COLOR.textSubtle }}
                                  >
                                    {asText(pkg.suburb)}
                                    {pkg.suburb && pkg.state ? ", " : ""}
                                    {asText(pkg.state)}
                                  </p>
                                  <p
                                    className="mt-3 text-xs font-semibold"
                                    style={{ color: COLOR.cream }}
                                  >
                                    {asText(pkg.price)}
                                  </p>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* ========== INCLUSIONS ========== */}
                    {renderedMenu === "INCLUSIONS" && (
                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.div
                          variants={fadeUp}
                          className="mb-8 flex items-end justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Sparkles size={12} style={{ color: COLOR.cream }} />
                              <p
                                className="text-[8px] font-semibold uppercase tracking-[.4em]"
                                style={{ color: COLOR.cream }}
                              >
                                THE REYHOMES COLLECTION
                              </p>
                            </div>
                            <h2
                              className="mt-2 text-3xl font-light"
                              style={{ color: COLOR.text, fontFamily: BRAND_FONT }}
                            >
                              Designed to be experienced.
                            </h2>
                            <p
                              className="mt-2 max-w-md text-xs"
                              style={{ color: COLOR.textSubtle }}
                            >
                              Explore the materials, finishes and architectural details
                              selected for every Rey Homes residence.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRoute("/inclusions")}
                            className="flex items-center gap-2 rounded-full px-4 py-2 text-[10px] transition"
                            style={{
                              border: `1px solid ${COLOR.border}`,
                              color: COLOR.textMuted,
                            }}
                          >
                            View complete collection
                            <ArrowUpRight size={13} />
                          </button>
                        </motion.div>

                        <div className="grid grid-cols-4 gap-5">
                          {inclusionBooks.map((book, i) => {
                            const image =
                              CATEGORY_IMAGES[book.category] ||
                              CATEGORY_IMAGES.other;
                            const count = book.items.length;

                            return (
                              <motion.button
                                key={book.category}
                                variants={fadeUp}
                                custom={i}
                                type="button"
                                onClick={() => {
                                  if (book.featured?.pdf_url) {
                                    openPdf(
                                      book.featured.pdf_url,
                                      book.label
                                    );
                                  }
                                }}
                                className="group relative text-left"
                              >
                                <div className="relative mx-auto aspect-[0.69] w-full max-w-[200px] [perspective:1000px]">
                                  <div
                                    className="relative h-full w-full overflow-hidden rounded-r-[6px] rounded-l-[2px] border border-white/10 bg-[#0C2A44] shadow-[12px_20px_40px_rgba(0,0,0,0.45)] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[18px_28px_55px_rgba(0,0,0,0.6)]"
                                    style={{ transformStyle: "preserve-3d" }}
                                  >
                                    <div
                                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                      style={{ backgroundImage: `url(${image})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-black/30 to-black/85" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />

                                    <div className="absolute inset-y-0 left-0 w-[10px] border-r border-black/40 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />

                                    <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                                      <span className="text-[7px] font-medium uppercase tracking-[0.3em] text-white/60">
                                        REY HOMES
                                      </span>
                                      <BookOpen
                                        size={12}
                                        strokeWidth={1.3}
                                        className="text-[#F8F5F0]/70"
                                      />
                                    </div>

                                    <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 text-center">
                                      <div className="mx-auto mb-3 h-px w-8 bg-[#F8F5F0]/50" />
                                      <p className="text-[7px] uppercase tracking-[0.35em] text-[#F8F5F0]/65">
                                        Volume
                                      </p>
                                      <h3
                                        className="mt-2 text-xl font-light tracking-tight text-white"
                                        style={{ fontFamily: BRAND_FONT }}
                                      >
                                        {book.label}
                                      </h3>
                                      <p className="mt-1.5 text-[7px] uppercase tracking-[0.25em] text-white/40">
                                        Collection
                                      </p>
                                      <div className="mx-auto mt-3 h-px w-8 bg-[#F8F5F0]/40" />
                                    </div>

                                    <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                                      <div>
                                        <p className="text-[6px] uppercase tracking-[0.25em] text-white/35">
                                          Edition
                                        </p>
                                        <p className="mt-0.5 text-[10px] tracking-[0.1em] text-white/75">
                                          01 / {String(count).padStart(2, "0")}
                                        </p>
                                      </div>
                                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white transition-all duration-400 group-hover:border-[#F8F5F0] group-hover:bg-[#F8F5F0] group-hover:text-[#0C2A44]">
                                        <ArrowUpRight size={12} />
                                      </div>
                                    </div>

                                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                                  </div>

                                  <div className="pointer-events-none absolute right-[-4px] top-[3%] bottom-[3%] w-[5px] rounded-r-sm bg-gradient-to-b from-[#F8F5F0]/25 via-[#F8F5F0]/08 to-[#F8F5F0]/15 opacity-70" />
                                </div>

                                <div className="mt-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5 text-[8px] uppercase tracking-[0.25em] text-white/35">
                                    <FileText size={10} />
                                    <span>{count} inclusions</span>
                                  </div>
                                  <p className="mt-1.5 text-[11px] font-medium text-white/55 transition-colors group-hover:text-[#F8F5F0]">
                                    Open volume
                                  </p>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* ========== ABOUT ========== */}
                    {renderedMenu === "ABOUT US" && (
                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 gap-12"
                      >
                        <motion.div variants={fadeUp} className="flex flex-col justify-center">
                          <p
                            className="text-[8px] font-semibold uppercase tracking-[.4em]"
                            style={{ color: COLOR.cream }}
                          >
                            THE REYHOMES STORY
                          </p>
                          <h2
                            className="mt-3 max-w-lg text-4xl font-light leading-[1.05] tracking-tight"
                            style={{ color: COLOR.text, fontFamily: BRAND_FONT }}
                          >
                            Architecture for
                            <br />
                            <span style={{ color: COLOR.creamMuted }}>
                              the way you live.
                            </span>
                          </h2>
                          <p
                            className="mt-5 max-w-md text-sm leading-relaxed"
                            style={{ color: COLOR.textSubtle }}
                          >
                            Discover the people, process and philosophy behind ReyHomes.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRoute("/about")}
                            className="mt-7 flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-[10px] transition"
                            style={{
                              border: `1px solid ${COLOR.border}`,
                              color: COLOR.textMuted,
                            }}
                          >
                            Our story
                            <ArrowUpRight size={13} />
                          </button>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            {
                              title: "Our Process",
                              description: "From first conversation to handover.",
                              href: "/process-timeline",
                            },
                            {
                              title: "Knockdown & Rebuild",
                              description: "Transform your existing address.",
                              href: "/knockdown-rebuild",
                            },
                            {
                              title: "Testimonials",
                              description: "Hear from the people who built with us.",
                              href: "/testimonials",
                            },
                            {
                              title: "Contact Us",
                              description: "Start a conversation with our team.",
                              href: "/contact",
                            },
                          ].map((item, i) => (
                            <motion.button
                              key={item.href}
                              variants={fadeUp}
                              custom={i}
                              type="button"
                              onClick={() => handleRoute(item.href)}
                              className="group rounded-2xl border p-5 text-left transition-all duration-500 hover:-translate-y-1"
                              style={{
                                borderColor: "rgba(248,245,240,.09)",
                                background: "rgba(255,255,255,.03)",
                              }}
                            >
                              <p
                                className="text-sm"
                                style={{ color: "rgba(248,245,240,.85)" }}
                              >
                                {item.title}
                              </p>
                              <p
                                className="mt-2 text-[10px] leading-relaxed"
                                style={{ color: COLOR.textSubtle }}
                              >
                                {item.description}
                              </p>
                              <ArrowUpRight
                                size={14}
                                style={{
                                  marginTop: 28,
                                  color: "rgba(248,245,240,.25)",
                                }}
                              />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* ========== ACCOUNT (member panel) ========== */}
                    {renderedMenu === "ACCOUNT" && user && (
                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 gap-10"
                      >
                        <motion.div
                          variants={fadeUp}
                          className="flex flex-col justify-center"
                        >
                          <p
                            className="text-[8px] font-semibold uppercase tracking-[.4em]"
                            style={{ color: COLOR.brass }}
                          >
                            MEMBER
                          </p>
                          <h2
                            className="mt-3 text-3xl font-light tracking-tight"
                            style={{ color: COLOR.text, fontFamily: BRAND_FONT }}
                          >
                            {user.first_name
                              ? `Hello, ${user.first_name}.`
                              : "Your account."}
                          </h2>
                          <p
                            className="mt-3 max-w-sm truncate text-sm"
                            style={{ color: COLOR.textSubtle }}
                          >
                            {user.email}
                          </p>
                          <div
                            className="mt-6 flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold"
                            style={{
                              background: COLOR.brassGradient,
                              color: COLOR.brand,
                              boxShadow: "0 8px 24px rgba(0,0,0,.3)",
                            }}
                          >
                            {getInitials(user)}
                          </div>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {user.is_client && (
                            <motion.button
                              variants={fadeUp}
                              custom={0}
                              type="button"
                              onClick={() => handleRoute("/pro/home")}
                              className="group rounded-2xl border p-5 text-left transition-all duration-500 hover:-translate-y-1 sm:col-span-2"
                              style={{
                                borderColor: "rgba(216,199,164,.35)",
                                background: "rgba(216,199,164,.08)",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles size={14} style={{ color: COLOR.brass }} />
                                <p className="text-sm" style={{ color: COLOR.brass }}>
                                  ReyHomes Pro
                                </p>
                              </div>
                              <p
                                className="mt-2 text-[10px] leading-relaxed"
                                style={{ color: COLOR.textSubtle }}
                              >
                                Exclusive tools and client workspace.
                              </p>
                              <ArrowUpRight
                                size={14}
                                style={{
                                  marginTop: 20,
                                  color: "rgba(216,199,164,.45)",
                                }}
                              />
                            </motion.button>
                          )}

                          <motion.button
                            variants={fadeUp}
                            custom={1}
                            type="button"
                            onClick={() => handleRoute("/account")}
                            className="group rounded-2xl border p-5 text-left transition-all duration-500 hover:-translate-y-1"
                            style={{
                              borderColor: "rgba(248,245,240,.09)",
                              background: "rgba(255,255,255,.03)",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <User size={14} style={{ color: COLOR.creamMuted }} />
                              <p
                                className="text-sm"
                                style={{ color: "rgba(248,245,240,.85)" }}
                              >
                                View account
                              </p>
                            </div>
                            <p
                              className="mt-2 text-[10px] leading-relaxed"
                              style={{ color: COLOR.textSubtle }}
                            >
                              Profile, preferences and details.
                            </p>
                            <ArrowUpRight
                              size={14}
                              style={{
                                marginTop: 20,
                                color: "rgba(248,245,240,.25)",
                              }}
                            />
                          </motion.button>

                          <motion.button
                            variants={fadeUp}
                            custom={2}
                            type="button"
                            onClick={() => handleRoute("/wishlist")}
                            className="group rounded-2xl border p-5 text-left transition-all duration-500 hover:-translate-y-1"
                            style={{
                              borderColor: "rgba(248,245,240,.09)",
                              background: "rgba(255,255,255,.03)",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Heart size={14} color={COLOR.creamMuted} fill={wishlistCount > 0 ? COLOR.brass : "none"} style={{ color: wishlistCount > 0 ? COLOR.brass : COLOR.creamMuted }} />
                              <p
                                className="text-sm"
                                style={{ color: "rgba(248,245,240,.85)" }}
                              >
                                Wishlist
                                {wishlistCount > 0 && (
                                  <span
                                    className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[9px] font-bold text-white"
                                    style={{
                                      background: "#E11D48",
                                      boxShadow: "0 0 10px rgba(225, 29, 72, 0.4)",
                                    }}
                                  >
                                    {wishlistCount}
                                  </span>
                                )}
                              </p>
                            </div>
                            <p
                              className="mt-2 text-[10px] leading-relaxed"
                              style={{ color: COLOR.textSubtle }}
                            >
                              Saved designs and packages.
                            </p>
                            <ArrowUpRight
                              size={14}
                              style={{
                                marginTop: 20,
                                color: "rgba(248,245,240,.25)",
                              }}
                            />
                          </motion.button>

                          <motion.button
                            variants={fadeUp}
                            custom={3}
                            type="button"
                            onClick={handleLogout}
                            className="group rounded-2xl border p-5 text-left transition-all duration-500 hover:-translate-y-1 sm:col-span-2"
                            style={{
                              borderColor: "rgba(248,245,240,.09)",
                              background: "rgba(255,255,255,.03)",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <LogOut size={14} style={{ color: COLOR.creamMuted }} />
                              <p
                                className="text-sm"
                                style={{ color: "rgba(248,245,240,.85)" }}
                              >
                                Sign out
                              </p>
                            </div>
                            <p
                              className="mt-2 text-[10px] leading-relaxed"
                              style={{ color: COLOR.textSubtle }}
                            >
                              End your session on this device.
                            </p>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* =====================================================
          COMPLETE MOBILE MENU
      ===================================================== */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={mobileSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pointer-events-auto fixed inset-0 z-[50] overflow-y-auto md:hidden"
            style={{
              background: "rgba(6, 26, 44, 0.995)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Sticky header */}
            <div
              className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b px-6 backdrop-blur-xl"
              style={{
                borderColor: COLOR.borderSoft,
                background: "rgba(6, 26, 44, 0.96)",
              }}
            >
              <Link
                href="/"
                onClick={() => closeOverlays()}
                className="flex items-center"
              >
                <Image
                  src="/image/team/reyhomes.png"
                  alt="ReyHomes"
                  width={180}
                  height={50}
                  className="h-9 w-auto object-contain"
                  style={{ maxWidth: "175px" }}
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border"
                style={{
                  borderColor: COLOR.borderSoft,
                  color: "rgba(248,245,240,.8)",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pb-12">
              {/* Search trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="mt-6 flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left text-sm"
                style={{
                  borderColor: COLOR.borderSoft,
                  background: "rgba(255,255,255,.04)",
                  color: "rgba(248,245,240,.45)",
                }}
              >
                <Search size={17} />
                Search ReyHomes
              </button>

              {/* Accordion sections */}
              {[
                { id: "designs", title: "Home Designs" },
                { id: "land", title: "Home & Land" },
                { id: "inclusions", title: "Inclusions" },
                { id: "about", title: "About" },
              ].map((section) => {
                const open = mobileSubmenu === section.id;
                return (
                  <div
                    key={section.id}
                    style={{ borderBottom: `1px solid ${COLOR.borderSoft}` }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setMobileSubmenu(open ? null : section.id)
                      }
                      className="flex w-full items-center justify-between py-6 text-left text-xl font-light"
                      style={{ color: "rgba(248,245,240,.9)" }}
                    >
                      {section.title}
                      <ChevronDown
                        size={18}
                        style={{
                          color: COLOR.cream,
                          transform: open ? "rotate(180deg)" : "none",
                          transition: "transform 300ms",
                        }}
                      />
                    </button>

                    <div
                      className="overflow-hidden transition-all duration-500"
                      style={{
                        maxHeight: open ? "1000px" : "0px",
                        opacity: open ? 1 : 0,
                      }}
                    >
                      <div className="pb-6 pl-4">
                        {section.id === "designs" && (
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => handleRoute("/home-designs")}
                              className="block py-2 text-sm"
                              style={{ color: "rgba(248,245,240,.7)" }}
                            >
                              All Designs
                            </button>
                            {DESIGN_CATEGORIES.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() =>
                                  handleRoute(
                                    `/home-designs?category=${encodeURIComponent(cat)}`
                                  )
                                }
                                className="block py-2 text-sm"
                                style={{ color: "rgba(248,245,240,.5)" }}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}

                        {section.id === "land" && (
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => handleRoute("/home-land")}
                              className="block py-2 text-sm"
                              style={{ color: "rgba(248,245,240,.7)" }}
                            >
                              All Packages
                            </button>
                            {homeLandPackages.slice(0, 8).map((pkg) => (
                              <button
                                key={pkg.id}
                                type="button"
                                onClick={() =>
                                  handleRoute(`/home-land/${asText(pkg.slug)}`)
                                }
                                className="block max-w-full truncate py-2 text-left text-sm"
                                style={{ color: "rgba(248,245,240,.5)" }}
                              >
                                {asText(pkg.title)}
                              </button>
                            ))}
                          </div>
                        )}

                        {section.id === "inclusions" && (
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => handleRoute("/inclusions")}
                              className="block py-2 text-sm"
                              style={{ color: "rgba(248,245,240,.7)" }}
                            >
                              All Inclusions
                            </button>
                            {inclusions.slice(0, 10).map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                disabled={!item.pdf_url}
                                onClick={() => {
                                  if (item.pdf_url) {
                                    openPdf(
                                      item.pdf_url,
                                      asText(item.title) || "Inclusion"
                                    );
                                  }
                                }}
                                className="flex w-full items-center justify-between py-2 text-left text-sm"
                                style={{
                                  color: "rgba(248,245,240,.5)",
                                  opacity: item.pdf_url ? 1 : 0.5,
                                }}
                              >
                                <span className="truncate pr-4">
                                  {asText(item.title)}
                                </span>
                                {item.pdf_url && (
                                  <FileText size={13} style={{ color: COLOR.cream }} />
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {section.id === "about" && (
                          <div className="space-y-1">
                            {[
                              ["Our Story", "/about"],
                              ["Process & Timeline", "/process-timeline"],
                              ["Knockdown & Rebuild", "/knockdown-rebuild"],
                              ["Testimonials", "/testimonials"],
                              ["Contact", "/contact"],
                            ].map(([label, href]) => (
                              <button
                                key={href}
                                type="button"
                                onClick={() => handleRoute(href)}
                                className="block py-2 text-sm"
                                style={{ color: "rgba(248,245,240,.5)" }}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bottom actions */}
              <div className="grid grid-cols-2 gap-3 pt-7">
                <button
                  type="button"
                  onClick={() => handleRoute("/wishlist")}
                  className="flex items-center justify-center gap-2 rounded-2xl border py-4 text-sm"
                  style={{
                    borderColor: COLOR.borderSoft,
                    color: "rgba(248,245,240,.75)",
                  }}
                >
                  <Heart size={16} color={COLOR.creamMuted} fill={wishlistCount > 0 ? COLOR.brass : "none"} />
                  Wishlist
                </button>
                <ThemeToggle
                  compact={false}
                  size={16}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border py-4"
                />
                <button
                  type="button"
                  onClick={() => handleRoute(user ? "/account" : "/login")}
                  className="flex items-center justify-center gap-2 rounded-2xl border py-4 text-sm"
                  style={{
                    borderColor: user ? "transparent" : COLOR.borderSoft,
                    background: user ? COLOR.brassGradient : "transparent",
                    color: user ? COLOR.brand : "rgba(248,245,240,.75)",
                  }}
                >
                  {user ? (
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background: "rgba(0,0,0,.12)" }}
                    >
                      {getInitials(user)}
                    </span>
                  ) : (
                    <User size={16} />
                  )}
                  {user ? "Account" : "Sign In"}
                </button>
              </div>

              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border py-4 text-sm"
                  style={{
                    borderColor: COLOR.borderSoft,
                    color: "rgba(248,245,240,.75)",
                  }}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              )}

              <button
                type="button"
                onClick={() => handleRoute("/enquire")}
                className="mt-4 w-full rounded-2xl py-4 text-sm font-semibold tracking-wide"
                style={{
                  background: COLOR.brassGradient,
                  color: COLOR.brand,
                }}
              >
                Begin Your Journey
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
      {/* PDF preview dialog */}
      <AnimatePresence>
        {activePdf && (
          <motion.div
            key="pdf-overlay"
            className="pointer-events-auto fixed inset-0 z-[50] flex items-center justify-center p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(6, 16, 28, 0.88)", backdropFilter: "blur(8px)" }}
            onClick={() => setActivePdf(null)}
            role="dialog"
            aria-modal="true"
            aria-label={activePdf.title}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex h-[min(88vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
              style={{
                background: "#0C2A44",
                borderColor: "rgba(248,245,240,0.16)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5"
                style={{ borderColor: "rgba(248,245,240,0.12)" }}
              >
                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium"
                    style={{ color: "#F8F5F0" }}
                  >
                    {activePdf.title}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(248,245,240,0.45)" }}>
                    PDF preview
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={activePdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{
                      background: "linear-gradient(135deg, #F5F0E6, #E8D9B8, #D8C7A4)",
                      color: "#0C2A44",
                    }}
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => setActivePdf(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border"
                    style={{
                      borderColor: "rgba(248,245,240,0.2)",
                      color: "#F8F5F0",
                    }}
                    aria-label="Close PDF"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="relative min-h-0 flex-1 bg-[#111]">
                <iframe
                  src={activePdf.url}
                  title={activePdf.title}
                  className="h-full w-full border-0"
                  style={{ minHeight: "70vh" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .nav-sweep {
          height: 1px;
          width: 28%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(248, 245, 240, 0.55),
            transparent
          );
          animation: navSweep 7s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes navSweep {
          0% {
            transform: translateX(-150%);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          50% {
            transform: translateX(420%);
            opacity: 1;
          }
          70% {
            opacity: 0;
          }
          100% {
            transform: translateX(420%);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .nav-sweep {
            animation: none;
          }
        }
      `}</style>

      {/* Search engine modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[9600] flex items-start justify-center px-4 pt-[12vh] pointer-events-auto">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close search"
            onClick={() => {
              setSearchOpen(false);
              setQuery("");
            }}
          />
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)]"
            style={{
              background:
                "linear-gradient(165deg, rgba(12,20,36,0.98) 0%, rgba(10,22,40,0.98) 100%)",
            }}
          >
            <div
              className="h-[2px] w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #D8C7A4 30%, #F5F0E6 50%, #D8C7A4 70%, transparent)",
              }}
            />
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <Search size={18} className="text-[#D8C7A4]" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search designs, packages, projects, inclusions…"
                className="flex-1 bg-transparent text-base text-[#F5F0E6] outline-none placeholder:text-white/35"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchOpen(false);
                    setQuery("");
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="rounded-full px-3 py-1 text-[10px] uppercase tracking-wider text-white/40 hover:text-white"
              >
                Esc
              </button>
            </div>
            <div className="max-h-[min(60vh,480px)] overflow-y-auto p-4">
              {!query.trim() && (
                <p className="px-2 py-6 text-center text-sm text-white/40">
                  Type to search across the ReyHomes catalogue
                </p>
              )}
              {searchResults && (
                <div className="space-y-5">
                  {[
                    {
                      key: "designs",
                      label: "Home designs",
                      href: (x: any) => `/home-designs/${x.slug}`,
                      title: (x: any) => asText(x.name),
                      meta: (x: any) =>
                        [x.beds && `${x.beds} bed`, x.price].filter(Boolean).join(" · "),
                    },
                    {
                      key: "packages",
                      label: "Home & land",
                      href: (x: any) => `/home-land/${x.slug}`,
                      title: (x: any) => asText(x.title),
                      meta: (x: any) =>
                        [x.suburb, x.price].filter(Boolean).join(" · "),
                    },
                    {
                      key: "projects",
                      label: "Projects",
                      href: (x: any) => `/projects/${x.slug}`,
                      title: (x: any) => asText(x.title),
                      meta: (x: any) =>
                        [x.location, x.status].filter(Boolean).join(" · "),
                    },
                    {
                      key: "inclusions",
                      label: "Inclusions",
                      href: (x: any) => `/inclusions`,
                      title: (x: any) => asText(x.title),
                      meta: (x: any) =>
                        [x.category, x.tier].filter(Boolean).join(" · "),
                    },
                  ].map((section) => {
                    const items = (searchResults as any)[section.key] || [];
                    if (!items.length) return null;
                    return (
                      <div key={section.key}>
                        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D8C7A4]">
                          {section.label}
                        </p>
                        <ul className="space-y-1">
                          {items.map((item: any) => (
                            <li key={item.id || item.slug || section.title(item)}>
                              <button
                                type="button"
                                onClick={() => {
                                  trackSearchEvent({
                                    event_type: "click",
                                    query: query.trim(),
                                    result_type: section.key,
                                    result_id: item.id || item.slug,
                                    result_label: section.title(item),
                                  });
                                  handleRoute(section.href(item));
                                  setSearchOpen(false);
                                  setQuery("");
                                }}
                                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5"
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-sm text-[#F5F0E6]">
                                    {section.title(item)}
                                  </span>
                                  {section.meta(item) ? (
                                    <span className="mt-0.5 block truncate text-[11px] text-white/40">
                                      {section.meta(item)}
                                    </span>
                                  ) : null}
                                </span>
                                <ArrowUpRight size={14} className="shrink-0 text-[#D8C7A4]/70" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                  {!searchResults.designs.length &&
                    !searchResults.packages.length &&
                    !(searchResults as any).projects?.length &&
                    !searchResults.inclusions.length && (
                      <p className="px-2 py-8 text-center text-sm text-white/45">
                        No matches for “{query}”
                      </p>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
