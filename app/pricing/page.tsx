import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Pricing — Forma Pro | Unlimited AI Tools',
  description: 'Forma is free forever. Go Pro for unlimited AI uses, 2 GB uploads, and batch processing. $9/month or $79/year.',
}

const CHECK = <svg viewBox="0 0 8 8"><polyline points="1,4 3.5,6.5 7,1.5"/></svg>

export default function PricingPage() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className="eyebrow">
          <div className="eyebrow-dot" />
          <div className="eyebrow-text">Pricing</div>
        </div>
        <h1 className={styles.title}>Simple, honest pricing</h1>
        <p className={styles.subtitle}>
          Most tools are free with no limits. Pro unlocks AI features, larger files, and batch processing.
        </p>
      </div>

      <div className={styles.grid}>
        <div className="pricing-card">
          <div className="pricing-tier">Free</div>
          <div className="pricing-price">$0</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Forever · No credit card</div>
          <ul className="feature-list">
            <li>{CHECK}All PDF tools</li>
            <li>{CHECK}Image conversion</li>
            <li>{CHECK}Developer tools</li>
            <li>{CHECK}3 AI uses per day</li>
            <li className="dim">{CHECK}Up to 100 MB per file</li>
          </ul>
          <div style={{ marginTop: 20 }}>
            <Link href="/tools" className="btn btn-ghost btn-full">Start free</Link>
          </div>
        </div>

        <div className="pricing-card featured">
          <div className="pricing-tier" style={{ color: 'var(--accent)' }}>Pro</div>
          <div className="pricing-price">$9 <span className="period">/ mo</span></div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>or $79/year · cancel anytime</div>
          <ul className="feature-list">
            <li>{CHECK}Everything in Free</li>
            <li>{CHECK}Unlimited AI uses</li>
            <li>{CHECK}Up to 2 GB per file</li>
            <li>{CHECK}Batch processing (50 files)</li>
            <li>{CHECK}320 kbps audio export</li>
            <li>{CHECK}Priority processing</li>
          </ul>
          <div style={{ marginTop: 20 }}>
            <Link href="/api/stripe/checkout" className="btn btn-primary btn-full">Get Pro</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
