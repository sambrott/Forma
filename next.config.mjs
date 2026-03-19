/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'sharp',
      'fluent-ffmpeg',
      '@ffmpeg-installer/ffmpeg',
      'pdf-lib',
      'pdf-parse',
    ],
  },
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
