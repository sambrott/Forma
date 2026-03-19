'use client'
import Link from 'next/link'
import styles from './LimitReachedModal.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  limit?: number
  resetAt?: number
  isAI?: boolean
}

function formatResetTime(resetAt?: number): string {
  if (!resetAt) return 'tomorrow'
  const diff = resetAt - Date.now()
  if (diff <= 0) return 'soon'
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (hours > 0) return `in ${hours}h ${mins}m`
  return `in ${mins}m`
}

export default function LimitReachedModal({ isOpen, onClose, limit = 3, resetAt, isAI }: Props) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className={styles.icon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="var(--accent)" strokeWidth="1.5"/>
            <path d="M12 8v5M12 16v.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h2 className={styles.heading}>
          You&apos;ve used all {limit} free uses today
        </h2>
        <p className={styles.sub}>
          {isAI
            ? 'AI tools require a Pro account for unlimited access.'
            : 'Upgrade to Pro for unlimited access, or try again tomorrow.'}
          {' '}Resets {formatResetTime(resetAt)}.
        </p>

        <div className={styles.actions}>
          <Link href="/pricing" className="btn btn-primary" onClick={onClose}>
            Upgrade to Pro
          </Link>
          <button className="btn btn-ghost" onClick={onClose}>
            Come back {formatResetTime(resetAt)}
          </button>
        </div>

        <p className={styles.trust}>No dark patterns. Cancel anytime.</p>
      </div>
    </div>
  )
}
