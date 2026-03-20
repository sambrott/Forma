import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Script from 'next/script'
import { Suspense } from 'react'
import Nav from '@/components/Nav'
import IntroAnimation from '@/components/IntroAnimation'
import { PageTransition } from '@/components/PageTransition'
import { PostHogProvider } from '@/components/PostHogProvider'
import { PostHogPageView } from '@/components/PostHogPageView'
import './globals.css'

export const metadata: Metadata = {
  title: 'Forma | Free Professional File & Document Tools',
  description: 'Compress PDFs, convert images, extract audio, summarise documents: all free, private, and instant. Files deleted immediately.',
  openGraph: {
    title: 'Forma | Free Professional File & Document Tools',
    description: 'Compress PDFs, convert images, extract audio, summarise documents: all free, private, and instant.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200;0,9..144,300;0,9..144,400;1,9..144,200;1,9..144,300;1,9..144,400&display=swap"
          rel="stylesheet"
        />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <IntroAnimation />
          <Nav />
          <PageTransition>
            {children}
          </PageTransition>
        </PostHogProvider>
      </body>
    </html>
  )
}
