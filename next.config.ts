import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignorar erros de ESLint durante o build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros de TypeScript durante o build (apenas para deploy)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
