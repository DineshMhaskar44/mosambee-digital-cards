import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  serverExternalPackages: ["qrcode"],
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
