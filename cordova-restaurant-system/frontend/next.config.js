/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/trails',
        destination: '/',
        permanent: true,
      },
      {
        source: '/recommendations',
        destination: '/#recommendations',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Vercel Services routes /api and /uploads before requests reach Next.js.
    // Keep rewrites for local development and the existing two-project deployment.
    const rawApi = process.env.BACKEND_URL
      || process.env.INTERNAL_API_URL
      || process.env.NEXT_PUBLIC_API_URL
      || (process.env.VERCEL ? null : 'http://localhost:4000');
    if (!rawApi) return [];
    const backendBase = rawApi.replace(/\/api\/?$/, '');
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendBase}/uploads/:path*`,
      },
      {
        source: '/api/uploads/:path*',
        destination: `${backendBase}/uploads/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
