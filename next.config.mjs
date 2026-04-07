/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'sharp',
      'fluent-ffmpeg',
      '@ffmpeg-installer/ffmpeg',
      'pdf-lib',
      'pdf-parse',
      'heic-convert',
      'heic-decode',
      'libheif-js',
    ],
  },
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
