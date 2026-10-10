/** @type {import('next').NextConfig} */
const nextConfig = {
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
    // BACKEND_URL is a server-only setting for the deployed API project.
    if (process.env.VERCEL && !process.env.BACKEND_URL) {
      throw new Error('BACKEND_URL must be set to the deployed backend URL.');
    }
    const rawApi = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
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
