/** @type {import('next').NextConfig} */
const nextConfig = {
    // Add these settings if you're having WebSocket connection issues
  webpack: (config, { isServer, webpack }) => {
    // For handling WebSocket connections properly
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },
  // Enable strict mode if it wasn't already enabled
  reactStrictMode: true,
};

export default nextConfig;
