'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

function ImageLightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex)

  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(255,255,255,0.15)', border: 'none',
          color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
          fontSize: '20px', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 10,
        }}
      >✕</button>

      {/* Image */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: '90vw', height: '70vh',
          maxWidth: '800px',
        }}
      >
        <Image
          src={images[idx]}
          alt={`Image ${idx + 1}`}
          fill
          style={{ objectFit: 'contain' }}
          sizes="90vw"
        />
      </div>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); prev() }}
            style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              width: '44px', height: '44px', borderRadius: '50%', fontSize: '22px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >‹</button>
          <button
            onClick={e => { e.stopPropagation(); next() }}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              width: '44px', height: '44px', borderRadius: '50%', fontSize: '22px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >›</button>

          {/* Dots */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setIdx(i) }}
                style={{
                  width: i === idx ? '24px' : '8px', height: '8px',
                  borderRadius: '4px', border: 'none',
                  background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer', transition: 'all 0.2s',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '8px' }}>
          {idx + 1} / {images.length}
        </div>
      )}
    </div>
  )
}

export default function ProductCard({ product, cartQuantity, onAdd, onRemove, onSetQuantity, onOpen, index = 0, hideCategory = false }: ProductCardProps) {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const isInCart = cartQuantity > 0
  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg,#f8f7f4,#efefed)'
  const goToProduct = () => router.push(`/catalog/${product.slug || product.id}`)

  const allImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(product.galleryImages || []),
  ]

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (allImages.length > 0) setLightboxOpen(true)
    else goToProduct()
  }

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
          min-width: 0;
          width: 100%;
        }
        .product-card-inner.in-cart {
          box-shadow: 0 0 0 3px #DC2626, 0 4px 16px rgba(220,38,28,0.15);
        }
        .product-card-inner:not(.in-cart) {
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .product-card-img {
          width: 130px;
          min-height: 130px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .product-card-body {
          flex: 1;
          min-width: 0;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow: hidden;
        }
        .product-card-name {
          font-weight: 800;
          color: #1a1a1a;
          font-size: 13px;
          line-height: 1.35;
          word-break: break-word;
          overflow-wrap: anywhere;
          white-space: normal;
          font-family: 'Plus Jakarta Sans', sans-serif;
          margin: 0;
        }
        .product-card-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-top: auto;
          flex-wrap: wrap;
          row-gap: 6px;
          min-width: 0;
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
          .product-card-name {
            font-size: 15px;
          }
        }
      `}</style>

      {lightboxOpen && allImages.length > 0 && (
        <ImageLightbox images={allImages} startIndex={0} onClose={() => setLightboxOpen(false)} />
      )}

      <div className={`product-card-inner ${isInCart ? 'in-cart' : ''}`}>
        {/* ── Image ── */}
        <div
          className="product-card-img"
          onClick={handleImageClick}
          style={{ background: imgBg }}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              style={{ objectFit: 'contain', padding: '8px' }}
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
          {allImages.length > 1 && (
            <div style={{
              position: 'absolute', top: '6px', left: '6px',
              background: 'rgba(0,0,0,0.55)', fontSize: '9px', fontWeight: 700,
              color: '#fff', padding: '2px 6px', borderRadius: '4px', zIndex: 5,
            }}>
              +{allImages.length - 1}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="product-card-body">
          <Link href={`/catalog/${product.slug || product.id}`} style={{ display: 'block', cursor: 'pointer', minWidth: 0, color: 'inherit', textDecoration: 'none' }}>
            <p className="product-card-name">{product.name}</p>
            {getDescription(product.description, lang) && (
              <p style={{
                color: '#6b7280', fontSize: '11px',
                display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                lineHeight: 1.4, margin: '3px 0 0', wordBreak: 'break-word',
              }}>
                {getDescription(product.description, lang)}
              </p>
            )}
          </Link>

          <div className="product-card-actions">
            <div style={{ flexShrink: 0, minWidth: 0 }}>
              {product.pricePerUnit > 0 ? (
                <>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1rem, 4vw, 1.4rem)', color: '#B91C1C', lineHeight: 1, letterSpacing: '0.5px' }}>
                    ₹{product.pricePerUnit.toFixed(0)}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '10px', marginTop: '1px' }}>{t.per} {product.unit}</p>
                </>
              ) : (
                <>
                  <p style={{ color: '#B91C1C', fontWeight: 800, fontSize: '12px' }}>{t.callForPrice}</p>
                  <p style={{ color: '#9ca3af', fontSize: '10px', marginTop: '2px' }}>{t.per} {product.unit}</p>
                </>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {cartQuantity > 0 && (
                <button
                  onClick={e => { e.stopPropagation(); onSetQuantity ? onSetQuantity(0) : Array.from({ length: cartQuantity }).forEach(() => onRemove()) }}
                  title="Remove from cart"
                  style={{
                    width: '24px', height: '24px', borderRadius: '5px',
                    background: '#FEF2F2', border: '1px solid #FECACA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#FEF2F2')}
                >
                  <svg width="11" height="11" fill="none" stroke="#DC2626" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <AddToCartButton quantity={cartQuantity} onAdd={onAdd} onRemove={onRemove} onSetQuantity={onSetQuantity} disabled={!product.inStock} compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
