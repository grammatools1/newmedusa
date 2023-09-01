/** @type {import('next').NextConfig} */

const { withStoreConfig } = require("./store-config")

module.exports = withStoreConfig({
  eslint: {
    // Disabling on production builds because we're running checks on PRs via GitHub Actions.
    ignoreDuringBuilds: true
  },
  experimental: {
    serverActions: true
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'medusa-server-testing.s3.amazonaws.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'https://minio.stylishslacks.cfd',
        pathname: '/**'
      }
    ]
  },
})
