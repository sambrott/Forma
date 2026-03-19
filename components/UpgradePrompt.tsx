'use client'

import Link from 'next/link'

interface UpgradePromptProps {
  open: boolean
  onClose: () => void
  reason?: string
}

export default function UpgradePrompt({ open, onClose, reason }: UpgradePromptProps) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 300, marginBottom: 8 }}>
            Upgrade to Pro
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            {reason || 'You\'ve reached the free tier limit for today.'}
          </p>
          <ul className="feature-list" style={{ textAlign: 'left', marginBottom: 24 }}>
            {['Unlimited AI uses', 'Up to 2 GB per file', 'Batch processing (50 files)', '320 kbps audio'].map(f => (
              <li key={f}>
                <svg viewBox="0 0 8 8"><polyline points="1,4 3.5,6.5 7,1.5"/></svg>
                {f}
              </li>
            ))}
          </ul>
          <Link href="/pricing" className="btn btn-primary btn-full" onClick={onClose}>
            View Pro plans — $9/mo
          </Link>
          <button
            className="btn btn-ghost btn-full"
            style={{ marginTop: 8 }}
            onClick={onClose}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
