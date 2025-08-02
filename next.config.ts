import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow iframe embedding from any origin
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://localhost:* https://localhost:* https://*.mobrule.ai https://mobrule.ai"
          }
        ],
      },
    ]
  },
  // Allow cross-origin requests in development
  allowedDevOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003']
};

export default nextConfig;
