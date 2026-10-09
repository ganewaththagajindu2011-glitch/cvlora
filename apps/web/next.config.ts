import type { NextConfig } from 'next';
const config: NextConfig = {
  output: 'standalone',
  experimental: { inlineCss: process.env.NODE_ENV === 'production' },
  transpilePackages: ['@cvlora/shared', '@cvlora/ui', '@cvlora/templates'],
  poweredByHeader: false,
};
export default config;
