'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ToolCard from '@/components/ToolCard'
import { TOOLS } from '@/lib/tools'
import styles from './page.module.css'

const FILTER_CATEGORIES = ['All', 'PDF', 'AI', 'Image', 'Audio', 'Video', 'Dev'] as const

function ToolsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const active = searchParams.get('cat') ?? 'All'

  const filtered = active === 'All'
    ? TOOLS
    : TOOLS.filter(t => t.cat === active)

  function setCategory(cat: string) {
    const params = new URLSearchParams(searchParams)
    if (cat === 'All') params.delete('cat')
    else params.set('cat', cat)
    router.push(`/tools?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      <div className={styles.tabBar}>
        {FILTER_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${styles.tab} ${active === cat ? styles.tabActive : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.map(tool => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </>
  )
}

export default function ToolsPage() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className="eyebrow">
          <div className="eyebrow-dot" />
          <div className="eyebrow-text">All tools</div>
        </div>
        <h1 className={styles.title}>Every tool, one place</h1>
        <p className={styles.subtitle}>
          File conversion, compression, AI extraction, and developer utilities — all free and private.
        </p>
      </div>

      <Suspense fallback={<div className={styles.grid} />}>
        <ToolsContent />
      </Suspense>
    </main>
  )
}
