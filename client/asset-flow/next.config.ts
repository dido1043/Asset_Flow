import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Opt-in to turbopack to silence the mixed config warning.
  turbopack: {},

  // Keep webpack tweaks only when webpack is used (NEXT_TURBOPACK=0 or --webpack).
  webpack: (config) => {
    if (process.env.NEXT_TURBOPACK === "1") return config;

    // Reduce watcher load by ignoring heavy backend build outputs in the monorepo.
    config.watchOptions ??= {};
    const ignored = config.watchOptions.ignored ?? [];
    config.watchOptions.ignored = [
      ...ignored,
      "**/target/**",
      "**/protocols/**",
      "**/.git/**",
    ];
    return config;
  },
};

export default nextConfig;
