'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import styles from './Nav.module.css'

interface UserInfo {
  email: string
  initial: string
}

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user: u } }) => {
        if (u?.email) {
          setUser({ email: u.email, initial: u.email[0].toUpperCase() })
        }
      })
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          setUser({ email: session.user.email, initial: session.user.email[0].toUpperCase() })
        } else {
          setUser(null)
        }
      })
      return () => subscription.unsubscribe()
    })
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    setDropOpen(false)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  const links = [
    { href: '/', label: 'Home' },
    { href: '/tools', label: 'Tools' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          forma<em>.</em>
        </Link>
        <ul className={styles.links}>
          {links.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={pathname === l.href ? styles.active : undefined}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.right}>
          <ThemeToggle />
          {user ? (
            <div className={styles.userMenu} ref={dropRef}>
              <button
                className={styles.avatar}
                onClick={() => setDropOpen(p => !p)}
                aria-label="Account menu"
              >
                {user.initial}
              </button>
              {dropOpen && (
                <div className={styles.dropdown}>
                  <Link href="/pricing" className={styles.dropItem} onClick={() => setDropOpen(false)}>
                    Account
                  </Link>
                  <button className={styles.dropItem} onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={`btn btn-secondary btn-sm ${styles.signInBtn}`}>
              Sign in
            </Link>
          )}
          <Link href="/pricing" className={`btn btn-primary btn-sm ${styles.goProBtn}`}>
            Go Pro
          </Link>
        </div>
      </div>
    </nav>
  )
}
