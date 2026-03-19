'use client'

import { useRouter } from 'next/navigation'
import HeadlineAnimation from '@/components/HeadlineAnimation'
import TrustBar from '@/components/TrustBar'
import ToolDrop from '@/components/ToolDrop'
import ToolRow from '@/components/ToolRow'
import { FEATURED_TOOLS } from '@/lib/tools'
import { setPendingFile } from '@/lib/pending-file'
import styles from './page.module.css'

const EXT_MAP: Record<string, string> = {
  pdf: 'compress-pdf',
  jpg: 'convert-image', jpeg: 'convert-image', png: 'convert-image',
  webp: 'convert-image', heic: 'convert-image', avif: 'convert-image',
  mp4: 'extract-audio', mov: 'extract-audio', avi: 'extract-audio',
  mp3: 'transcribe-audio', wav: 'transcribe-audio', m4a: 'transcribe-audio',
  json: 'json-formatter',
}

export default function HomePage() {
  const router = useRouter()

  function handleFiles(files: File[]) {
    const file = files[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const tool = EXT_MAP[ext] || 'compress-pdf'
    setPendingFile(file)
    router.push(`/tools/${tool}`)
  }

  return (
    <main className={styles.main}>
      <div className={styles.heroLeft}>
        <div className="eyebrow">
          <div className="eyebrow-dot" />
          <div className="eyebrow-text">Private · Free · No account required</div>
        </div>
        <HeadlineAnimation />
        <p className={styles.heroSub}>
          Document, image, and media tools built for people who know what they need.
          Files deleted the moment you&apos;re done.
        </p>
        <TrustBar />
      </div>

      <div className={styles.heroRight}>
        <ToolDrop onFiles={handleFiles} />
        <div className={styles.toolsPanel}>
          <div className={styles.toolsHeader}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>
              Popular tools
            </span>
            <a href="/tools" className="btn btn-ghost btn-sm">View all →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {FEATURED_TOOLS.map(tool => (
              <ToolRow key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
