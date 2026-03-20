'use client'

import Link from 'next/link'
import PrivacyNote from './PrivacyNote'
import styles from './ToolPageLayout.module.css'

interface ToolPageLayoutProps {
  title: string
  description: string
  children: React.ReactNode
}

export default function ToolPageLayout({ title, description, children }: ToolPageLayoutProps) {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Link href="/tools" className={styles.backLink}>
          <span className={styles.backChevron} aria-hidden>
            <svg width="9" height="14" viewBox="0 0 8 14" fill="none">
              <path
                d="M6 1L1 7l5 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>All tools</span>
        </Link>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.desc}>{description}</p>
      </div>
      <div className={styles.stack}>
        {children}
        <PrivacyNote />
      </div>
      <div id="ad-slot-tool" />
    </main>
  )
}
