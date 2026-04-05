'use client'

import { useEffect, useRef, useState } from 'react'

const CASINO_COLORS = ['#FFD700', '#0D0D0D', '#DC2626', '#B8860B', '#800000']
const CASINO_BG = '#0D0D0D'

const PRODUCTS = [
  '🃏', '🎰', '🎈', '🔮', '🏏', '⚽', '🏸', '🏐', '🏀', '🎾',
  '🏓', '🪥', '📏', '📦', '⚗️', '🧴', '🧹', '🎯', '🏆', '💰'
]

type MarqueeItem = {
  id: number
  y: number
  speed: number
  emoji: string
  scale: number
  opacity: number
}

type FloatingItem = {
  id: number
  x: number
  y: number
  size: number
  emoji: string
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  opacity: number
  color: string
}

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const [marqueeItems, setMarqueeItems] = useState<MarqueeItem[]>([])
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([])
  const marqueeIdRef = useRef(0)
  const floatingIdRef = useRef(0)
  const animationRef = useRef<number | undefined>(undefined)

  /* ── Marquee Stripes (60% of animation) ── */
  useEffect(() => {
    const initialItems: MarqueeItem[] = []
    for (let i = 0; i < 8; i++) {
      initialItems.push({
        id: marqueeIdRef.current++,
        y: 8 + i * 12,
        speed: 0.3 + Math.random() * 0.2,
        emoji: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
        scale: 0.8 + Math.random() * 0.4,
        opacity: 0.15 + Math.random() * 0.1,
      })
    }
    setMarqueeItems(initialItems)

    const updateMarquee = () => {
      setMarqueeItems(prev => prev.map(item => ({
        ...item,
        y: item.y + item.speed,
        emoji: Math.random() > 0.98 ? PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)] : item.emoji,
      })).map(item => {
        if (item.y > 108) {
          return {
            ...item,
            y: -2,
            emoji: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
          }
        }
        return item
      }))
    }

    const interval = setInterval(updateMarquee, 50)
    return () => clearInterval(interval)
  }, [])

  /* ── Floating Items from LEFT/RIGHT edges (40% of animation) ── */
  useEffect(() => {
    const spawnFloating = (fromRight = false): FloatingItem => {
      return {
        id: floatingIdRef.current++,
        x: fromRight ? 105 : -5,
        y: 10 + Math.random() * 80,
        size: 24 + Math.random() * 36,
        emoji: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
        vx: fromRight ? -(0.08 + Math.random() * 0.1) : (0.08 + Math.random() * 0.1),
        vy: (Math.random() - 0.5) * 0.02,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        opacity: 0.08 + Math.random() * 0.06,
        color: CASINO_COLORS[Math.floor(Math.random() * CASINO_COLORS.length)],
      }
    }

    const initial = Array.from({ length: 12 }, () => spawnFloating(Math.random() > 0.5))
    setFloatingItems(initial)

    const updateFloating = () => {
      setFloatingItems(prev => {
        const updated = prev
          .map(item => ({
            ...item,
            x: item.x + item.vx,
            y: item.y + item.vy,
            rotation: item.rotation + item.rotationSpeed,
          }))
          .filter(item => item.x < 110 && item.x > -10)

        while (updated.length < 15) {
          updated.push(spawnFloating(Math.random() > 0.5))
        }

        return updated
      })
    }

    const interval = setInterval(updateFloating, 50)
    return () => clearInterval(interval)
  }, [])

  /* ── Subtle Casino Glow Canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight

    const orbs = [
      { x: W * 0.2, y: H * 0.3, size: 200, color: '#FFD700', alpha: 0.015 },
      { x: W * 0.8, y: H * 0.7, size: 250, color: '#DC2626', alpha: 0.012 },
      { x: W * 0.5, y: H * 0.5, size: 300, color: '#0D0D0D', alpha: 0.02 },
    ]

    let raf: number

    const frame = () => {
      ctx.clearRect(0, 0, W, H)

      for (const orb of orbs) {
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size)
        gradient.addColorStop(0, orb.color + '33')
        gradient.addColorStop(0.5, orb.color + '11')
        gradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.globalAlpha = orb.alpha
        ctx.fill()
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(frame)
    }

    frame()

    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <>
      {/* Subtle Casino Glow Background */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      />

      {/* Marquee Stripes (Vertical Scroll) */}
      <div
        ref={marqueeRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          background: 'transparent',
        }}
      >
        {marqueeItems.map(item => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${item.id * 14}%`,
              top: `${item.y}%`,
              fontSize: `${item.scale * 28}px`,
              opacity: item.opacity,
              userSelect: 'none',
              lineHeight: 1,
              filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.3))',
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Floating Items from LEFT/RIGHT Edges */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          background: 'transparent',
        }}
      >
        {floatingItems.map(item => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: `${item.size}px`,
              opacity: item.opacity,
              transform: `rotate(${item.rotation}deg)`,
              userSelect: 'none',
              lineHeight: 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>
    </>
  )
}
