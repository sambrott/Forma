'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, Fragment } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)

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
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

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
    <nav ref={navRef} className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
            forma<em>.</em>
          </Link>
        </div>

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

        <div
          className={`${styles.right} ${!user ? styles.rightLoggedOutMobile : styles.rightLoggedInMobile}`}
        >
          <span className={styles.themeSlot}>
            <ThemeToggle />
          </span>
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
            <Link href="/login" className={`btn btn-secondary btn-sm ${styles.signInBtn} ${styles.signInBarOnly}`}>
              Sign in
            </Link>
          )}
          <Link href="/pricing" className={`btn btn-primary btn-sm ${styles.goProBtn}`}>
            Go Pro
          </Link>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(o => !o)}
          >
            <span className={styles.menuBar} data-open={menuOpen} />
            <span className={styles.menuBar} data-open={menuOpen} />
            <span className={styles.menuBar} data-open={menuOpen} />
          </button>
        </div>

        {menuOpen && (
          <div id="nav-mobile-menu" className={styles.mobileMenu}>
            {links.map(l => (
              <Fragment key={l.href}>
                <Link
                  href={l.href}
                  className={`${styles.mobileLink} ${pathname === l.href ? styles.mobileLinkActive : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </Link>
                {l.href === '/' && !user && (
                  <Link
                    href="/login"
                    className={`${styles.mobileLink} ${pathname === '/login' ? styles.mobileLinkActive : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
