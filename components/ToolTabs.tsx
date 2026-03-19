'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './ToolTabs.module.css'

const CATEGORIES = ['All', 'PDF', 'AI', 'Image', 'Audio', 'Video', 'Dev']

export function ToolTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const active = searchParams.get('cat') ?? 'All'

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)
  const [animate, setAnimate] = useState(false)

  const updateIndicator = useCallback((index: number, shouldAnimate: boolean) => {
    const el = tabRefs.current[index]
    if (!el) return
    const parent = el.parentElement
    if (!parent) return
    const parentRect = parent.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    setAnimate(shouldAnimate)
    setIndicator({
      left: elRect.left - parentRect.left,
      width: elRect.width,
    })
  }, [])

  useEffect(() => {
    const index = CATEGORIES.indexOf(active)
    if (index === -1) return
    requestAnimationFrame(() => {
      updateIndicator(index, false)
      setMounted(true)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mounted) return
    const index = CATEGORIES.indexOf(active)
    if (index === -1) return
    updateIndicator(index, true)
  }, [active, mounted, updateIndicator])

  useEffect(() => {
    function handleResize() {
      const index = CATEGORIES.indexOf(active)
      if (index !== -1) updateIndicator(index, false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [active, updateIndicator])

  function handleTabClick(cat: string, index: number) {
    updateIndicator(index, true)
    const params = new URLSearchParams(searchParams)
    if (cat === 'All') params.delete('cat')
    else params.set('cat', cat)
    router.push(`/tools?${params.toString()}`, { scroll: false })
  }

  return (
    <div className={styles.tabBar}>
      {mounted && (
        <div
          className={`${styles.indicator} ${animate ? styles.indicatorAnimate : ''}`}
          style={{
            left: `${indicator.left}px`,
            width: `${indicator.width}px`,
          }}
        />
      )}
      {CATEGORIES.map((cat, i) => (
        <button
          key={cat}
          ref={el => { tabRefs.current[i] = el }}
          className={`${styles.tab} ${active === cat ? styles.tabActive : ''}`}
          onClick={() => handleTabClick(cat, i)}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
