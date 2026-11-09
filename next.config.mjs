/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
