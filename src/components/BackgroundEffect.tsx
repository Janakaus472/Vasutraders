'use client'

import { useEffect, useRef, useState } from 'react'

const HEARTS = ['❤️', '💕', '💖', '💗', '💝', '💘', '💓', '✨', '⭐', '🌟', '💫', '🦋', '🌸', '🧡', '🍊']
const WARM_COLORS = ['#FF6B00', '#FF9A3C', '#FFD700', '#FF4500', '#FFA500', '#E91E8C', '#ff6b9d', '#f59e0b', '#FF8C42', '#FFB347']

const SUITS = ['♠', '♥', '♦', '♣']

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

type FloatingHeart = {
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
  const [hearts, setHearts] = useState<FloatingHeart[]>([])
  const [chips, setChips] = useState<FloatingChip[]>([])
  const [sports, setSports] = useState<FloatingSport[]>([])
  const heartIdRef = useRef(0)
  const chipIdRef = useRef(0)
  const sportIdRef = useRef(0)

  /* ── Floating Hearts ── */
  useEffect(() => {
    const spawnHeart = (): FloatingHeart => ({
      id: heartIdRef.current++,
      x: Math.random() * 100,
      y: 100 + Math.random() * 20,
      size: 14 + Math.random() * 22,
      emoji: HEARTS[Math.floor(Math.random() * HEARTS.length)],
      speed: 0.08 + Math.random() * 0.12,
      wobble: Math.random() * 100,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      opacity: 0.4 + Math.random() * 0.4,
      rotation: (Math.random() - 0.5) * 30,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
    })

    const initial = Array.from({ length: 18 }, spawnHeart)
    setHearts(initial)

    const interval = setInterval(() => {
      setHearts(prev => {
        const updated = prev
          .map(h => ({
            ...h,
            y: h.y - h.speed,
            wobble: h.wobble + h.wobbleSpeed,
            rotation: h.rotation + h.rotationSpeed,
          }))
          .filter(h => h.y > -15)

        if (updated.length < 20 && Math.random() > 0.7) {
          updated.push(spawnHeart())
        }

        return updated
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

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
        speed: 0.06 + Math.random() * 0.08,
        wobble: Math.random() * 100,
        wobbleSpeed: 0.015 + Math.random() * 0.025,
        opacity: 0.08 + Math.random() * 0.08,
        rotation: (Math.random() - 0.5) * 20,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      }
    }

    const initial = Array.from({ length: 8 }, spawnChip)
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

        if (updated.length < 10 && Math.random() > 0.75) {
          updated.push(spawnChip())
        }

        return updated
      })
    }, 60)

    return () => clearInterval(interval)
  }, [])

  /* ── Floating Sports Items (Indian Context) ── */
  useEffect(() => {
    const spawnSport = (): FloatingSport => ({
      id: sportIdRef.current++,
      x: Math.random() * 100,
      y: 100 + Math.random() * 30,
      size: 28 + Math.random() * 42,
      emoji: SPORTS_ITEMS[Math.floor(Math.random() * SPORTS_ITEMS.length)],
      speed: 0.05 + Math.random() * 0.07,
      wobble: Math.random() * 100,
      wobbleSpeed: 0.012 + Math.random() * 0.02,
      opacity: 0.06 + Math.random() * 0.06,
      rotation: (Math.random() - 0.5) * 25,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
    })

    const initial = Array.from({ length: 12 }, spawnSport)
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

        if (updated.length < 14 && Math.random() > 0.8) {
          updated.push(spawnSport())
        }

        return updated
      })
    }, 70)

    return () => clearInterval(interval)
  }, [])

  /* ── Warm Glow Orbs Canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight

    const orbs: WarmOrb[] = Array.from({ length: 12 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: 60 + Math.random() * 100,
      color: WARM_COLORS[Math.floor(Math.random() * WARM_COLORS.length)],
      alpha: 0.03 + Math.random() * 0.04,
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
        gradient.addColorStop(0, orb.color + 'cc')
        gradient.addColorStop(0.5, orb.color + '44')
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

      {/* Floating Hearts */}
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
        {hearts.map(h => {
          const wobbleX = Math.sin(h.wobble) * 15
          return (
            <div
              key={h.id}
              style={{
                position: 'absolute',
                left: `calc(${h.x}% + ${wobbleX}px)`,
                top: `${h.y}%`,
                fontSize: `${h.size}px`,
                opacity: h.opacity,
                transform: `rotate(${h.rotation}deg)`,
                transition: 'opacity 0.5s ease',
                userSelect: 'none',
                lineHeight: 1,
                filter: 'drop-shadow(0 0 8px rgba(255,107,0,0.3))',
              }}
            >
              {h.emoji}
            </div>
          )
        })}
      </div>

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
          const wobbleX = Math.sin(c.wobble) * 20
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
                filter: `drop-shadow(0 0 12px ${c.color}66)`,
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
          const wobbleX = Math.sin(s.wobble) * 18
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
                filter: 'drop-shadow(0 0 10px rgba(255,107,0,0.25))',
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
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,154,60,0.18) 0%, rgba(255,107,0,0.08) 40%, transparent 70%)',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
          zIndex: 0,
          mixBlendMode: 'screen',
        }}
      />

      {/* Floating suit symbols */}
      {SUITS.map((suit, i) => (
        <div
          key={suit + i}
          aria-hidden="true"
          style={{
            position: 'fixed',
            fontSize: `${60 + i * 20}px`,
            opacity: 0.06,
            color: i % 2 === 0 ? '#FF6B00' : '#FF9A3C',
            zIndex: 0,
            pointerEvents: 'none',
            left: `${10 + i * 22}%`,
            top: `${15 + (i % 3) * 30}%`,
            animation: `float${(i % 3) + 1} ${8 + i}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`,
            userSelect: 'none',
          }}
        >
          {suit}
        </div>
      ))}
    </>
  )
}
