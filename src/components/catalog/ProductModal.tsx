'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Product } from '@/types/product'
import { useLanguage } from '@/context/LanguageContext'
import { getDescription } from '@/lib/i18n'
import AddToCartButton from './AddToCartButton'
import { CATEGORY_BG, LOGOS, MARKETPLACE_LINKS } from './marketplaceConfig'
import CategoryIcon from './CategoryIcon'

interface ProductModalProps {
  product: Product
  cartQuantity: number
  onAdd: () => void
  onRemove: () => void
  onClose: () => void
}

export default function ProductModal({ product, cartQuantity, onAdd, onRemove, onClose }: ProductModalProps) {
  const { t, lang } = useLanguage()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [onClose])

  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg, #f8f7f4, #efefed)'

  return (
    /* Backdrop */
    <div
      className="animate-fadeIn"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(8, 20, 40, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Modal panel */}
      <div
        className="animate-modalIn"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '28px',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          display: 'flex',
          boxShadow: '0 60px 120px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,107,0,0.15)',
          position: 'relative',
        }}
      >
        {/* ── Close button ── */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            zIndex: 10,
            width: '40px', height: '40px', borderRadius: '50%',
            border: 'none', cursor: 'pointer',
            background: 'rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', color: '#374151',
            transition: 'background 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#374151' }}
        >
          ✕
        </button>

        {/* ── LEFT: Image panel ── */}
        <div style={{
          width: '44%', flexShrink: 0,
          background: imgBg,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 32px',
          position: 'relative',
          minHeight: '520px',
        }}>
          {/* Category badge top-left */}
          {product.category && (
            <div style={{
              position: 'absolute', top: '20px', left: '20px',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '11px', fontWeight: 700, color: '#374151',
              padding: '5px 12px', borderRadius: '20px',
              letterSpacing: '0.3px',
            }}>
              {product.category}
            </div>
          )}

          {/* Stock badge */}
          {!product.inStock && (
            <div style={{
              position: 'absolute', top: '20px', right: '20px',
              background: '#ef4444', color: '#fff',
              fontSize: '10px', fontWeight: 800, padding: '4px 12px',
              borderRadius: '20px', letterSpacing: '1.5px', textTransform: 'uppercase',
            }}>
              {t.outOfStock}
            </div>
          )}

          {/* Large image */}
          <div style={{ position: 'relative', width: '100%', height: '320px' }}>
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                style={{ objectFit: 'contain', padding: '8px', transition: 'transform 0.5s ease' }}
                sizes="400px"
                onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.06)' }}
                onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)' }}
              />
            ) : (
              <CategoryIcon category={product.category} size="modal" />
            )}
          </div>

          {/* Unit info pill */}
          <div style={{
            marginTop: '20px',
            background: 'rgba(255,255,255,0.85)',
            padding: '8px 20px', borderRadius: '20px',
            fontSize: '13px', fontWeight: 600, color: '#374151',
          }}>
            {t.per} <strong>{product.unit}</strong>
          </div>
        </div>

        {/* ── RIGHT: Details panel ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '44px 40px 36px',
          display: 'flex', flexDirection: 'column', gap: '20px',
        }}>

          {/* Product name */}
          <div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(2.2rem, 4vw, 3.6rem)',
              color: '#0f2744',
              lineHeight: 1.05,
              letterSpacing: '1px',
            }}>
              {product.name}
            </h2>

            {/* Description */}
            {getDescription(product.description, lang) ? (
              <p style={{
                color: '#4b5563',
                fontSize: '16px',
                lineHeight: 1.7,
                marginTop: '14px',
                fontWeight: 400,
              }}>
                {getDescription(product.description, lang)}
              </p>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '15px', marginTop: '10px', fontStyle: 'italic' }}>
                No description available
              </p>
            )}
          </div>

          {/* Price */}
          <div style={{
            background: '#f8f7f4',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex', alignItems: 'baseline', gap: '10px',
          }}>
            {product.pricePerUnit > 0 ? (
              <>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '4rem', color: '#15803d',
                  lineHeight: 1, letterSpacing: '1px',
                }}>
                  ₹{product.pricePerUnit.toFixed(0)}
                </span>
                <span style={{ color: '#6b7280', fontSize: '16px', fontWeight: 600 }}>
                  / {product.unit}
                </span>
              </>
            ) : (
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '2.2rem', color: '#FF6B00', letterSpacing: '1px',
              }}>
                {t.callForPrice}
              </span>
            )}
          </div>

          {/* Cart controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ transform: 'scale(1.35)', transformOrigin: 'left center' }}>
              <AddToCartButton
                quantity={cartQuantity}
                onAdd={onAdd}
                onRemove={onRemove}
                disabled={!product.inStock}
              />
            </div>
            {cartQuantity > 0 && (
              <span style={{ color: '#15803d', fontWeight: 700, fontSize: '15px' }}>
                ✓ {cartQuantity} {t.itemsAdded}
              </span>
            )}
          </div>

          {/* View cart button */}
          {cartQuantity > 0 && (
            <a
              href="/cart"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: '#15803d', color: '#fff',
                padding: '14px 24px', borderRadius: '14px',
                fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(21,128,61,0.35)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#166534' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#15803d' }}
            >
              🛒 {t.viewOrder}
            </a>
          )}

          {/* Divider */}
          <div style={{ borderTop: '1px solid #f0f0f0' }} />

          {/* Marketplace buttons */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              {t.buyOn}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {MARKETPLACE_LINKS.map(m => (
                <a
                  key={m.name}
                  href={m.url(product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', borderRadius: '14px',
                    background: m.bg, border: `1.5px solid ${m.border}`,
                    textDecoration: 'none', transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = m.color
                    el.style.borderColor = m.color
                    el.style.transform = 'translateX(4px)'
                    el.style.boxShadow = `0 6px 20px ${m.color}44`
                    const svg = el.querySelector('svg') as SVGElement | null
                    if (svg) svg.style.filter = 'brightness(0) invert(1)'
                    const arrow = el.querySelector('.arrow') as HTMLSpanElement | null
                    if (arrow) arrow.style.color = '#fff'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = m.bg
                    el.style.borderColor = m.border
                    el.style.transform = 'translateX(0)'
                    el.style.boxShadow = 'none'
                    const svg = el.querySelector('svg') as SVGElement | null
                    if (svg) svg.style.filter = 'none'
                    const arrow = el.querySelector('.arrow') as HTMLSpanElement | null
                    if (arrow) arrow.style.color = m.color
                  }}
                >
                  {LOGOS[m.name]}
                  <span className="arrow" style={{ fontSize: '18px', color: m.color, fontWeight: 700, transition: 'color 0.15s' }}>→</span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
