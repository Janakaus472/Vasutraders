'use client'

import Image from 'next/image'
import { Product } from '@/types/product'
import { useLanguage } from '@/context/LanguageContext'
import { getDescription } from '@/lib/i18n'
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
  hideCategory?: boolean
}

export default function ProductCard({ product, cartQuantity, onAdd, onRemove, onOpen, index = 0, hideCategory = false }: ProductCardProps) {
  const { t, lang } = useLanguage()
  const isInCart = cartQuantity > 0
  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg,#f8f7f4,#efefed)'
  const delay = Math.min(index, 14) * 0.055

  return (
    <div
      className="animate-popIn"
      style={{ animationDelay: `${delay}s`, position: 'relative' }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isInCart
            ? '0 0 0 3px #DC2626, 0 4px 16px rgba(220,38,38,0.15)'
            : '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.2s, transform 0.2s',
          cursor: 'pointer',
          border: '1px solid #f0f0f0',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = isInCart
            ? '0 0 0 3px #DC2626, 0 12px 32px rgba(220,38,38,0.2)'
            : '0 12px 32px rgba(0,0,0,0.12)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = isInCart
            ? '0 0 0 3px #DC2626, 0 4px 16px rgba(220,38,38,0.15)'
            : '0 2px 12px rgba(0,0,0,0.08)'
        }}
      >
        {/* ── Image ── */}
        <div
          onClick={onOpen}
          style={{ position: 'relative', background: imgBg, height: 'clamp(260px, 45vw, 400px)', overflow: 'hidden', flexShrink: 0 }}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              style={{ objectFit: 'contain', padding: '20px', transition: 'transform 0.3s ease' }}
              sizes="(max-width: 540px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <CategoryIcon category={product.category} size="card" />
          )}

          {!product.inStock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ background: '#DC2626', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '6px 16px', borderRadius: '4px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {t.outOfStock}
              </span>
            </div>
          )}
          {cartQuantity > 0 && (
            <div style={{
              position: 'absolute', top: '10px', right: '10px',
              background: '#DC2626', color: '#fff',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem',
              width: '30px', height: '30px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(220,38,38,0.4)',
              animation: 'popIn 0.35s cubic-bezier(.34,1.56,.64,1)',
              zIndex: 5,
            }}>
              {cartQuantity}
            </div>
          )}
          {product.category && !hideCategory && (
            <div style={{
              position: 'absolute', bottom: '8px', left: '8px',
              background: '#B91C1C', fontSize: '10px', fontWeight: 700,
              color: '#fff', padding: '4px 10px', borderRadius: '4px', zIndex: 5,
              letterSpacing: '0.5px',
            }}>
              {product.category}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div style={{ padding: 'clamp(14px, 3vw, 20px)', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <div onClick={onOpen}>
            <p style={{
              fontWeight: 800, color: '#1a1a1a', fontSize: 'clamp(14px, 3.5vw, 17px)', lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0,
            }}>
              {product.name}
            </p>
            {getDescription(product.description, lang) && (
              <p style={{
                color: '#6b7280', fontSize: '12px', marginTop: '4px',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                lineHeight: 1.5, margin: '4px 0 0',
              }}>
                {getDescription(product.description, lang)}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: 'auto' }}>
            <div>
              {product.pricePerUnit > 0 ? (
                <>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.4rem, 5vw, 2rem)', color: '#B91C1C', lineHeight: 1, letterSpacing: '0.5px' }}>
                    ₹{product.pricePerUnit.toFixed(0)}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>{t.per} {product.unit}</p>
                </>
              ) : (
                <>
                  <p style={{ color: '#B91C1C', fontWeight: 800, fontSize: '13px' }}>{t.callForPrice}</p>
                  <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>{t.per} {product.unit}</p>
                </>
              )}
            </div>
            <AddToCartButton quantity={cartQuantity} onAdd={onAdd} onRemove={onRemove} disabled={!product.inStock} />
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px', display: 'flex', gap: '6px' }}>
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
                  padding: '7px 4px', borderRadius: '8px',
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
