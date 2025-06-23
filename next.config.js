// 4. Corriger next.config.js
/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/components/chat': path.resolve(__dirname, './src/components/chat'),
    };
    return config;
  },
};

module.exports = nextConfig;
