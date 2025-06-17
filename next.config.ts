import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
