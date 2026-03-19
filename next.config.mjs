/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'fluent-ffmpeg', 'ffmpeg-static', '@imgly/background-removal-node'],
  },
}

export default nextConfig
