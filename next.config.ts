import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Permitir solicitudes desde el panel de vista previa
  allowedDevOrigins: [
    'preview-chat-3eb0c6bf-6431-4113-bf02-549173ed41dd.space.z.ai',
    '.space.z.ai',
    'localhost',
  ],
};

export default nextConfig;
