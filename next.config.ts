import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverRuntimeConfig: {
    port: parseInt(process.env.PORT || "3000", 10),
  },
  env: {
    PORT: process.env.PORT || "3000",
  },
};

export default nextConfig;
