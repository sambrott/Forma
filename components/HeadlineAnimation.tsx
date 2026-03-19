'use client'

import { useRef, useEffect, useCallback } from 'react'
import styles from './HeadlineAnimation.module.css'

export default function HeadlineAnimation() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const activeRef = useRef(false)
  const rafRef = useRef<number>(0)
  const opacityRef = useRef(0)

  const draw = useCallback(() => {
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
    rafRef.current = requestAnimationFrame(draw)
  }, [])

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
    }

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    resize()

    const onEnter = () => { activeRef.current = true; rafRef.current = requestAnimationFrame(draw) }
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
  }, [draw])

  return (
    <div ref={wrapRef} className={styles.wrap} style={{ padding: 32 }}>
      <canvas ref={canvasRef} className={styles.canvas} />
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
