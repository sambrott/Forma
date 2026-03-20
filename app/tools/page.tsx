'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ToolCard from '@/components/ToolCard'
import { ToolTabs } from '@/components/ToolTabs'
import { TOOLS } from '@/lib/tools'
import styles from './page.module.css'

function ToolsContent() {
  const searchParams = useSearchParams()
  const active = searchParams.get('cat') ?? 'All'

  const filtered = active === 'All'
    ? TOOLS
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
