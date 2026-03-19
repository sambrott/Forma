/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'fluent-ffmpeg', 'ffmpeg-static', '@imgly/background-removal-node'],
  },
}

const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
]

if (process.env.NODE_ENV !== 'test') {
  requiredEnvVars.forEach((key) => {
    if (!process.env[key] && process.env.VERCEL_ENV === 'production') {
      console.warn(`Warning: Environment variable ${key} is not set`)
    }
  })
}

export default nextConfig
