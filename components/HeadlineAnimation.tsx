'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { CyclingPhrase } from '@/components/CyclingPhrase'
import styles from './HeadlineAnimation.module.css'

export default function HeadlineAnimation() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const activeRef = useRef(false)
  const hoverBlendRef = useRef(0)
  const rafRef = useRef<number>(0)
  const sizeRef = useRef({ w: 0, h: 0 })
  const timeStartRef = useRef(0)
  const [isTouch, setIsTouch] = useState(false)
  const [headlinePaused, setHeadlinePaused] = useState(false)

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none) and (pointer: coarse)').matches)
  }, [])

  const drawDesktopHalftone = useCallback((now: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    if (w < 1 || h < 1) return

    const t = timeStartRef.current ? (now - timeStartRef.current) / 1000 : 0
    const mx = mouseRef.current.x
    const my = mouseRef.current.y
    const hoverTarget = activeRef.current ? 1 : 0
    hoverBlendRef.current += (hoverTarget - hoverBlendRef.current) * 0.08

    const dark = document.documentElement.getAttribute('data-theme') === 'dark'
    const baseRgb = dark ? [150, 148, 145] : [72, 68, 62]

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(dpr, dpr)

    const spacing = 17
    const influence = 168
    const maxPush = 15
    const hb = hoverBlendRef.current

    for (let gx = spacing / 2; gx < w; gx += spacing) {
      for (let gy = spacing / 2; gy < h; gy += spacing) {
        const w1 = Math.sin(gx * 0.065 + gy * 0.048 - t * 1.15)
        const w2 = Math.sin(gx * 0.038 - gy * 0.072 + t * 0.92)
        const w3 = Math.cos(gx * 0.052 + gy * 0.061 + t * 0.78)
        const w4 = Math.sin((gx + gy) * 0.044 - t * 1.35)
        const wave = (w1 + w2 + w3 + w4) * 0.25

        let px = gx + wave * 2.8 + Math.sin(gy * 0.11 - t * 1.4) * 1.6
        let py = gy + Math.cos(gx * 0.09 + t * 1.05) * 2.2 + wave * 2

        const dx = px - mx
        const dy = py - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const ht = Math.max(0, 1 - dist / influence)

        if (hb * ht > 0.01) {
          const push = hb * ht * ht * maxPush
          const ang = Math.atan2(dy, dx)
          px += Math.cos(ang) * push
          py += Math.sin(ang) * push
        }

        const breathe = 0.5 + 0.5 * wave
        const baseAlpha = 0.028 + 0.052 * breathe
        const br = 0.85 + 0.45 * breathe

        if (hb * ht > 0.02) {
          const orangeT = Math.pow(ht, 1.35) * hb
          const rr = Math.round(232 * orangeT + baseRgb[0] * (1 - orangeT))
          const gg = Math.round(98 * orangeT + baseRgb[1] * (1 - orangeT))
          const bb = Math.round(42 * orangeT + baseRgb[2] * (1 - orangeT))
          const ar = br + orangeT * 3.2
          const alpha = Math.min(0.55, baseAlpha + orangeT * 0.42)
          ctx.beginPath()
          ctx.arc(px, py, ar, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${alpha})`
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(px, py, br, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${baseRgb[0]},${baseRgb[1]},${baseRgb[2]},${baseAlpha})`
          ctx.fill()
        }
      }
    }

    ctx.restore()
  }, [])

  // Desktop: continuous halftone waves + cursor interaction
  useEffect(() => {
    if (isTouch) return
    timeStartRef.current = performance.now()

    const tick = (now: number) => {
      drawDesktopHalftone(now)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isTouch, drawDesktopHalftone])

  // Mobile ambient wave (unchanged behaviour)
  useEffect(() => {
    if (!isTouch) return
    const canvas = canvasRef.current
    if (!canvas) return

    let raf: number
    let start: number | null = null

    function drawWave(ts: number) {
      if (!start) start = ts
      const t = (ts - start) / 1000

      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const { w: W, h: H } = sizeRef.current
      if (!ctx || !W || !H) {
        raf = requestAnimationFrame(drawWave)
        return
      }

      const dpr = window.devicePixelRatio || 1
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.scale(dpr, dpr)

      const SPACING = 16
      const cols = Math.ceil(W / SPACING) + 1
      const rows = Math.ceil(H / SPACING) + 1
      const SPEED = 0.6
      const WAVELENGTH = 0.8
      const AMPLITUDE = 0.18

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * SPACING
          const y = r * SPACING
          const wave = Math.sin((x / (W * WAVELENGTH)) * Math.PI * 2 - t * SPEED * Math.PI * 2)
          const norm = (wave + 1) / 2
          const alpha = norm * AMPLITUDE

          if (alpha < 0.01) continue

          const isOrange = norm > 0.8
          const [rc, gc, bc] = isOrange ? [232, 98, 42] : [28, 22, 18]
          ctx.fillStyle = `rgba(${rc},${gc},${bc},${alpha.toFixed(3)})`
          ctx.beginPath()
          ctx.arc(x, y, 1.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      raf = requestAnimationFrame(drawWave)
    }

    raf = requestAnimationFrame(drawWave)
    return () => cancelAnimationFrame(raf)
  }, [isTouch])

  // Resize + pointer (desktop)
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = wrap.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      sizeRef.current = { w: rect.width, h: rect.height }
    }

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    resize()

    if (!isTouch) {
      const onEnter = () => {
        activeRef.current = true
      }
      const onLeave = () => {
        activeRef.current = false
        mouseRef.current = { x: -1000, y: -1000 }
      }
      const onMove = (e: MouseEvent) => {
        const rect = wrap.getBoundingClientRect()
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      }

      wrap.addEventListener('mouseenter', onEnter)
      wrap.addEventListener('mouseleave', onLeave)
      wrap.addEventListener('mousemove', onMove)

      return () => {
        ro.disconnect()
        wrap.removeEventListener('mouseenter', onEnter)
        wrap.removeEventListener('mouseleave', onLeave)
        wrap.removeEventListener('mousemove', onMove)
      }
    }

    return () => {
      ro.disconnect()
    }
  }, [isTouch])

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      onMouseEnter={() => setHeadlinePaused(true)}
      onMouseLeave={() => setHeadlinePaused(false)}
    >
      <canvas ref={canvasRef} className={styles.canvas} style={{ pointerEvents: 'none' }} />
      <div className={styles.text}>
        <span>Work done.</span>
        <br />
        <em>Without</em>
        <br />
        <CyclingPhrase paused={headlinePaused} />
      </div>
    </div>
  )
}
