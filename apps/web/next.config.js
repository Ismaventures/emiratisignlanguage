/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@emirsign/types', '@emirsign/utils', '@emirsign/config', '@emirsign/validators'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.emirsign.ai',
      },
    ],
  },
};

module.exports = nextConfig;
