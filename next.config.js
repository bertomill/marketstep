/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['firebase'],
  webpack: (config) => {
    return config;
  },
  images: {
    domains: ['logo.clearbit.com', 'ui-avatars.com'],
  },
};

module.exports = nextConfig; 