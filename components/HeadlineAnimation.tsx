'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import styles from './HeadlineAnimation.module.css'

export default function HeadlineAnimation() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const activeRef = useRef(false)
  const rafRef = useRef<number>(0)
  const opacityRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0 })
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none) and (pointer: coarse)').matches)
  }, [])

  // Desktop halftone hover effect
  const drawDesktop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (opacityRef.current < 0.01 && !activeRef.current) return

    const target = activeRef.current ? 1 : 0
    opacityRef.current += (target - opacityRef.current) * 0.06

    const mx = mouseRef.current.x
    const my = mouseRef.current.y
    const spacing = 18
    const maxRadius = 4.5
    const influence = 160

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.globalAlpha = opacityRef.current

    for (let x = spacing / 2; x < w; x += spacing) {
      for (let y = spacing / 2; y < h; y += spacing) {
        const dx = x - mx
        const dy = y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const t = Math.max(0, 1 - dist / influence)

        if (t < 0.01) continue

        const pushDist = t * t * 14
        const angle = Math.atan2(dy, dx)
        const px = x + Math.cos(angle) * pushDist
        const py = y + Math.sin(angle) * pushDist
        const r = maxRadius * t * t

        const orangeT = Math.pow(t, 1.5)
        const red = Math.round(232 * orangeT + 60 * (1 - orangeT))
        const green = Math.round(98 * orangeT + 50 * (1 - orangeT))
        const blue = Math.round(42 * orangeT + 45 * (1 - orangeT))

        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${red},${green},${blue},${0.7 * t})`
        ctx.fill()
      }
    }

    ctx.restore()
    rafRef.current = requestAnimationFrame(drawDesktop)
  }, [])

  // Mobile ambient wave animation
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
      if (!ctx || !W || !H) { raf = requestAnimationFrame(drawWave); return }

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

  // Resize + desktop events
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
      const onEnter = () => { activeRef.current = true; rafRef.current = requestAnimationFrame(drawDesktop) }
      const onLeave = () => { activeRef.current = false; mouseRef.current = { x: -1000, y: -1000 } }
      const onMove = (e: MouseEvent) => {
        const rect = wrap.getBoundingClientRect()
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      }

      wrap.addEventListener('mouseenter', onEnter)
      wrap.addEventListener('mouseleave', onLeave)
      wrap.addEventListener('mousemove', onMove)

      return () => {
        ro.disconnect()
        cancelAnimationFrame(rafRef.current)
        wrap.removeEventListener('mouseenter', onEnter)
        wrap.removeEventListener('mouseleave', onLeave)
        wrap.removeEventListener('mousemove', onMove)
      }
    }

    return () => {
      ro.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [isTouch, drawDesktop])

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ pointerEvents: 'none' }} />
      <div className={styles.text}>
        <span>Work done.</span>
        <br />
        <em>Without</em>
        <br />
        <span>the noise.</span>
      </div>
    </div>
  )
}
