'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { track, EVENTS } from '@/lib/analytics'
import styles from './page.module.css'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogle() {
    const supabase = createClient()
    track(EVENTS.SIGN_IN_STARTED, { method: 'google' })
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    track(EVENTS.SIGN_IN_STARTED, { method: 'magic_link' })
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setMagicSent(true)
    }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div className={styles.card}>
        <div className={styles.notConfigured}>
          <p>Authentication is not configured yet.</p>
          <p>Add Supabase environment variables to enable sign-in.</p>
          <Link href="/" className="btn btn-ghost">Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <Link href="/" className={styles.wordmark}>forma.</Link>

      <h1 className={styles.heading}>Sign in to Forma</h1>
      <p className={styles.sub}>Required for AI-powered tools. Free forever.</p>

      {magicSent ? (
        <div className={styles.magicSent}>
          <div className={styles.magicIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className={styles.magicHeading}>Check your email</h2>
          <p className={styles.magicDesc}>
            We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
          </p>
          <button className="btn btn-ghost" onClick={() => setMagicSent(false)}>
            Try a different email
          </button>
        </div>
      ) : (
        <>
          <button className={styles.googleBtn} onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <form onSubmit={handleMagicLink} className={styles.form}>
            <input
              type="email"
              className="input"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            {error && <p className={styles.error}>{error}</p>}
            <button
              type="submit"
              className="btn btn-ghost"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        </>
      )}

      <p className={styles.trust}>
        No password. Files deleted after use. Cancel anytime.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={<div className={styles.card} />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
