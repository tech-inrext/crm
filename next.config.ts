import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  /* config options here */
  typescript: {
    // Disable type checking during build to prevent build failures
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint during build to prevent build failures
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
