import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**",
      },
      // Production: add your domain here, e.g.:
      // { protocol: "https", hostname: "api.cafedelrey.bo", pathname: "/uploads/**" }
    ],
  },
};

export default nextConfig;
