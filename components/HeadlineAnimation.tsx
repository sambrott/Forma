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
    /* Brighter idle dots so halftone reads in light + dark UI */
    const baseRgb = dark ? [178, 175, 170] : [58, 54, 50]

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

        /* Always-on subtle “shake” / drift */
        const shakeX =
          Math.sin(t * 6.8 + gx * 0.12) * 1.15 + Math.cos(t * 4.9 + gy * 0.17) * 0.85
        const shakeY =
          Math.cos(t * 5.5 + gx * 0.09) * 0.95 + Math.sin(t * 7.1 + gy * 0.11) * 0.75
        px += shakeX
        py += shakeY

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
        /* Idle: clearly visible gray; hover adds orange + size */
        const baseAlpha = (dark ? 0.1 : 0.085) + (dark ? 0.11 : 0.095) * breathe
        const br = 0.95 + 0.5 * breathe

        if (hb * ht > 0.02) {
          /* Light mode: hover should read mostly orange (not gray); dark keeps current balance */
          let orangeT = Math.pow(ht, dark ? 1.35 : 1.05) * hb
          if (!dark) {
            orangeT = Math.min(1, orangeT * 1.65 + hb * ht * 0.4)
          }
          const rr = Math.round(232 * orangeT + baseRgb[0] * (1 - orangeT))
          const gg = Math.round(98 * orangeT + baseRgb[1] * (1 - orangeT))
          const bb = Math.round(42 * orangeT + baseRgb[2] * (1 - orangeT))
          const ar = br + orangeT * (dark ? 3.2 : 4.2)
          const alpha = Math.min(dark ? 0.55 : 0.64, baseAlpha + orangeT * (dark ? 0.42 : 0.58))
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
    <div ref={wrapRef} className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ pointerEvents: 'none' }} />
      <div className={styles.text}>
        <span>Work done.</span>
        <br />
        <em>Without</em>
        <br />
        <CyclingPhrase />
      </div>
    </div>
  )
}
