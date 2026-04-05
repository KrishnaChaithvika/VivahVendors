import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
  serverExternalPackages: ["@prisma/client", ".prisma"],
};

export default nextConfig;
