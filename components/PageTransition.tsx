'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import styles from './PageTransition.module.css'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const el = ref.current
    if (!el) return
    el.classList.remove(styles.enter)
    void el.offsetHeight
    el.classList.add(styles.enter)
  }, [pathname])

  return (
    <div ref={ref} className={styles.wrap}>
      {children}
    </div>
  )
}
