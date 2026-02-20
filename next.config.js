/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disabled standalone mode to reduce memory usage
  // output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
