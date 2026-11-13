import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // Put each page's CSS inside the HTML: no extra round trip before the first paint (part of the 100 mobile Lighthouse score).
  experimental: { inlineCss: true },
  // This repo is its own root (a stray package-lock.json in the home folder made Next.js guess otherwise).
  turbopack: { root: __dirname },
};

export default nextConfig;
