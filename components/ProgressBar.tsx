'use client'
import { useEffect, useState, useRef } from 'react'
import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  active: boolean
  complete: boolean
  stages?: string[]
}

const DEFAULT_STAGES = [
  'Uploading file',
  'Analysing content',
  'Processing',
  'Almost done',
]

export default function ProgressBar({ active, complete, stages = DEFAULT_STAGES }: ProgressBarProps) {
  const [stageIndex, setStageIndex] = useState(0)
  const [dots, setDots] = useState('')
  const stageTimer = useRef<ReturnType<typeof setInterval>>()
  const dotsTimer = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (!active || complete) {
      clearInterval(stageTimer.current)
      clearInterval(dotsTimer.current)
      return
    }

    setStageIndex(0)
    setDots('')

    stageTimer.current = setInterval(() => {
      setStageIndex(i => (i + 1) % stages.length)
    }, 3000)

    dotsTimer.current = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 500)

    return () => {
      clearInterval(stageTimer.current)
      clearInterval(dotsTimer.current)
    }
  }, [active, complete, stages])

  if (!active && !complete) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        {complete ? (
          <div className={styles.fillComplete} />
        ) : (
          <div className={styles.shimmer} />
        )}
      </div>
      <div className={styles.label}>
        {complete ? 'Done' : `${stages[stageIndex]}${dots}`}
      </div>
    </div>
  )
}
