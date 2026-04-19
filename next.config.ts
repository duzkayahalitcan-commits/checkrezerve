import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker / Railway / VPS için standalone çıktı
  output: "standalone",

  async headers() {
    return [
      {
        // HTML pages — always revalidate, never serve stale from CDN
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        // Static assets — cache aggressively (content-hashed filenames)
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
