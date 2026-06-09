import type { NextConfig } from "next";

const config: NextConfig = {
  eslint: {
    // Ignore ESLint during production builds — formatting issues in existing code.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Report TypeScript errors but don't block the build.
    ignoreBuildErrors: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
};

export default config;
