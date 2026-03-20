'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ToolCard from '@/components/ToolCard'
import { ToolTabs } from '@/components/ToolTabs'
import { TOOLS } from '@/lib/tools'
import styles from './page.module.css'

function normalizeToolCat(cat: string | null) {
  if (!cat || cat === 'All') return 'All'
  if (cat === 'Audio' || cat === 'Video') return 'Media'
  return cat
}

function ToolsContent() {
  const searchParams = useSearchParams()
  const active = normalizeToolCat(searchParams.get('cat'))

  const filtered =
    active === 'All'
      ? TOOLS
      : active === 'Media'
        ? TOOLS.filter(t => t.cat === 'Audio' || t.cat === 'Video')
        : TOOLS.filter(t => t.cat === active)

  return (
    <>
      <ToolTabs />
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
          File conversion, compression, AI extraction, and developer utilities: all free and private.
        </p>
      </div>

      <Suspense fallback={<div className={styles.grid} />}>
        <ToolsContent />
      </Suspense>
    </main>
  )
}
