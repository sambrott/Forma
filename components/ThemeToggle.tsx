'use client'

import { useEffect, useState } from 'react'

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('forma-theme')
    const isDark = stored === 'dark'
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [])

  function applyTheme(nextDark: boolean) {
    setDark(nextDark)
    document.documentElement.setAttribute('data-theme', nextDark ? 'dark' : 'light')
    localStorage.setItem('forma-theme', nextDark ? 'dark' : 'light')
  }

  return (
    <div className="theme-segment" role="group" aria-label="Color theme">
      <button
        type="button"
        className={`theme-seg ${!dark ? 'theme-seg-active' : ''}`}
        aria-pressed={!dark}
        onClick={() => applyTheme(false)}
        aria-label="Light mode"
      >
        <SunIcon />
      </button>
      <button
        type="button"
        className={`theme-seg ${dark ? 'theme-seg-active' : ''}`}
        aria-pressed={dark}
        onClick={() => applyTheme(true)}
        aria-label="Dark mode"
      >
        <MoonIcon />
      </button>
    </div>
  )
}
