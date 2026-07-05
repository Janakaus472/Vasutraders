import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.imimg.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "vasutraders.com",
      },
    ],
  },

  async redirects() {
    return [
      // Redirect non-www to www (fixes duplicate canonical issue)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'vasutraders.com' }],
        destination: 'https://www.vasutraders.com/:path*',
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      // Prevent Vercel preview URL from being indexed by Google
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'vasu-traders-v2.vercel.app' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
};

export default nextConfig;
