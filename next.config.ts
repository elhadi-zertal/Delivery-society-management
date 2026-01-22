import type { NextConfig } from "next";
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // @ts-ignore - Turbopack is enabled by default in Next.js 15+, 
  // but next-pwa requires webpack. This silences the conflict error.
  turbopack: {},
};

export default withPWA(nextConfig);
