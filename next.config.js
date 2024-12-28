/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['your-domain.netlify.app'],
  },
}

module.exports = nextConfig 