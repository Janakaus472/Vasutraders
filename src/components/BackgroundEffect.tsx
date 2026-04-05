'use client'

import { useEffect, useRef, useState } from 'react'

const WARM_COLORS = ['#FF6B00', '#FF9A3C', '#FFD700', '#FFA500', '#FF8C42']

const POKER_CHIPS = [
  { emoji: '🎰', price: '₹10', color: '#FF6B35' },
  { emoji: '🎰', price: '₹50', color: '#F7931E' },
  { emoji: '🎰', price: '₹100', color: '#FFD23F' },
  { emoji: '🎰', price: '₹500', color: '#06FFA5' },
  { emoji: '🎰', price: '₹1000', color: '#FFB800' },
  { emoji: '🏆', price: '₹2000', color: '#FFD700' },
  { emoji: '💰', price: '₹5000', color: '#FF6B00' },
  { emoji: '🃏', price: '₹100', color: '#DC2626' },
]

const SPORTS_ITEMS = [
  '🏏', '⚽', '🏸', '🏐', '🏀', '🎾',
  '🏑', '🏓', '🥊', '🏋️', '🚴', '🏃',
  '⚾', '🎳', '🥏', '🛹', '⛳', '🏊',
  '🤸', '🎯', '🏌️', '🚣', '🧘', '🏇'
]

type FloatingChip = {
  id: number
  x: number
  y: number
  size: number
  emoji: string
  price: string
  color: string
  speed: number
  wobble: number
  wobbleSpeed: number
  opacity: number
  rotation: number
  rotationSpeed: number
}

type FloatingSport = {
  id: number
  x: number
  y: number
  size: number
  emoji: string
  speed: number
  wobble: number
  wobbleSpeed: number
  opacity: number
  rotation: number
  rotationSpeed: number
}

type WarmOrb = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
}

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [chips, setChips] = useState<FloatingChip[]>([])
  const [sports, setSports] = useState<FloatingSport[]>([])
  const chipIdRef = useRef(0)
  const sportIdRef = useRef(0)

  /* ── Floating Poker Chips (Indian Prices) ── */
  useEffect(() => {
    const spawnChip = (): FloatingChip => {
      const chipData = POKER_CHIPS[Math.floor(Math.random() * POKER_CHIPS.length)]
      return {
        id: chipIdRef.current++,
        x: Math.random() * 100,
        y: 100 + Math.random() * 25,
        size: 35 + Math.random() * 45,
        emoji: chipData.emoji,
        price: chipData.price,
        color: chipData.color,
        speed: 0.04 + Math.random() * 0.05,
        wobble: Math.random() * 100,
        wobbleSpeed: 0.01 + Math.random() * 0.015,
        opacity: 0.05 + Math.random() * 0.05,
        rotation: (Math.random() - 0.5) * 15,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      }
    }

    const initial = Array.from({ length: 6 }, spawnChip)
    setChips(initial)

    const interval = setInterval(() => {
      setChips(prev => {
        const updated = prev
          .map(c => ({
            ...c,
            y: c.y - c.speed,
            wobble: c.wobble + c.wobbleSpeed,
            rotation: c.rotation + c.rotationSpeed,
          }))
          .filter(c => c.y > -15)

        if (updated.length < 8 && Math.random() > 0.8) {
          updated.push(spawnChip())
        }

        return updated
      })
    }, 80)

    return () => clearInterval(interval)
  }, [])

  /* ── Floating Sports Items (Indian Context) ── */
  useEffect(() => {
    const spawnSport = (): FloatingSport => ({
      id: sportIdRef.current++,
      x: Math.random() * 100,
      y: 100 + Math.random() * 30,
      size: 28 + Math.random() * 35,
      emoji: SPORTS_ITEMS[Math.floor(Math.random() * SPORTS_ITEMS.length)],
      speed: 0.03 + Math.random() * 0.04,
      wobble: Math.random() * 100,
      wobbleSpeed: 0.008 + Math.random() * 0.012,
      opacity: 0.04 + Math.random() * 0.04,
      rotation: (Math.random() - 0.5) * 15,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
    })

    const initial = Array.from({ length: 10 }, spawnSport)
    setSports(initial)

    const interval = setInterval(() => {
      setSports(prev => {
        const updated = prev
          .map(s => ({
            ...s,
            y: s.y - s.speed,
            wobble: s.wobble + s.wobbleSpeed,
            rotation: s.rotation + s.rotationSpeed,
          }))
          .filter(s => s.y > -15)

        if (updated.length < 12 && Math.random() > 0.85) {
          updated.push(spawnSport())
        }

        return updated
      })
    }, 90)

    return () => clearInterval(interval)
  }, [])

  /* ── Warm Glow Orbs Canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight

    const orbs: WarmOrb[] = Array.from({ length: 8 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: 80 + Math.random() * 120,
      color: WARM_COLORS[Math.floor(Math.random() * WARM_COLORS.length)],
      alpha: 0.02 + Math.random() * 0.02,
    }))

    let raf: number

    function frame() {
      ctx.clearRect(0, 0, W, H)

      for (const orb of orbs) {
        orb.x += orb.vx
        orb.y += orb.vy

        if (orb.x < -orb.size) orb.x = W + orb.size
        if (orb.x > W + orb.size) orb.x = -orb.size
        if (orb.y < -orb.size) orb.y = H + orb.size
        if (orb.y > H + orb.size) orb.y = -orb.size

        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.size
        )
        gradient.addColorStop(0, orb.color + '99')
        gradient.addColorStop(0.5, orb.color + '22')
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

  /* ── Cursor Glow ── */
  useEffect(() => {
    const glow = glowRef.current!
    let mouseX = 0, mouseY = 0
    let raf: number

    const animate = () => {
      glow.style.left = `${mouseX}px`
      glow.style.top = `${mouseY}px`
      raf = requestAnimationFrame(animate)
    }

    const move = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    window.addEventListener('mousemove', move)
    animate()

    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      {/* Warm Glow Orbs */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      />

      {/* Floating Poker Chips (Indian Rupee Prices) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {chips.map(c => {
          const wobbleX = Math.sin(c.wobble) * 15
          return (
            <div
              key={c.id}
              style={{
                position: 'absolute',
                left: `calc(${c.x}% + ${wobbleX}px)`,
                top: `${c.y}%`,
                fontSize: `${c.size}px`,
                opacity: c.opacity,
                transform: `rotate(${c.rotation}deg)`,
                transition: 'opacity 0.5s ease',
                userSelect: 'none',
                lineHeight: 1,
              }}
            >
              {c.emoji}
            </div>
          )
        })}
      </div>

      {/* Floating Sports Items (All Indian Context) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {sports.map(s => {
          const wobbleX = Math.sin(s.wobble) * 12
          return (
            <div
              key={s.id}
              style={{
                position: 'absolute',
                left: `calc(${s.x}% + ${wobbleX}px)`,
                top: `${s.y}%`,
                fontSize: `${s.size}px`,
                opacity: s.opacity,
                transform: `rotate(${s.rotation}deg)`,
                transition: 'opacity 0.5s ease',
                userSelect: 'none',
                lineHeight: 1,
              }}
            >
              {s.emoji}
            </div>
          )
        })}
      </div>

      {/* Cursor Glow */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,154,60,0.1) 0%, rgba(255,107,0,0.04) 40%, transparent 70%)',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
          zIndex: 0,
          mixBlendMode: 'screen',
        }}
      />
    </>
  )
}
