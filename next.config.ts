import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    typedEnv: true,
  },
  typedRoutes: true,
  poweredByHeader: false,
  output: 'standalone',
  transpilePackages: ['@t3-oss/env-nextjs', '@t3-oss/env-core'],
  generateBuildId: () => {
    if (
      process.env.NEXT_PUBLIC_APP_VERSION === undefined ||
      process.env.NEXT_PUBLIC_APP_VERSION.trim() === ''
    ) {
      throw new Error('NEXT_PUBLIC_APP_VERSION is not defined');
    }

    return process.env.NEXT_PUBLIC_APP_VERSION;
  },
};

export default nextConfig;
