/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable static generation - force dynamic rendering
  output: 'standalone',
}

module.exports = nextConfig
