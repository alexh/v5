/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Allow importing JSON files
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json'
    })
    return config
  }
}

module.exports = nextConfig 