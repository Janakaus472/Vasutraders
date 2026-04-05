'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Product } from '@/types/product'
import { useLanguage } from '@/context/LanguageContext'
import AddToCartButton from './AddToCartButton'
import { CATEGORY_BG, LOGOS, MARKETPLACE_LINKS } from './marketplaceConfig'
import CategoryIcon from './CategoryIcon'

interface ProductCardProps {
  product: Product
  cartQuantity: number
  onAdd: () => void
  onRemove: () => void
  onOpen: () => void
  index?: number
}

/* Category → neon glow color */
const GLOW: Record<string, string> = {
  'Playing Cards':        '#C2410C',
  'Party Balloons':       '#C2410C',
  'Kanche & Glass Balls': '#C2410C',
  'Sports & Games':       '#15803d',
  'Rubber Bands':         '#C2410C',
  'Poker Chips':          '#C2691A',
  'Toothbrushes':         '#0891B2',
  'Boric Acid':           '#4F7942',
  'Tapes':                '#0284C7',
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Playing Cards': '🃏',
  'Party Balloons': '🎈',
  'Kanche & Glass Balls': '🔮',
  'Sports & Games': '🏏',
  'Rubber Bands': '🔁',
  'Poker Chips': '🎰',
  'Toothbrushes': '🪥',
  'Boric Acid': '⚗️',
  'Tapes': '📦',
}

export default function ProductCard({ product, cartQuantity, onAdd, onRemove, onOpen, index = 0 }: ProductCardProps) {
  const { t } = useLanguage()
  const isInCart = cartQuantity > 0
  const imgBg    = CATEGORY_BG[product.category] || 'linear-gradient(135deg,#f8f7f4,#efefed)'
  const glowColor = GLOW[product.category] || '#C2410C'
  const delay     = Math.min(index, 14) * 0.055

  const wrapRef = useRef<HTMLDivElement>(null)
  const holoRef = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el    = wrapRef.current!
    const holo  = holoRef.current!
    const shine = shineRef.current!
    const rect  = el.getBoundingClientRect()
    const x     = (e.clientX - rect.left) / rect.width   // 0→1
    const y     = (e.clientY - rect.top)  / rect.height  // 0→1
    const rx    = (y - 0.5) * -22   // rotateX
    const ry    = (x - 0.5) *  22   // rotateY
    const hue   = Math.round(x * 360)

    el.style.transform   = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px) scale(1.03)`
    el.style.boxShadow   = `0 30px 60px ${glowColor}55, 0 0 0 2px ${glowColor}88`
    el.style.transition  = 'box-shadow 0.05s, transform 0.05s'

    /* Rainbow holographic shimmer */
    holo.style.opacity = '1'
    holo.style.background = `
      linear-gradient(${hue}deg,
        rgba(255,0,80,0.25)   0%,
        rgba(255,165,0,0.25) 15%,
        rgba(255,255,0,0.25) 30%,
        rgba(0,255,128,0.25) 45%,
        rgba(0,180,255,0.25) 60%,
        rgba(180,0,255,0.25) 75%,
        rgba(255,0,80,0.25) 100%
      )`

    /* Specular shine spot */
    shine.style.background = `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(255,255,255,0.55) 0%, transparent 55%)`
    shine.style.opacity = '1'
  }

  function onMouseLeave() {
    const el    = wrapRef.current!
    const holo  = holoRef.current!
    const shine = shineRef.current!
    el.style.transform  = ''
    el.style.boxShadow  = isInCart
      ? `0 0 0 3px #FF6B00, 0 10px 30px rgba(255,107,0,0.2)`
      : '0 4px 20px rgba(15,39,68,0.08)'
    el.style.transition = 'box-shadow 0.3s, transform 0.3s'
    holo.style.opacity  = '0'
    shine.style.opacity = '0'
  }

  return (
    <div
      className="animate-popIn"
      style={{ animationDelay: `${delay}s`, position: 'relative' }}
    >
      <div
        ref={wrapRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          background: 'rgba(255,245,235,0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '22px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isInCart
            ? `0 0 0 3px #C2410C, 0 10px 30px rgba(194,65,12,0.2)`
            : '0 4px 20px rgba(92,45,15,0.08)',
          transition: 'box-shadow 0.3s, transform 0.3s',
          cursor: 'pointer',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          border: '1px solid rgba(194,105,26,0.2)',
        }}
      >
        {/* ── Holographic overlay (sits above image, below content) ── */}
        <div
          ref={holoRef}
          style={{
            position: 'absolute', inset: 0, borderRadius: '22px',
            opacity: 0, pointerEvents: 'none', zIndex: 3,
            transition: 'opacity 0.2s',
            mixBlendMode: 'color-dodge',
          }}
        />
        {/* ── Specular shine spot ── */}
        <div
          ref={shineRef}
          style={{
            position: 'absolute', inset: 0, borderRadius: '22px',
            opacity: 0, pointerEvents: 'none', zIndex: 4,
            transition: 'opacity 0.15s',
          }}
        />

        {/* ── Image ── */}
        <div
          onClick={onOpen}
          style={{ position: 'relative', background: imgBg, height: '230px', overflow: 'hidden', flexShrink: 0 }}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              style={{ objectFit: 'contain', padding: '18px', transition: 'transform 0.4s ease' }}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <CategoryIcon category={product.category} size="card" />
          )}

          {!product.inStock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '5px 14px', borderRadius: '20px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {t.outOfStock}
              </span>
            </div>
          )}
          {cartQuantity > 0 && (
            <div style={{
              position: 'absolute', top: '10px', right: '10px',
              background: '#C2410C', color: '#fff',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem',
              width: '30px', height: '30px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(194,65,12,0.5)',
              animation: 'popIn 0.35s cubic-bezier(.34,1.56,.64,1)',
              zIndex: 5,
            }}>
              {cartQuantity}
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: '8px', right: '8px',
            background: 'rgba(15,39,68,0.7)', color: '#fff',
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px',
            padding: '3px 8px', borderRadius: '20px', zIndex: 5,
          }}>
            ↗ Details
          </div>
          {product.category && (
            <div style={{
              position: 'absolute', bottom: '8px', left: '8px',
              background: 'rgba(255,255,255,0.92)', fontSize: '10px', fontWeight: 600,
              color: '#374151', padding: '3px 9px', borderRadius: '20px', zIndex: 5,
            }}>
              {product.category}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div style={{ padding: '16px 18px 14px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, position: 'relative', zIndex: 5 }}>
          <div onClick={onOpen}>
            <p style={{
              fontWeight: 800, color: '#111827', fontSize: '17px', lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0,
            }}>
              {product.name}
            </p>
            {product.description && (
              <p style={{
                color: '#6b7280', fontSize: '13px', marginTop: '5px',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                lineHeight: 1.5, margin: '5px 0 0',
              }}>
                {product.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: 'auto' }}>
            <div>
              {product.pricePerUnit > 0 ? (
                <>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.1rem', color: '#15803d', lineHeight: 1, letterSpacing: '0.5px' }}>
                    ₹{product.pricePerUnit.toFixed(0)}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>{t.per} {product.unit}</p>
                </>
              ) : (
                <>
                  <p style={{ color: '#C2410C', fontWeight: 800, fontSize: '14px' }}>{t.callForPrice}</p>
                  <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>{t.per} {product.unit}</p>
                </>
              )}
            </div>
            <AddToCartButton quantity={cartQuantity} onAdd={onAdd} onRemove={onRemove} disabled={!product.inStock} />
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', display: 'flex', gap: '7px' }}>
            {MARKETPLACE_LINKS.map(m => (
              <a
                key={m.name}
                href={m.url(product.name)}
                target="_blank"
                rel="noopener noreferrer"
                title={`${t.buyOn} ${m.name}`}
                onClick={e => e.stopPropagation()}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '8px 4px', borderRadius: '10px',
                  background: m.bg, border: `1.5px solid ${m.border}`,
                  textDecoration: 'none', transition: 'all 0.18s', overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = m.color; el.style.borderColor = m.color
                  el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `0 4px 12px ${m.color}44`
                  const svg = el.querySelector('svg') as SVGElement | null
                  if (svg) svg.style.filter = 'brightness(0) invert(1)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = m.bg; el.style.borderColor = m.border
                  el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'
                  const svg = el.querySelector('svg') as SVGElement | null
                  if (svg) svg.style.filter = 'none'
                }}
              >
                {LOGOS[m.name]}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
