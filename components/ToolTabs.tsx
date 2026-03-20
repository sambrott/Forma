'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import { TOOL_TAB_ITEMS } from '@/lib/tools'
import styles from './ToolTabs.module.css'

const ALL_TAB = { id: 'All', label: 'All' } as const
const TABS = [ALL_TAB, ...TOOL_TAB_ITEMS]

export function ToolTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const raw = searchParams.get('cat') ?? 'All'
  const active =
    raw === 'Audio' || raw === 'Video' ? 'Media' : raw

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [indicatorVisible, setIndicatorVisible] = useState(false)
  const [animate, setAnimate] = useState(false)
  const hasPositionedOnce = useRef(false)

  useLayoutEffect(() => {
    const index = TABS.findIndex(t => t.id === active)
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
      const index = TABS.findIndex(t => t.id === active)
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

  function handleTabClick(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (id === 'All') params.delete('cat')
    else params.set('cat', id)
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
      {TABS.map((tab, i) => (
        <button
          key={tab.id}
          type="button"
          ref={el => {
            tabRefs.current[i] = el
          }}
          className={`${styles.tab} ${active === tab.id ? styles.tabActive : ''}`}
          onClick={() => handleTabClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
