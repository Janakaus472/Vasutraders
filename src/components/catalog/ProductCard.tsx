'use client'

import Image from 'next/image'
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
  'Playing Cards':      'linear-gradient(135deg, #fef3e2, #fde68a)',
  'Party Balloons':     'linear-gradient(135deg, #fce7f3, #fbcfe8)',
  'Kanche & Glass Balls': 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
  'Sports & Games':     'linear-gradient(135deg, #dcfce7, #bbf7d0)',
  'Rubber Bands':       'linear-gradient(135deg, #fef9c3, #fde047)',
  'Spurs':              'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
  'Poker Chips':        'linear-gradient(135deg, #fee2e2, #fecaca)',
  'Toothbrushes':       'linear-gradient(135deg, #d1fae5, #a7f3d0)',
  'Burnt Balls':        'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
}

const MARKETPLACE_LINKS = [
  {
    name: 'Amazon',
    shortName: 'AMZ',
    color: '#FF9900',
    bg: '#fff8ee',
    url: (name: string) => `https://www.amazon.in/s?k=${encodeURIComponent(name)}`,
    icon: '🛒',
  },
  {
    name: 'Flipkart',
    shortName: 'FLK',
    color: '#2874f0',
    bg: '#eef4ff',
    url: (name: string) => `https://www.flipkart.com/search?q=${encodeURIComponent(name)}`,
    icon: '🛍️',
  },
  {
    name: 'IndiaMART',
    shortName: 'IND',
    color: '#53a318',
    bg: '#f0fae8',
    url: (name: string) => `https://www.indiamart.com/search.mp?ss=${encodeURIComponent(name)}`,
    icon: '🏢',
  },
]

export default function ProductCard({ product, cartQuantity, onAdd, onRemove, index = 0 }: ProductCardProps) {
  const { t } = useLanguage()
  const isInCart = cartQuantity > 0
  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg, #f8f7f4, #efefed)'
  const delay = Math.min(index, 12) * 0.06

  return (
    <div
      className="animate-popIn"
      style={{
        animationDelay: `${delay}s`,
        background: '#fff',
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isInCart
          ? '0 0 0 2.5px #FF6B00, 0 10px 30px rgba(255,107,0,0.18)'
          : '0 3px 16px rgba(15,39,68,0.07)',
        transition: 'box-shadow 0.25s, transform 0.25s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-5px) scale(1.01)'
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

      {/* Image area */}
      <div style={{ position: 'relative', background: imgBg, height: '220px', overflow: 'hidden' }}>
        <Image
          src={product.imageUrl || '/placeholder-product.png'}
          alt={product.name}
          fill
          style={{ objectFit: 'contain', padding: '18px', transition: 'transform 0.4s ease' }}
          sizes="(max-width: 768px) 50vw, 25vw"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png' }}
          onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.08)' }}
          onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)' }}
        />

        {/* Out of stock */}
        {!product.inStock && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800,
              padding: '5px 14px', borderRadius: '20px', letterSpacing: '1.5px', textTransform: 'uppercase',
            }}>{t.outOfStock}</span>
          </div>
        )}

        {/* Cart quantity bubble */}
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

        {/* Category tag */}
        {product.category && (
          <div style={{
            position: 'absolute', bottom: '8px', left: '8px',
            background: 'rgba(255,255,255,0.92)', fontSize: '10px', fontWeight: 600,
            color: '#374151', padding: '3px 9px', borderRadius: '20px',
            backdropFilter: 'blur(4px)', letterSpacing: '0.2px',
          }}>
            {product.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>

        {/* Name + description */}
        <div style={{ flex: 1 }}>
          <p style={{
            fontWeight: 700, color: '#111827', fontSize: '13.5px', lineHeight: '1.45',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            minHeight: '38px', fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {product.name}
          </p>
          {product.description && (
            <p style={{
              color: '#9ca3af', fontSize: '11px', marginTop: '4px',
              display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {product.description}
            </p>
          )}
        </div>

        {/* Price + Add button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {product.pricePerUnit > 0 ? (
              <>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.7rem', color: '#15803d', lineHeight: 1, letterSpacing: '0.5px' }}>
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
          <AddToCartButton
            quantity={cartQuantity}
            onAdd={onAdd}
            onRemove={onRemove}
            disabled={!product.inStock}
          />
        </div>

        {/* ── Marketplace buttons ── */}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px', display: 'flex', gap: '6px' }}>
          {MARKETPLACE_LINKS.map((m) => (
            <a
              key={m.name}
              href={m.url(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              title={`${t.buyOn} ${m.name}`}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                padding: '6px 4px', borderRadius: '8px',
                background: m.bg, color: m.color,
                fontSize: '10px', fontWeight: 700,
                textDecoration: 'none', letterSpacing: '0.3px',
                border: `1px solid ${m.color}22`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.background = m.color
                el.style.color = '#fff'
                el.style.transform = 'translateY(-1px)'
                el.style.boxShadow = `0 3px 10px ${m.color}44`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.background = m.bg
                el.style.color = m.color
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: '11px' }}>{m.icon}</span>
              <span>{m.shortName}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
