/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],
  images: {
    unoptimized: true, // Allows serving local archive images cleanly without external loader issues
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
