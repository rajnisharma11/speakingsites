import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: `output: "export"` was removed — this app has dynamic API route
  // handlers that hold server-only secrets (LiveAvatar token minting, the
  // backend embed key) and must run on a Node server, which a pure static
  // export cannot do. Deployed via @netlify/plugin-nextjs (SSR).
  trailingSlash: true,
  allowedDevOrigins: ["192.168.1.15"],
  images: { unoptimized: true },
};

export default nextConfig;
