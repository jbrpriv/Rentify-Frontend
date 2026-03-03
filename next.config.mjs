/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://16.171.57.16:5000/api/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;