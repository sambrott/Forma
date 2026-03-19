import type { Metadata } from 'next'
import ToolCard from '@/components/ToolCard'
import { TOOLS, CATEGORIES, getToolsByCategory } from '@/lib/tools'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'All Tools — Free Online File Tools | Forma',
  description: 'Browse all free online tools: compress PDFs, convert images, extract audio, transcribe, and more. Private and instant.',
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

      {CATEGORIES.map(cat => {
        const tools = getToolsByCategory(cat)
        if (!tools.length) return null
        return (
          <section key={cat} className={styles.section}>
            <h2 className={styles.catLabel}>{cat}</h2>
            <div className={styles.grid}>
              {tools.map(tool => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        )
      })}

      <div id="ad-slot-tool" />
    </main>
  )
}
