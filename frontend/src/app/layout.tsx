/**
 * ReyHomes Root Layout
 */

import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

import LuxuryCursor from "@/components/common/LuxuryCursor";

import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";

import SiteChrome from "@/components/SiteChrome";

import { getDesigns } from "@/lib/api/designs";
import { getPackages } from "@/lib/api/packages";
import { getInclusions } from "@/lib/api/inclusions";
import { getProjects } from "@/lib/api/projects";
import { getSiteSettings } from "@/lib/api/settings";

const manrope = localFont({
  src: [
    { path: "./fonts/manrope.woff2", weight: "400", style: "normal" },
    { path: "./fonts/manrope-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/manrope-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/manrope-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-manrope",
  display: "swap",
});

const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cormorant-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/cormorant-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorant-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReyHomes | Luxury Homes & Land",
  description:
    "Bespoke house & land packages and luxury residences.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    designsResult,
    packagesResult,
    inclusionsResult,
    projectsResult,
    settingsResult,
  ] = await Promise.allSettled([
    getDesigns(),
    getPackages(),
    getInclusions(),
    getProjects(),
    getSiteSettings(),
  ]);

  const designs =
    designsResult.status === "fulfilled"
      ? designsResult.value
      : [];

  const packages =
    packagesResult.status === "fulfilled"
      ? packagesResult.value
      : [];

  const inclusions =
    inclusionsResult.status === "fulfilled"
      ? inclusionsResult.value
      : [];

  const projects =
    projectsResult.status === "fulfilled"
      ? projectsResult.value
      : [];

  const settings =
    settingsResult.status === "fulfilled"
      ? settingsResult.value
      : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${cormorant.variable} font-sans`}
    >
      <head>
        {/* Prevent theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme =
                    localStorage.getItem("reyhomes_theme");

                  if (
                    theme !== "light" &&
                    theme !== "dark"
                  ) {
                    theme =
                      window.matchMedia(
                        "(prefers-color-scheme: light)"
                      ).matches
                        ? "light"
                        : "dark";
                  }

                  document.documentElement.setAttribute(
                    "data-theme",
                    theme
                  );

                  document.documentElement.classList.remove(
                    "light",
                    "dark"
                  );

                  document.documentElement.classList.add(
                    theme
                  );
                } catch (error) {
                  document.documentElement.setAttribute(
                    "data-theme",
                    "dark"
                  );

                  document.documentElement.classList.remove(
                    "light",
                    "dark"
                  );

                  document.documentElement.classList.add(
                    "dark"
                  );
                }
              })();
            `,
          }}
        />
      </head>

      <body
        className="
          overflow-x-hidden
          bg-[var(--theme-bg,#07080a)]
          text-[var(--theme-fg,#fbf7e6)]
          font-sans
          antialiased
        "
      >
        <ThemeProvider>
          <AuthProvider>
            <WishlistProvider>
              <LuxuryCursor />

              <SiteChrome
                designs={designs}
                packages={packages}
                inclusions={inclusions}
        projects={projects}
                settings={settings}
              >
                {children}
              </SiteChrome>
            </WishlistProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}