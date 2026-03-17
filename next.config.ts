import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tornometalevertonlopes.com.br",
      },
      {
        protocol: "https",
        hostname: "lozduuvplbfiduaigjth.supabase.co",
      },
    ],
  },
};

export default nextConfig;
