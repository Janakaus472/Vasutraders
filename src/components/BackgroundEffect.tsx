'use client'

import { useEffect, useRef } from 'react'

const SUITS  = ['♠', '♥', '♦', '♣']
const WARM   = ['#FF6B00', '#FF9A3C', '#FFD700', '#FF4500', '#FFA500', '#E91E8C', '#ff6b9d', '#f59e0b']
const TRAIL  = 35   // trail length (frames remembered)
const COUNT  = 16   // number of particles

type P = {
  x: number; y: number
  vx: number; vy: number
  symbol: string; color: string; size: number
  trail: { x: number; y: number }[]
}

function spawn(W: number, H: number, atBottom = false): P {
  return {
    x:  Math.random() * W,
    y:  atBottom ? H + 20 : Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: -(0.15 + Math.random() * 0.35),   // slow upward drift
    symbol: SUITS[Math.floor(Math.random() * SUITS.length)],
    color:  WARM[Math.floor(Math.random() * WARM.length)],
    size:   18 + Math.random() * 22,
    trail:  [],
  }
}

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glowRef   = useRef<HTMLDivElement>(null)

  /* ── Drifting warm trail particles ── */
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!

    let W = canvas.width  = window.innerWidth
    let H = canvas.height = window.innerHeight

    const ps: P[] = Array.from({ length: COUNT }, () => spawn(W, H))

    let raf: number

    function frame() {
      /* Extremely slow fade — long warm trails */
      ctx.fillStyle = 'rgba(250,248,243,0.025)'
      ctx.fillRect(0, 0, W, H)

      for (const p of ps) {
        /* Record trail */
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > TRAIL) p.trail.shift()

        /* Draw comet tail — glowing dots shrinking toward head */
        for (let i = 0; i < p.trail.length; i++) {
          const ratio   = i / p.trail.length           // 0 = oldest, 1 = newest
          const alpha   = ratio * 0.55
          const radius  = ratio * p.size * 0.38
          const t       = p.trail[i]
          const hex     = Math.floor(alpha * 255).toString(16).padStart(2, '0')
          ctx.beginPath()
          ctx.arc(t.x, t.y, Math.max(0.5, radius), 0, Math.PI * 2)
          ctx.fillStyle = p.color + hex
          ctx.fill()
        }

        /* Glow halo at head */
        ctx.save()
        ctx.shadowBlur  = 22
        ctx.shadowColor = p.color
        ctx.fillStyle   = p.color + 'cc'
        ctx.font        = `${p.size}px serif`
        ctx.textAlign   = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.symbol, p.x, p.y)
        ctx.restore()

        /* Move (with gentle wobble) */
        p.vx += (Math.random() - 0.5) * 0.018
        p.vx  = Math.max(-0.55, Math.min(0.55, p.vx))
        p.x  += p.vx
        p.y  += p.vy

        /* Respawn at bottom when off-screen */
        if (p.y < -40 || p.x < -50 || p.x > W + 50) {
          Object.assign(p, spawn(W, H, true))
        }
      }

      raf = requestAnimationFrame(frame)
    }

    frame()

    const onResize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  /* ── Cursor warm glow ── */
  useEffect(() => {
    const glow = glowRef.current!
    const move = (e: MouseEvent) => {
      glow.style.left = `${e.clientX}px`
      glow.style.top  = `${e.clientY}px`
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      />
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'fixed', width: '380px', height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,154,60,0.13) 0%, rgba(255,107,0,0.06) 40%, transparent 70%)',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none', zIndex: 0,
          transition: 'left 0.1s ease, top 0.1s ease',
        }}
      />
    </>
  )
}
