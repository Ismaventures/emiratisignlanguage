/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'models.readyplayer.me',
      },
    ],
  },
};

module.exports = nextConfig;
