import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        "pg-native": false,
      };
    }
    return config;
  },
  serverExternalPackages: ["pg", "drizzle-orm"],
  turbopack: {
    resolveExtensions: [".js", ".jsx", ".ts", ".tsx"],
  },
};

export default nextConfig;
