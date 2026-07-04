/** @type {import('next').NextConfig} */
const nextConfig = {
  // "standalone" requires symlink support — works on Linux (Docker/CI) but
  // fails on Windows without Developer Mode. Only enable it in Docker builds.
  ...(process.env.DOCKER_BUILD === "true" && { output: "standalone" }),

  // Expose server-only env vars to the Edge middleware runtime
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "",
  },

  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "graph.instagram.com" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
      { protocol: "https", hostname: "**.r2.dev" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https: wss:;"
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
