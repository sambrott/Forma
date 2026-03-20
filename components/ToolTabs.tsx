'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import styles from './ToolTabs.module.css'

const CATEGORIES = ['All', 'PDF', 'AI', 'Image', 'Audio', 'Video', 'Dev']

export function ToolTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const active = searchParams.get('cat') ?? 'All'

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [indicatorVisible, setIndicatorVisible] = useState(false)
  const [animate, setAnimate] = useState(false)
  const hasPositionedOnce = useRef(false)

  useLayoutEffect(() => {
    const index = CATEGORIES.indexOf(active)
    if (index === -1) return

    const shouldAnim = hasPositionedOnce.current
    hasPositionedOnce.current = true

    const apply = () => {
      const el = tabRefs.current[index]
      if (!el) return
      const parent = el.parentElement
      if (!parent) return
      const parentRect = parent.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      setAnimate(shouldAnim)
      setIndicator({
        left: elRect.left - parentRect.left,
        width: elRect.width,
      })
      setIndicatorVisible(true)
    }

    apply()
    const id = requestAnimationFrame(apply)
    return () => cancelAnimationFrame(id)
  }, [active])

  useEffect(() => {
    function handleResize() {
      const index = CATEGORIES.indexOf(active)
      if (index === -1) return
      const el = tabRefs.current[index]
      if (!el) return
      const parent = el.parentElement
      if (!parent) return
      setAnimate(false)
      const parentRect = parent.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      setIndicator({
        left: elRect.left - parentRect.left,
        width: elRect.width,
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [active])

  function handleTabClick(cat: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (cat === 'All') params.delete('cat')
    else params.set('cat', cat)
    router.push(`/tools?${params.toString()}`, { scroll: false })
  }

  return (
    <div className={styles.tabBar}>
      {indicatorVisible && (
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
          type="button"
          ref={el => {
            tabRefs.current[i] = el
          }}
          className={`${styles.tab} ${active === cat ? styles.tabActive : ''}`}
          onClick={() => handleTabClick(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
