'use client'
import { useEffect, useState } from 'react'
import styles from './IntroAnimation.module.css'

/**
 * Set to `true` to re-enable the full-screen forma logo splash on first visit (per session).
 * Kept off for launch polish; component and styles remain in the repo.
 */
const FORMA_INTRO_ANIMATION_ENABLED = false

export default function IntroAnimation() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!FORMA_INTRO_ANIMATION_ENABLED) return
    if (sessionStorage.getItem('forma-intro')) {
      setShow(false)
      return
    }
    setShow(true)
    const t = setTimeout(() => {
      sessionStorage.setItem('forma-intro', '1')
      setShow(false)
    }, 2400)
    return () => clearTimeout(t)
  }, [])

  if (!FORMA_INTRO_ANIMATION_ENABLED || !show) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.logo}>
        <span className={styles.word}>forma</span>
        <span className={styles.dot}>.</span>
      </div>
    </div>
  )
}
