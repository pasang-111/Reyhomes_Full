"use client";

import type { CSSProperties } from "react";

export type LogoVariant = "dark" | "light";
export type LogoLayout = "full" | "mark";

type BrandLogoProps = {
  /** dark = navy on light surfaces; light = cream on dark surfaces */
  variant?: LogoVariant;
  /** full wordmark or icon mark only */
  layout?: LogoLayout;
  className?: string;
  style?: CSSProperties;
  /** Accessible title */
  title?: string;
  /** Height in px (width scales). Default 36 full / 32 mark */
  height?: number;
};

const NAVY = "#0A1628";
const CREAM = "#F5F0E6";

/** Stylised R inside a soft hex shield — matches brand mark */
function MarkPath({ fill }: { fill: string }) {
  return (
    <path
      fill={fill}
      fillRule="evenodd"
      d="
        M50.2 4.2
        C72.5 2.1 92.8 11.4 102.6 30.8
        L110.4 45.6
        C116.2 57.2 114.4 71.5 105.2 81.8
        L84.6 104.2
        C74.2 115.4 57.4 118.2 44.8 111.6
        C32.2 105 24.6 89.8 25.4 74.2
        L27.6 28.4
        C28.6 16.2 37.8 6.2 50.2 4.2
        Z
        M42 28
        L42 96
        L54.5 96
        L54.5 66
        L72 96
        L87.5 96
        L65.5 62
        C78 58.5 84.5 49.5 84.5 38.5
        C84.5 24.5 74 18.5 57 18.5
        L42 18.5
        Z
        M54.5 31
        L59.5 31
        C68.5 31 73 34.5 73 40.5
        C73 46.5 68.5 50 59.5 50
        L54.5 50
        Z
      "
    />
  );
}

function Wordmark({ fill, x = 128 }: { fill: string; x?: number }) {
  return (
    <g fill={fill} fontFamily="Georgia, 'Times New Roman', Times, serif">
      <text
        x={x}
        y={58}
        fontSize={42}
        fontWeight={600}
        letterSpacing="0.08em"
      >
        REY
      </text>
      <text
        x={x}
        y={102}
        fontSize={32}
        fontWeight={500}
        letterSpacing="0.34em"
      >
        HOMES
      </text>
    </g>
  );
}

/**
 * ReyHomes brand logo — white/cream (light) and navy (dark) variants.
 *
 * Use `variant="dark"` on cream/white backgrounds.
 * Use `variant="light"` on navy/black backgrounds.
 */
export default function BrandLogo({
  variant = "dark",
  layout = "full",
  className = "",
  style,
  title = "ReyHomes",
  height,
}: BrandLogoProps) {
  const fill = variant === "light" ? CREAM : NAVY;
  const h = height ?? (layout === "mark" ? 32 : 36);
  const viewBox = layout === "mark" ? "0 0 120 120" : "0 0 360 120";
  const aspect = layout === "mark" ? 1 : 360 / 120;
  const w = h * aspect;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={w}
      height={h}
      className={className}
      style={style}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {layout === "mark" ? (
        <g transform="translate(0,0) scale(1)">
          <MarkPath fill={fill} />
        </g>
      ) : (
        <>
          <g transform="translate(0,0)">
            <MarkPath fill={fill} />
          </g>
          <Wordmark fill={fill} />
        </>
      )}
    </svg>
  );
}

/** Paths for static asset usage / next/image */
export const BRAND_LOGO = {
  dark: "/brand/reyhomes-logo-dark.svg",
  light: "/brand/reyhomes-logo-light.svg",
  markDark: "/brand/reyhomes-mark-dark.svg",
  markLight: "/brand/reyhomes-mark-light.svg",
} as const;
