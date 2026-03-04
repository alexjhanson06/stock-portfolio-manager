import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling yahoo-finance2 into the server bundle.
  // When bundled, Next.js patches globalThis.fetch with a caching layer that
  // breaks yahoo-finance2's crumb/cookie authentication flow.
  // Keeping it external ensures it uses native Node.js fetch.
  serverExternalPackages: ["yahoo-finance2"],
};

export default nextConfig;
