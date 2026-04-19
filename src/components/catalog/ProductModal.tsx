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
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        padding: '0',
      }}
    >
      <style>{`
        .modal-panel {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          width: 100%;
          max-width: 960px;
          max-height: 92vh;
          display: flex;
          box-shadow: 0 40px 80px rgba(0,0,0,0.3);
          position: relative;
          margin: 20px;
        }
        .modal-left-panel {
          width: 44%;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          position: relative;
          min-height: 520px;
        }
        .modal-right-panel {
          flex: 1;
          overflow-y: auto;
          padding: 44px 40px 36px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .modal-image-container {
          position: relative;
          width: 100%;
          height: 320px;
        }
        @media (max-width: 640px) {
          .modal-panel {
            flex-direction: column;
            border-radius: 16px 16px 0 0;
            max-height: 95dvh;
            margin: 0;
            margin-top: auto;
            width: 100%;
            max-width: 100%;
            align-self: flex-end;
          }
          .modal-left-panel {
            width: 100%;
            min-height: unset;
            padding: 20px 16px 12px;
          }
          .modal-image-container {
            height: 200px;
          }
          .modal-right-panel {
            padding: 16px 16px 24px;
            gap: 14px;
          }
        }
      `}</style>
      {/* Modal panel */}
      <div
        className="modal-panel animate-modalIn"
        onClick={e => e.stopPropagation()}
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
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#DC2626'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#374151' }}
        >
          ✕
        </button>

        {/* ── LEFT: Image panel ── */}
        <div className="modal-left-panel" style={{ background: imgBg }}>
          {product.category && (
            <div style={{
              position: 'absolute', top: '20px', left: '20px',
              background: '#B91C1C',
              fontSize: '10px', fontWeight: 700, color: '#fff',
              padding: '5px 12px', borderRadius: '4px',
              letterSpacing: '1px', textTransform: 'uppercase',
            }}>
              {product.category}
            </div>
          )}

          {!product.inStock && (
            <div style={{
              position: 'absolute', top: '20px', right: '20px',
              background: '#DC2626', color: '#fff',
              fontSize: '10px', fontWeight: 800, padding: '4px 12px',
              borderRadius: '4px', letterSpacing: '1.5px', textTransform: 'uppercase',
            }}>
              {t.outOfStock}
            </div>
          )}

          <div className="modal-image-container">
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

          <div style={{
            marginTop: '20px',
            background: 'rgba(255,255,255,0.85)',
            padding: '8px 20px', borderRadius: '6px',
            fontSize: '13px', fontWeight: 600, color: '#374151',
          }}>
            {t.per} <strong>{product.unit}</strong>
          </div>
        </div>

        {/* ── RIGHT: Details panel ── */}
        <div className="modal-right-panel">

          <div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(2.2rem, 4vw, 3.6rem)',
              color: '#1a1a1a',
              lineHeight: 1.05,
              letterSpacing: '1px',
            }}>
              {product.name}
            </h2>

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
            background: '#FEF2F2',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex', alignItems: 'baseline', gap: '10px',
            border: '1px solid #FECACA',
          }}>
            {product.pricePerUnit > 0 ? (
              <>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(2rem, 8vw, 4rem)', color: '#B91C1C',
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
                fontSize: '2.2rem', color: '#B91C1C', letterSpacing: '1px',
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
              <span style={{ color: '#B91C1C', fontWeight: 700, fontSize: '15px' }}>
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
                background: '#B91C1C', color: '#fff',
                padding: '14px 24px', borderRadius: '8px',
                fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(185,28,28,0.3)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#991b1b' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#B91C1C' }}
            >
              🛒 {t.viewOrder}
            </a>
          )}

          <div style={{ borderTop: '1px solid #f0f0f0' }} />

          {/* Marketplace buttons */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
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
                    padding: '14px 20px', borderRadius: '10px',
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
