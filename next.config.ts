import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tornometalevertonlopes.com.br",
      },
    ],
  },
};

export default nextConfig;
