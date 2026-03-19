'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import styles from './Nav.module.css'

export default function Nav() {
  const pathname = usePathname()

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
          <Link href="/pricing" className="btn btn-secondary btn-sm">
            Go Pro
          </Link>
        </div>
      </div>
    </nav>
  )
}
