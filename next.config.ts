import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  turbopack: {
    resolveAlias: {
      "@prisma/client": "./lib/generated/prisma",
    },
  },
};

export default nextConfig;
