/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    'sharp',
    'fluent-ffmpeg',
    '@ffmpeg-installer/ffmpeg',
    'pdf-lib',
    'pdf-parse',
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        'sharp',
        'fluent-ffmpeg',
        '@ffmpeg-installer/ffmpeg',
      ]
    }
    return config
  },
}

export default nextConfig
