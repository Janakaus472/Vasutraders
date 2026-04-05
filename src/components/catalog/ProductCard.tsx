'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Product } from '@/types/product'
import { useLanguage } from '@/context/LanguageContext'
import AddToCartButton from './AddToCartButton'

interface ProductCardProps {
  product: Product
  cartQuantity: number
  onAdd: () => void
  onRemove: () => void
  index?: number
}

const CATEGORY_BG: Record<string, string> = {
  'Playing Cards':        'linear-gradient(135deg, #fef3e2, #fde68a)',
  'Party Balloons':       'linear-gradient(135deg, #fce7f3, #fbcfe8)',
  'Kanche & Glass Balls': 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
  'Sports & Games':       'linear-gradient(135deg, #dcfce7, #bbf7d0)',
  'Rubber Bands':         'linear-gradient(135deg, #fef9c3, #fde047)',
  'Spurs':                'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
  'Poker Chips':          'linear-gradient(135deg, #fee2e2, #fecaca)',
  'Toothbrushes':         'linear-gradient(135deg, #d1fae5, #a7f3d0)',
  'Burnt Balls':          'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
}

// Inline SVG logos — no external deps, always renders
const LOGOS = {
  Amazon: (
    <svg viewBox="0 0 100 30" width="58" height="17" aria-label="Amazon">
      <text x="2" y="22" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="22" fill="#232F3E">amazon</text>
      {/* smile arrow */}
      <path d="M7 26 Q28 34 45 26" stroke="#FF9900" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M43 23 L46 27 L40 27 Z" fill="#FF9900"/>
    </svg>
  ),
  Flipkart: (
    <svg viewBox="0 0 100 30" width="58" height="17" aria-label="Flipkart">
      {/* Yellow star/bag icon */}
      <rect x="1" y="4" width="22" height="22" rx="3" fill="#FFE500"/>
      <text x="5" y="21" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16" fill="#2874F0">F</text>
      <text x="27" y="22" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="15" fill="#2874F0">flipkart</text>
    </svg>
  ),
  IndiaMART: (
    <svg viewBox="0 0 110 30" width="62" height="17" aria-label="IndiaMART">
      <text x="2" y="22" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fill="#53A318">india</text>
      <text x="40" y="22" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fill="#F26522">MART</text>
      {/* Green underline */}
      <rect x="2" y="25" width="38" height="2" rx="1" fill="#53A318"/>
      <rect x="40" y="25" width="34" height="2" rx="1" fill="#F26522"/>
    </svg>
  ),
}

const MARKETPLACE_LINKS = [
  {
    name: 'Amazon' as const,
    color: '#FF9900',
    hoverBg: '#FF9900',
    bg: '#fffbf2',
    border: '#FFE0A0',
    url: (name: string) => `https://www.amazon.in/s?k=${encodeURIComponent(name)}`,
  },
  {
    name: 'Flipkart' as const,
    color: '#2874F0',
    hoverBg: '#2874F0',
    bg: '#f0f6ff',
    border: '#b3d0ff',
    url: (name: string) => `https://www.flipkart.com/search?q=${encodeURIComponent(name)}`,
  },
  {
    name: 'IndiaMART' as const,
    color: '#53A318',
    hoverBg: '#53A318',
    bg: '#f2fbea',
    border: '#b8e699',
    url: (name: string) => `https://www.indiamart.com/search.mp?ss=${encodeURIComponent(name)}`,
  },
]

export default function ProductCard({ product, cartQuantity, onAdd, onRemove, index = 0 }: ProductCardProps) {
  const { t } = useLanguage()
  const [showTooltip, setShowTooltip] = useState(false)
  const isInCart = cartQuantity > 0
  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg, #f8f7f4, #efefed)'
  const delay = Math.min(index, 12) * 0.06

  return (
    <div
      className="animate-popIn"
      style={{ animationDelay: `${delay}s`, position: 'relative' }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* ── Hover tooltip (full product details) ── */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            width: '280px',
            background: '#0f2744',
            borderRadius: '16px',
            padding: '18px',
            boxShadow: '0 20px 60px rgba(15,39,68,0.35), 0 0 0 1px rgba(255,107,0,0.3)',
            animation: 'fadeInUp 0.2s ease both',
            pointerEvents: 'none',
          }}
        >
          {/* Arrow */}
          <div style={{
            position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #0f2744',
          }} />

          {/* Category badge */}
          {product.category && (
            <span style={{
              display: 'inline-block',
              background: 'rgba(255,107,0,0.2)', color: '#FF9A3C',
              fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px',
              textTransform: 'uppercase', padding: '3px 8px',
              borderRadius: '20px', marginBottom: '10px',
            }}>
              {product.category}
            </span>
          )}

          {/* Full name */}
          <p style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.4rem', color: '#fff',
            lineHeight: 1.1, letterSpacing: '0.5px',
            marginBottom: '8px',
          }}>
            {product.name}
          </p>

          {/* Full description */}
          {product.description && (
            <p style={{ color: '#93b4cf', fontSize: '12px', lineHeight: 1.6, marginBottom: '12px' }}>
              {product.description}
            </p>
          )}

          {/* Price row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
            {product.pricePerUnit > 0 ? (
              <>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#FF6B00', lineHeight: 1 }}>
                  ₹{product.pricePerUnit.toFixed(0)}
                </span>
                <span style={{ color: '#7bafd4', fontSize: '11px' }}>/ {product.unit}</span>
              </>
            ) : (
              <span style={{ color: '#FF9A3C', fontWeight: 700, fontSize: '13px' }}>{t.callForPrice}</span>
            )}
            {!product.inStock && (
              <span style={{
                marginLeft: 'auto', background: '#ef4444', color: '#fff',
                fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px',
                letterSpacing: '1px', textTransform: 'uppercase',
              }}>
                {t.outOfStock}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Card ── */}
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isInCart
            ? '0 0 0 2.5px #FF6B00, 0 10px 30px rgba(255,107,0,0.18)'
            : '0 3px 16px rgba(15,39,68,0.07)',
          transition: 'box-shadow 0.25s, transform 0.25s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(-4px) scale(1.01)'
          el.style.boxShadow = isInCart
            ? '0 0 0 2.5px #FF6B00, 0 20px 40px rgba(255,107,0,0.25)'
            : '0 16px 40px rgba(15,39,68,0.16)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(0) scale(1)'
          el.style.boxShadow = isInCart
            ? '0 0 0 2.5px #FF6B00, 0 10px 30px rgba(255,107,0,0.18)'
            : '0 3px 16px rgba(15,39,68,0.07)'
        }}
      >

        {/* Image */}
        <div style={{ position: 'relative', background: imgBg, height: '220px', overflow: 'hidden', flexShrink: 0 }}>
          <Image
            src={product.imageUrl || '/placeholder-product.png'}
            alt={product.name}
            fill
            style={{ objectFit: 'contain', padding: '18px', transition: 'transform 0.4s ease' }}
            sizes="(max-width: 768px) 50vw, 25vw"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png' }}
            onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.1)' }}
            onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)' }}
          />
          {!product.inStock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '5px 14px', borderRadius: '20px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {t.outOfStock}
              </span>
            </div>
          )}
          {cartQuantity > 0 && (
            <div style={{
              position: 'absolute', top: '10px', right: '10px',
              background: '#FF6B00', color: '#fff',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem',
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(255,107,0,0.5)',
              animation: 'popIn 0.35s cubic-bezier(.34,1.56,.64,1)',
            }}>
              {cartQuantity}
            </div>
          )}
          {product.category && (
            <div style={{
              position: 'absolute', bottom: '8px', left: '8px',
              background: 'rgba(255,255,255,0.92)', fontSize: '10px', fontWeight: 600,
              color: '#374151', padding: '3px 9px', borderRadius: '20px',
            }}>
              {product.category}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px 12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>

          {/* Title — hover triggers tooltip */}
          <div
            style={{ flex: 1, cursor: 'pointer' }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <p style={{
              fontWeight: 700, color: '#111827',
              fontSize: '15px',
              lineHeight: '1.4',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              minHeight: '42px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLParagraphElement).style.color = '#FF6B00' }}
            onMouseLeave={e => { (e.currentTarget as HTMLParagraphElement).style.color = '#111827' }}
            >
              {product.name}
            </p>
            {product.description && (
              <p style={{
                color: '#9ca3af', fontSize: '11.5px', marginTop: '4px',
                display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {product.description}
              </p>
            )}
          </div>

          {/* Price + Add */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {product.pricePerUnit > 0 ? (
                <>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#15803d', lineHeight: 1 }}>
                    ₹{product.pricePerUnit.toFixed(0)}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '10px', marginTop: '1px' }}>
                    {t.per} {product.unit}
                  </p>
                </>
              ) : (
                <>
                  <p style={{ color: '#FF6B00', fontWeight: 700, fontSize: '12px' }}>{t.callForPrice}</p>
                  <p style={{ color: '#9ca3af', fontSize: '10px', marginTop: '1px' }}>{t.per} {product.unit}</p>
                </>
              )}
            </div>
            <AddToCartButton quantity={cartQuantity} onAdd={onAdd} onRemove={onRemove} disabled={!product.inStock} />
          </div>

          {/* ── Marketplace logo buttons ── */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px', display: 'flex', gap: '6px' }}>
            {MARKETPLACE_LINKS.map((m) => (
              <a
                key={m.name}
                href={m.url(product.name)}
                target="_blank"
                rel="noopener noreferrer"
                title={`${t.buyOn} ${m.name}`}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '7px 4px', borderRadius: '10px',
                  background: m.bg,
                  border: `1.5px solid ${m.border}`,
                  textDecoration: 'none',
                  transition: 'all 0.18s',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = m.hoverBg
                  el.style.borderColor = m.hoverBg
                  el.style.transform = 'translateY(-2px)'
                  el.style.boxShadow = `0 4px 12px ${m.color}44`
                  // invert logo SVG on hover
                  const svg = el.querySelector('svg') as SVGElement | null
                  if (svg) {
                    svg.style.filter = 'brightness(0) invert(1)'
                  }
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = m.bg
                  el.style.borderColor = m.border
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'none'
                  const svg = el.querySelector('svg') as SVGElement | null
                  if (svg) {
                    svg.style.filter = 'none'
                  }
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
