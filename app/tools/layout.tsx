import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Tools — Free Online File Tools | Forma',
  description: 'Browse all free online tools: compress PDFs, convert images, extract audio, transcribe, and more. Private and instant.',
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
