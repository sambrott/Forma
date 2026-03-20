'use client'

import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import styles from './CyclingPhrase.module.css'

const PHRASES = [
  'the noise.',
  'the wait.',
  'the friction.',
  'the worry.',
]

const DISPLAY_DURATION = 3500
const ENTER_DURATION = 380
const OVERLAP_DELAY = 80
const INITIAL_DELAY = 400

function sleep(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms)
  })
}

async function sleepInterruptible(
  totalMs: number,
  pausedRef: MutableRefObject<boolean>,
  cancelledRef: MutableRefObject<boolean>,
  chunkMs = 100
) {
  let left = totalMs
  while (left > 0 && !cancelledRef.current) {
    while (pausedRef.current && !cancelledRef.current) {
      await sleep(80)
    }
    if (cancelledRef.current) return
    const step = Math.min(chunkMs, left)
    await sleep(step)
    left -= step
  }
}

interface CyclingPhraseProps {
  paused?: boolean
}

export function CyclingPhrase({ paused = false }: CyclingPhraseProps) {
  const [stableIndex, setStableIndex] = useState(0)
  const [cross, setCross] = useState<{ from: number; to: number } | null>(null)
  const [firstEnter, setFirstEnter] = useState(false)
  const [beforeStart, setBeforeStart] = useState(true)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  useEffect(() => {
    const cancelledRef = { current: false }

    async function run() {
      await sleep(INITIAL_DELAY)
      if (cancelledRef.current) return
      setBeforeStart(false)
      setFirstEnter(true)
      await sleep(ENTER_DURATION)
      if (cancelledRef.current) return
      setFirstEnter(false)
      let idx = 0
      setStableIndex(0)

      while (!cancelledRef.current) {
        await sleepInterruptible(DISPLAY_DURATION, pausedRef, cancelledRef)
        if (cancelledRef.current) return

        const next = (idx + 1) % PHRASES.length
        setCross({ from: idx, to: next })
        await sleep(OVERLAP_DELAY + ENTER_DURATION)
        if (cancelledRef.current) return

        idx = next
        setStableIndex(idx)
        setCross(null)
      }
    }

    run()
    return () => {
      cancelledRef.current = true
    }
  }, [])

  return (
    <span className={styles.phraseClip} aria-live="polite">
      <span className={styles.phraseSizer} aria-hidden>
        the friction.
      </span>
      {beforeStart && (
        <span className={`${styles.phraseLayer} ${styles.phraseLayerStable} ${styles.hiddenBeforeStart}`}>
          {PHRASES[0]}
        </span>
      )}
      {firstEnter && (
        <span className={`${styles.phraseLayer} ${styles.phraseLayerStable} ${styles.entering}`}>
          {PHRASES[0]}
        </span>
      )}
      {!beforeStart && !firstEnter && cross && (
        <>
          <span className={`${styles.phraseLayer} ${styles.exiting}`}>{PHRASES[cross.from]}</span>
          <span className={`${styles.phraseLayer} ${styles.enteringDelayed}`}>{PHRASES[cross.to]}</span>
        </>
      )}
      {!beforeStart && !firstEnter && !cross && (
        <span className={`${styles.phraseLayer} ${styles.phraseLayerStable} ${styles.visible}`}>
          {PHRASES[stableIndex]}
        </span>
      )}
    </span>
  )
}
