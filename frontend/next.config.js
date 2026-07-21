/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['maplibre-gl'],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
