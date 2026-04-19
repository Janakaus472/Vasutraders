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
          border-radius: 14px;
          overflow: hidden;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          box-shadow: 0 40px 80px rgba(0,0,0,0.3);
          position: relative;
          margin: 16px;
        }
        .modal-left-panel {
          width: 40%;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
        }
        .modal-right-panel {
          flex: 1;
          overflow-y: auto;
          padding: 28px 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          justify-content: center;
        }
        .modal-image-container {
          position: relative;
          width: 100%;
          height: clamp(180px, calc(90vh - 160px), 340px);
        }
        @media (max-width: 640px) {
          .modal-panel {
            flex-direction: column;
            border-radius: 14px 14px 0 0;
            max-height: 95dvh;
            margin: 0;
            margin-top: auto;
            width: 100%;
            max-width: 100%;
            align-self: flex-end;
          }
          .modal-left-panel {
            width: 100%;
            padding: 16px 16px 8px;
          }
          .modal-image-container {
            height: 28vh;
          }
          .modal-right-panel {
            padding: 12px 16px 20px;
            gap: 10px;
          }
        }
      `}</style>

      <div
        className="modal-panel animate-modalIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            zIndex: 10,
            width: '34px', height: '34px', borderRadius: '50%',
            border: 'none', cursor: 'pointer',
            background: 'rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', color: '#374151',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#DC2626'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#374151' }}
        >
          ✕
        </button>

        {/* LEFT: Image */}
        <div className="modal-left-panel" style={{ background: imgBg }}>
          {product.category && (
            <div style={{
              position: 'absolute', top: '12px', left: '12px',
              background: '#B91C1C',
              fontSize: '9px', fontWeight: 700, color: '#fff',
              padding: '4px 10px', borderRadius: '4px',
              letterSpacing: '1px', textTransform: 'uppercase',
            }}>
              {product.category}
            </div>
          )}

          {!product.inStock && (
            <div style={{
              position: 'absolute', top: '12px', right: '12px',
              background: '#DC2626', color: '#fff',
              fontSize: '9px', fontWeight: 800, padding: '4px 10px',
              borderRadius: '4px', letterSpacing: '1px', textTransform: 'uppercase',
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
                style={{ objectFit: 'contain', padding: '8px' }}
                sizes="400px"
              />
            ) : (
              <CategoryIcon category={product.category} size="modal" />
            )}
          </div>

          <div style={{
            marginTop: '10px',
            background: 'rgba(255,255,255,0.85)',
            padding: '5px 14px', borderRadius: '4px',
            fontSize: '12px', fontWeight: 600, color: '#374151',
          }}>
            {t.per} <strong>{product.unit}</strong>
          </div>
        </div>

        {/* RIGHT: Details */}
        <div className="modal-right-panel">

          {/* Name + description */}
          <div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              color: '#1a1a1a',
              lineHeight: 1.1,
              letterSpacing: '1px',
            }}>
              {product.name}
            </h2>

            {getDescription(product.description, lang) && (
              <p style={{
                color: '#4b5563',
                fontSize: '13px',
                lineHeight: 1.5,
                marginTop: '8px',
              }}>
                {getDescription(product.description, lang)}
              </p>
            )}
          </div>

          {/* Price */}
          <div style={{
            background: '#FEF2F2',
            borderRadius: '8px',
            padding: '14px 18px',
            display: 'flex', alignItems: 'baseline', gap: '8px',
            border: '1px solid #FECACA',
          }}>
            {product.pricePerUnit > 0 ? (
              <>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', color: '#B91C1C',
                  lineHeight: 1, letterSpacing: '1px',
                }}>
                  ₹{product.pricePerUnit.toFixed(0)}
                </span>
                <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>
                  / {product.unit}
                </span>
              </>
            ) : (
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.6rem', color: '#B91C1C', letterSpacing: '1px',
              }}>
                {t.callForPrice}
              </span>
            )}
          </div>

          {/* Cart controls + view cart in one row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ transform: 'scale(1.15)', transformOrigin: 'left center' }}>
              <AddToCartButton
                quantity={cartQuantity}
                onAdd={onAdd}
                onRemove={onRemove}
                disabled={!product.inStock}
              />
            </div>
            {cartQuantity > 0 && (
              <span style={{ color: '#B91C1C', fontWeight: 700, fontSize: '13px' }}>
                ✓ {cartQuantity} {t.itemsAdded}
              </span>
            )}
            {cartQuantity > 0 && (
              <a
                href="/cart"
                style={{
                  marginLeft: 'auto',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#B91C1C', color: '#fff',
                  padding: '8px 16px', borderRadius: '6px',
                  fontWeight: 700, fontSize: '12px', textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#991b1b' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#B91C1C' }}
              >
                🛒 {t.viewOrder}
              </a>
            )}
          </div>

          {/* Marketplace - horizontal row */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '14px', marginTop: '2px' }}>
            <p style={{ fontSize: '9px', fontWeight: 800, color: '#9ca3af', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
              {t.buyOn}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {MARKETPLACE_LINKS.map(m => (
                <a
                  key={m.name}
                  href={m.url(product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '8px 6px', borderRadius: '8px',
                    background: m.bg, border: `1.5px solid ${m.border}`,
                    textDecoration: 'none', transition: 'all 0.18s',
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
    </div>
  )
}
