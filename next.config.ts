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
};

export default nextConfig;
