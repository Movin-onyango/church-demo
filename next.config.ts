import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Required for Cloudflare Pages static hosting
  images: {
    unoptimized: true, // Required for static export
  },
  // Explicitly disable Cache Components to allow export mode
  cacheComponents: false,
};

export default nextConfig;
