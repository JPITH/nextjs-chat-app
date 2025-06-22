/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
  },
}

module.exports = nextConfig