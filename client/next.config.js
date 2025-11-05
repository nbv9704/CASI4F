// client/next.config.js
/** @type {import('next').NextConfig} */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_BASE_URL.replace(/\/$/, '')}/api/:path*`,
      },
    ]
  },
}