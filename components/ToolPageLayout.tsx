'use client'

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
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.desc}>{description}</p>
      </div>
      {children}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <PrivacyNote />
      </div>
      <div id="ad-slot-tool" />
    </main>
  )
}
