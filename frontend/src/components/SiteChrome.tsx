"use client";

import type {
  ErrorInfo,
  ReactNode,
} from "react";

import {
  Component,
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/common/Footer";
import Transition from "@/app/transition";

import {
  AuthToast,
} from "@/components/ui/AuthEffects";

import CinematicWelcome from "@/components/ui/CinematicWelcome";

import {
  RouteTransitionLoader,
} from "@/components/ui/CinematicLoader";

import LuxuryScroll, { ScrollProgress } from "@/components/ui/LuxuryScroll";

import {
  useAuth,
} from "@/context/AuthContext";

import type {
  HomeDesignListItem,
} from "@/types/home";

import type {
  HomeLandPackageListItem,
} from "@/types/land";

import type {
  Inclusion,
} from "@/lib/api/inclusions";

import type {
  SiteSettings,
} from "@/lib/api/settings";

type SiteChromeProps = {
  children: ReactNode;
  designs?: HomeDesignListItem[] | null;
  packages?: HomeLandPackageListItem[] | null;
  inclusions?: Inclusion[] | null;
  projects?: any[] | null;
  settings?: SiteSettings | null;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  label?: string;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ChromeErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(
    props: ErrorBoundaryProps
  ) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(
    error: Error,
    info: ErrorInfo
  ) {
    console.error(
      `[ReyHomes] ${
        this.props.label ??
        "Component"
      } crashed:`,
      error
    );

    console.error(
      "[ReyHomes] Component stack:",
      info.componentStack
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            data-error-boundary={
              this.props.label
            }
            className="hidden"
          />
        )
      );
    }

    return this.props.children;
  }
}

function AuthToasts() {
  const {
    authEvent,
    clearAuthEvent,
  } = useAuth();

  const [
    localToast,
    setLocalToast,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    try {
      const message =
        sessionStorage.getItem(
          "auth_toast"
        );

      if (message) {
        setLocalToast(message);

        sessionStorage.removeItem(
          "auth_toast"
        );
      }
    } catch {
      // Ignore storage errors.
    }
  }, []);

  return (
    <AuthToast
      message={
        authEvent?.message ??
        localToast
      }
      onDone={() => {
        clearAuthEvent();
        setLocalToast(null);
      }}
      colors={{
        bg: "rgba(8, 32, 54, 0.97)",
        border:
          "rgba(248, 245, 240, 0.16)",
        text: "#F8F5F0",
      }}
    />
  );
}

function MainSiteEffects() {
  return (
    <>
      <ChromeErrorBoundary label="AuthToasts">
        <AuthToasts />
      </ChromeErrorBoundary>

      <ChromeErrorBoundary label="LuxuryScroll">
        <LuxuryScroll />
      </ChromeErrorBoundary>

      <ChromeErrorBoundary label="ScrollProgress">
        <ScrollProgress />
      </ChromeErrorBoundary>


      <ChromeErrorBoundary label="CinematicWelcome">
        <CinematicWelcome
          logoSrc="/image/team/reyhomes.png"
          enableFirstVisit
        />
      </ChromeErrorBoundary>

      <ChromeErrorBoundary label="RouteTransitionLoader">
        <RouteTransitionLoader
          logoSrc="/image/team/reyhomes.png"
          minDuration={480}
          includeOnly
          includePaths={[
            "/",
            "/account",
            "/projects",
            "/process-timeline",
          ]}
          excludePaths={[
            "/login",
            "/register",
            "/pro",
          ]}
        />
      </ChromeErrorBoundary>
    </>
  );
}

export default function SiteChrome({
  children,
  designs = [],
  packages = [],
  inclusions = [],
  projects = [],
}: SiteChromeProps) {
  const pathname =
    usePathname() ?? "";

  const safeDesigns =
    Array.isArray(designs)
      ? designs
      : [];

  const safePackages =
    Array.isArray(packages)
      ? packages
      : [];

  const safeInclusions =
    Array.isArray(inclusions)
      ? inclusions
      : [];

  const safeProjects =
    Array.isArray(projects)
      ? projects
      : [];

  /**
   * Chrome policy (Phase 1c):
   * - Public Navbar + Footer on every route except:
   *   - /login, /register → bare (AuthToasts only)
   *   - /pro/* → ProShell owns sticky header + portal nav (no double navbar)
   * - /forgot-password, /account, marketing pages → full public chrome
   * - Next.js /admin removed; Django Unfold lives on the API host
   * RouteTransitionLoader skips /login, /register, /pro so portal/auth
   * don't fight the cinematic page wipe; /forgot-password keeps the transition.
   */
  const isPro = pathname.startsWith("/pro");

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  if (isPro) {
    return <>{children}</>;
  }

  if (isAuthPage) {
    return (
      <>
        <ChromeErrorBoundary label="AuthToasts">
          <AuthToasts />
        </ChromeErrorBoundary>

        {children}
      </>
    );
  }

  return (
    <div
      id="reyhomes-site"
      className="relative min-h-screen overflow-visible"
    >
      <ChromeErrorBoundary
        label="MainSiteEffects"
        fallback={null}
      >
        <MainSiteEffects />
      </ChromeErrorBoundary>

      {/* Single fixed stacking context for all nav chrome (bar + mobile + modals).
          z-[9100] sits above page content (0–100) and below cinematic intro (10000). */}
      <div
        id="reyhomes-navbar-layer"
        className="pointer-events-none fixed inset-x-0 top-0 z-[9100]"
      >
        <ChromeErrorBoundary
          label="Navbar"
          fallback={null}
        >
          <Navbar
            designs={safeDesigns}
            packages={safePackages}
            inclusions={safeInclusions}
            projects={safeProjects}
          />
        </ChromeErrorBoundary>
      </div>

      <main
        id="reyhomes-main-content"
        className="relative z-0 min-h-screen overflow-visible"
      >
        <ChromeErrorBoundary
          label="PageContent"
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center bg-[#07080A] px-6 text-[#F8F5F0]">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                  ReyHomes
                </p>

                <h1 className="mt-4 text-2xl font-medium">
                  Something went wrong
                </h1>

                <p className="mt-3 text-sm text-white/50">
                  Please refresh the page
                  and try again.
                </p>
              </div>
            </div>
          }
        >
          <Transition>
            {children}
          </Transition>
        </ChromeErrorBoundary>
      </main>

      <div
        id="reyhomes-footer-layer"
        className="relative z-[1]"
        style={{
          isolation: "isolate",
        }}
      >
        <ChromeErrorBoundary
          label="Footer"
          fallback={null}
        >
          <Footer />
        </ChromeErrorBoundary>
      </div>
    </div>
  );
}