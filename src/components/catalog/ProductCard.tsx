'use client'

import Image from 'next/image'
import { Product } from '@/types/product'
import { useLanguage } from '@/context/LanguageContext'
import { getDescription } from '@/lib/i18n'
import AddToCartButton from './AddToCartButton'
import { CATEGORY_BG } from './marketplaceConfig'
import CategoryIcon from './CategoryIcon'

interface ProductCardProps {
  product: Product
  cartQuantity: number
  onAdd: () => void
  onRemove: () => void
  onSetQuantity?: (qty: number) => void
  onOpen: () => void
  index?: number
  hideCategory?: boolean
}

export default function ProductCard({ product, cartQuantity, onAdd, onRemove, onSetQuantity, onOpen, index = 0, hideCategory = false }: ProductCardProps) {
  const { t, lang } = useLanguage()
  const isInCart = cartQuantity > 0
  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg,#f8f7f4,#efefed)'

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        .product-card-inner {
          display: flex;
          flex-direction: row;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #f0f0f0;
          cursor: pointer;
        }
        .product-card-inner.in-cart {
          box-shadow: 0 0 0 3px #DC2626, 0 4px 16px rgba(220,38,28,0.15);
        }
        .product-card-inner:not(.in-cart) {
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .product-card-img {
          width: 160px;
          min-height: 160px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .product-card-body {
          flex: 1;
          min-width: 0;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        @media (min-width: 540px) {
          .product-card-inner {
            flex-direction: column;
          }
          .product-card-img {
            width: 100%;
            height: 260px;
            min-height: auto;
          }
          .product-card-body {
            padding: 14px;
            gap: 8px;
          }
        }
      `}</style>

      <div className={`product-card-inner ${isInCart ? 'in-cart' : ''}`}>
        {/* ── Image ── */}
        <div
          className="product-card-img"
          onClick={onOpen}
          style={{ background: imgBg }}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              style={{ objectFit: 'contain', padding: '12px' }}
              sizes="(max-width: 540px) 130px, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <CategoryIcon category={product.category} size="card" />
          )}

          {!product.inStock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ background: '#DC2626', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '4px 12px', borderRadius: '4px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {t.outOfStock}
              </span>
            </div>
          )}
          {cartQuantity > 0 && (
            <div style={{
              position: 'absolute', top: '6px', right: '6px',
              background: '#DC2626', color: '#fff',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem',
              width: '26px', height: '26px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(220,38,38,0.4)',
              zIndex: 5,
            }}>
              {cartQuantity}
            </div>
          )}
          {product.category && !hideCategory && (
            <div style={{
              position: 'absolute', bottom: '6px', left: '6px',
              background: '#B91C1C', fontSize: '9px', fontWeight: 700,
              color: '#fff', padding: '3px 8px', borderRadius: '4px', zIndex: 5,
              letterSpacing: '0.5px',
            }}>
              {product.category}
            </div>
          )}
          {(product.bulkVariants?.length ?? 0) > 0 && (
            <div style={{
              position: 'absolute', bottom: '6px', right: '6px',
              background: '#1d4ed8', fontSize: '8px', fontWeight: 800,
              color: '#fff', padding: '3px 7px', borderRadius: '4px', zIndex: 5,
              letterSpacing: '0.8px',
            }}>
              BULK
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="product-card-body">
          <div onClick={onOpen}>
            <p style={{
              fontWeight: 800, color: '#1a1a1a', fontSize: 'clamp(13px, 3vw, 15px)', lineHeight: 1.3,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0,
            }}>
              {product.name}
            </p>
            {getDescription(product.description, lang) && (
              <p style={{
                color: '#6b7280', fontSize: '11px', marginTop: '3px',
                display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                lineHeight: 1.4, margin: '3px 0 0',
              }}>
                {getDescription(product.description, lang)}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: 'auto', flexWrap: 'wrap', rowGap: '6px' }}>
            <div style={{ flexShrink: 0 }}>
              {product.pricePerUnit > 0 ? (
                <>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', color: '#B91C1C', lineHeight: 1, letterSpacing: '0.5px' }}>
                    ₹{product.pricePerUnit.toFixed(0)}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '10px', marginTop: '1px' }}>{t.per} {product.unit}</p>
                </>
              ) : (
                <>
                  <p style={{ color: '#B91C1C', fontWeight: 800, fontSize: '13px' }}>{t.callForPrice}</p>
                  <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>{t.per} {product.unit}</p>
                </>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {cartQuantity > 0 && (
                <button
                  onClick={e => { e.stopPropagation(); onSetQuantity ? onSetQuantity(0) : Array.from({ length: cartQuantity }).forEach(() => onRemove()) }}
                  title="Remove from cart"
                  style={{
                    width: '28px', height: '28px', borderRadius: '6px',
                    background: '#FEF2F2', border: '1px solid #FECACA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#FEF2F2')}
                >
                  <svg width="13" height="13" fill="none" stroke="#DC2626" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <AddToCartButton quantity={cartQuantity} onAdd={onAdd} onRemove={onRemove} onSetQuantity={onSetQuantity} disabled={!product.inStock} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
