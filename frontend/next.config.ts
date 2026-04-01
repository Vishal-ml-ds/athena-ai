import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from Supabase Storage and other CDNs
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // Expose only public env vars to the browser bundle
  // All NEXT_PUBLIC_* vars are auto-included; this just documents them
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  },
};

export default nextConfig;
