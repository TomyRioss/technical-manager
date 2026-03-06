import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverBodySizeLimit: "50mb",
  },
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  turbopack: {
    resolveAlias: {
      "@prisma/client": "./lib/generated/prisma",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default nextConfig;
