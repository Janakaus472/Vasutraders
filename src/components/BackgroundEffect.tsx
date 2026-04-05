'use client'

import { useEffect, useRef } from 'react'

const SUITS = ['♠', '♥', '♦', '♣', '🃏', '♠', '♥', '♦', '♣']

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glowRef  = useRef<HTMLDivElement>(null)

  /* ── Canvas rain ── */
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    const FONT   = 26
    const GAP    = FONT * 1.6

    let W = canvas.width  = window.innerWidth
    let H = canvas.height = window.innerHeight

    const cols   = Math.floor(W / GAP)
    const drops  = Array.from({ length: cols }, () => Math.random() * -60)
    const speeds = Array.from({ length: cols }, () => 0.25 + Math.random() * 0.45)
    const chars  = Array.from({ length: cols }, () => SUITS[Math.floor(Math.random() * SUITS.length)])

    let raf: number

    function draw() {
      /* fade trail — must match exact site bg rgb(250,248,243) */
      ctx.fillStyle = 'rgba(250,248,243,0.055)'
      ctx.fillRect(0, 0, W, H)

      for (let i = 0; i < cols; i++) {
        const c   = chars[i]
        const red = c === '♥' || c === '♦'
        ctx.shadowBlur  = 10
        ctx.shadowColor = red ? '#FF6B00' : '#0f2744'
        ctx.fillStyle   = red
          ? `rgba(255,107,0,${0.18 + Math.random() * 0.12})`
          : `rgba(15,39,68,${0.14 + Math.random() * 0.10})`
        ctx.font = `${FONT}px serif`
        ctx.fillText(c, i * GAP, drops[i] * FONT)

        drops[i] += speeds[i]
        if (drops[i] * FONT > H + 30 && Math.random() > 0.97) {
          drops[i] = -8 - Math.random() * 30
          speeds[i] = 0.25 + Math.random() * 0.45
          chars[i]  = SUITS[Math.floor(Math.random() * SUITS.length)]
        }
      }
      raf = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  /* ── Cursor glow ── */
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
      {/* Cursor glow orb */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'left 0.08s ease, top 0.08s ease',
          mixBlendMode: 'multiply',
        }}
      />
    </>
  )
}
