'use client'
import { useEffect, useState } from 'react'
import styles from './IntroAnimation.module.css'

export default function IntroAnimation() {
  const [show, setShow] = useState(false)

  useEffect(() => {
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

  if (!show) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.logo}>
        <span className={styles.word}>forma</span>
        <span className={styles.dot}>.</span>
      </div>
    </div>
  )
}
