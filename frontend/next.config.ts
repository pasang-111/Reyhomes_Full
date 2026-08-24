
import type { NextConfig } from "next";

/**
 * The backend media host (Django /media/**) is derived from NEXT_PUBLIC_API_URL
 * so that production (Render, custom domain, etc.) is allowed automatically —
 * previously this only allowed 127.0.0.1:8000 / localhost:8000, which silently
 * broke every home-design, home & land, floorplan and inclusion image in any
 * deployed environment (Next/Image rejects any remote host not explicitly
 * whitelisted here; it does not error loudly, it just fails to load).
 */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const apiHost = (() => {
  try {
    return new URL(apiUrl);
  } catch {
    return new URL("http://127.0.0.1:8000");
  }
})();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Client-facing portal (was sometimes confused with staff CMS)
      { source: "/admin/clients", destination: "/pro/home", permanent: false },
      { source: "/admin/users", destination: "/pro/home", permanent: false },
      // Old Next.js staff CMS paths → staff gateway (Django Admin is the real CMS)
      { source: "/admin/home-designs", destination: "/admin", permanent: false },
      { source: "/admin/home-designs/:path*", destination: "/admin", permanent: false },
      { source: "/admin/packages", destination: "/admin", permanent: false },
      { source: "/admin/packages/:path*", destination: "/admin", permanent: false },
      { source: "/admin/hero", destination: "/admin", permanent: false },
      { source: "/admin/hero/:path*", destination: "/admin", permanent: false },
      { source: "/admin/inclusions", destination: "/admin", permanent: false },
      { source: "/admin/inclusions/:path*", destination: "/admin", permanent: false },
      { source: "/admin/testimonials", destination: "/admin", permanent: false },
      { source: "/admin/testimonials/:path*", destination: "/admin", permanent: false },
      { source: "/admin/settings", destination: "/admin", permanent: false },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Django media — derived from the configured API URL (works for local +
      // whatever NEXT_PUBLIC_API_URL is set to in each deploy environment).
      {
        protocol: apiHost.protocol.replace(":", "") as "http" | "https",
        hostname: apiHost.hostname,
        port: apiHost.port || undefined,
        pathname: "/media/**",
      },
      // Local dev fallbacks (always allowed regardless of NEXT_PUBLIC_API_URL)
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/media/**" },
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/media/**" },
      // Known production backend host(s) — add every real API domain here.
      { protocol: "https", hostname: "reyhomes-backend.onrender.com", pathname: "/media/**" },
      { protocol: "https", hostname: "reyhomes-backend-nx6h.onrender.com", pathname: "/media/**" },
      { protocol: "https", hostname: "*.onrender.com", pathname: "/media/**" },

      // S3-compatible media hosts (Cloudflare R2 / AWS S3 / custom CDN).
      // After you create the bucket, ADD your real public hostname here, e.g.:
      //   { protocol: "https", hostname: "pub-xxxxxxxx.r2.dev", pathname: "/**" },
      //   { protocol: "https", hostname: "media.yourdomain.com", pathname: "/**" },
      //   { protocol: "https", hostname: "reyhomes-media.s3.ap-southeast-2.amazonaws.com", pathname: "/**" },
      // Wildcard for any r2.dev public bucket subdomain:
      { protocol: "https", hostname: "*.vercel.app", pathname: "/**" },
      { protocol: "https", hostname: "*.r2.dev", pathname: "/**" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com", pathname: "/**" },
      { protocol: "https", hostname: "*.s3.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "*.s3.ap-southeast-2.amazonaws.com", pathname: "/**" },

      // Unsplash (placeholder imagery)
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
      // Cloudinary delivery
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;

