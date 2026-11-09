import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep development startup from creating or rewriting repository agent instructions.
  agentRules: false,
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  transpilePackages: ["lucide-react"],
  images: {
    unoptimized: true, // Allows serving local archive images cleanly without external loader issues
  },
  async redirects() {
    return [
      { source: "/our-story", destination: "/about", permanent: true },
      { source: "/menu", destination: "/cafe", permanent: true },
      { source: "/programming", destination: "/events", permanent: true },
      { source: "/archive", destination: "/gallery", permanent: true },
      { source: "/facilities", destination: "/about#facilities", permanent: true },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disabling persistent filesystem caching in dev prevents ENOENT vendor-chunk conflicts
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
