import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.15"],
  images: { unoptimized: true },
};

export default nextConfig;