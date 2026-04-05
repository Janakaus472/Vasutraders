'use client'

import Image from 'next/image'
import { Product } from '@/types/product'
import { useLanguage } from '@/context/LanguageContext'
import AddToCartButton from './AddToCartButton'
import { CATEGORY_BG, LOGOS, MARKETPLACE_LINKS } from './marketplaceConfig'

interface ProductCardProps {
  product: Product
  cartQuantity: number
  onAdd: () => void
  onRemove: () => void
  onOpen: () => void
  index?: number
}

export default function ProductCard({ product, cartQuantity, onAdd, onRemove, onOpen, index = 0 }: ProductCardProps) {
  const { t } = useLanguage()
  const isInCart = cartQuantity > 0
  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg, #f8f7f4, #efefed)'
  const delay = Math.min(index, 14) * 0.055

  return (
    <div
      className="animate-popIn"
      style={{ animationDelay: `${delay}s`, position: 'relative' }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '22px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isInCart
            ? '0 0 0 3px #FF6B00, 0 10px 30px rgba(255,107,0,0.2)'
            : '0 4px 20px rgba(15,39,68,0.08)',
          transition: 'box-shadow 0.25s, transform 0.25s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(-6px) scale(1.02)'
          el.style.boxShadow = isInCart
            ? '0 0 0 3px #FF6B00, 0 24px 50px rgba(255,107,0,0.28)'
            : '0 20px 50px rgba(15,39,68,0.18)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(0) scale(1)'
          el.style.boxShadow = isInCart
            ? '0 0 0 3px #FF6B00, 0 10px 30px rgba(255,107,0,0.2)'
            : '0 4px 20px rgba(15,39,68,0.08)'
        }}
      >
        {/* Image — clicking opens modal */}
        <div
          onClick={onOpen}
          style={{ position: 'relative', background: imgBg, height: '230px', overflow: 'hidden', flexShrink: 0 }}
        >
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
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '5px 14px', borderRadius: '20px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {t.outOfStock}
              </span>
            </div>
          )}
          {cartQuantity > 0 && (
            <div style={{
              position: 'absolute', top: '10px', right: '10px',
              background: '#FF6B00', color: '#fff',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem',
              width: '30px', height: '30px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(255,107,0,0.5)',
              animation: 'popIn 0.35s cubic-bezier(.34,1.56,.64,1)',
            }}>
              {cartQuantity}
            </div>
          )}

          {/* "Tap to expand" hint */}
          <div style={{
            position: 'absolute', bottom: '8px', right: '8px',
            background: 'rgba(15,39,68,0.7)', color: '#fff',
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px',
            padding: '3px 8px', borderRadius: '20px',
          }}>
            ↗ Details
          </div>

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
        <div style={{ padding: '16px 18px 14px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>

          {/* Title — click opens modal */}
          {/* Title + description — no flex:1 so they stay tight together */}
          <div onClick={onOpen}>
            <p style={{
              fontWeight: 800, color: '#111827',
              fontSize: '17px',
              lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'color 0.15s',
              margin: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLParagraphElement).style.color = '#FF6B00' }}
            onMouseLeave={e => { (e.currentTarget as HTMLParagraphElement).style.color = '#111827' }}
            >
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

          {/* Price + Add — pushed to bottom with marginTop auto */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: 'auto' }}>
            <div>
              {product.pricePerUnit > 0 ? (
                <>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.1rem', color: '#15803d', lineHeight: 1, letterSpacing: '0.5px' }}>
                    ₹{product.pricePerUnit.toFixed(0)}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>
                    {t.per} {product.unit}
                  </p>
                </>
              ) : (
                <>
                  <p style={{ color: '#FF6B00', fontWeight: 800, fontSize: '14px' }}>{t.callForPrice}</p>
                  <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>{t.per} {product.unit}</p>
                </>
              )}
            </div>
            <AddToCartButton quantity={cartQuantity} onAdd={onAdd} onRemove={onRemove} disabled={!product.inStock} />
          </div>

          {/* Marketplace logo buttons */}
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
                  el.style.background = m.color
                  el.style.borderColor = m.color
                  el.style.transform = 'translateY(-2px)'
                  el.style.boxShadow = `0 4px 12px ${m.color}44`
                  const svg = el.querySelector('svg') as SVGElement | null
                  if (svg) svg.style.filter = 'brightness(0) invert(1)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = m.bg
                  el.style.borderColor = m.border
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'none'
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
