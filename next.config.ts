import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: ["192.168.0.107"],
};

export default nextConfig;
