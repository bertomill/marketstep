/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['firebase'],
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig; 