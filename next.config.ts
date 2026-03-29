import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better dev-time warnings
  reactStrictMode: true,


  // Allow images from Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vwdgzyknnoslungagmhx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Zerodha/NSE standard instrument image CDN (logos, charts)
      {
        protocol: "https",
        hostname: "**.zerodha.com",
      },
    ],
  },

  // Headers for security hardening (prod + dev)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Prevent caching of auth/API routes
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },

  // Enforce HTTPS redirects only in production
  async redirects() {
    return [];
  },
};

export default nextConfig;
