import type { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'About & Privacy | Forma',
  description: 'Forma is a free file tool suite. We delete files immediately, collect zero personal data, and never require an account.',
}

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className="eyebrow">
          <div className="eyebrow-dot" />
          <div className="eyebrow-text">About</div>
        </div>
        <h1 className={styles.title}>Built for utility, not data</h1>
      </div>

      <div className={styles.body}>
        <p>
          Forma is a free suite of professional file and document tools. Compress PDFs,
          convert images, extract audio, transcribe recordings, and more, without creating
          an account, handing over personal data, or watching ads take over your screen.
        </p>

        <h2 className={styles.sectionTitle}>How it works</h2>
        <p>
          Upload a file. It&apos;s processed in a secure, isolated environment. Download your
          result. The original and the output are both permanently deleted the moment the
          download completes. Nothing is logged, stored, or shared.
        </p>

        <h2 className={styles.sectionTitle}>Privacy</h2>
        <div className={styles.cards}>
          <div className="info-card">
            <div className="info-card-label">Files</div>
            <p>Uploaded files are stored in memory during processing and permanently deleted the moment your download is complete.</p>
          </div>
          <div className="info-card">
            <div className="info-card-label">Analytics</div>
            <p>We use Plausible Analytics (privacy-first, no cookies, no cross-site tracking). We see page views and tool usage counts only.</p>
          </div>
          <div className="info-card">
            <div className="info-card-label">AI tools</div>
            <p>When you use AI-powered tools, your file content is sent to the AI provider for processing only. It is not stored or used for training.</p>
          </div>
          <div className="info-card">
            <div className="info-card-label">Payments</div>
            <p>Pro subscriptions are handled by Stripe. We never see or store your card details. You can cancel at any time.</p>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Open about limitations</h2>
        <p>
          Free tier is limited to 100 MB per file. Pro raises the cap to 2 GB and adds batch processing.
        </p>
        <p>
          Some tools (video trimming, audio extraction) depend on server-side processing
          power. Very large files may take longer. We don&apos;t artificially slow down
          free users.
        </p>
      </div>
    </main>
  )
}
