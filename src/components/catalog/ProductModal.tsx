'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Product, BulkVariant } from '@/types/product'
import { useLanguage } from '@/context/LanguageContext'
import { getDescription } from '@/lib/i18n'
import { useCart } from '@/context/CartContext'
import AddToCartButton from './AddToCartButton'
import { CATEGORY_BG } from './marketplaceConfig'
import CategoryIcon from './CategoryIcon'
import { trackProductView } from '@/hooks/useAnalytics'

interface ProductModalProps {
  product: Product
  cartQuantity: number
  onAdd: () => void
  onRemove: () => void
  onSetQuantity?: (qty: number) => void
  onClose: () => void
}

export default function ProductModal({ product, cartQuantity, onAdd, onRemove, onSetQuantity, onClose }: ProductModalProps) {
  const { t, lang } = useLanguage()
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const variants = product.bulkVariants || []

  // null = base product selected, string = variant id selected
  // Default to first variant when variants exist so base pill isn't accidentally added
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(variants.length > 0 ? variants[0].id : null)
  const selectedVariant = variants.find(v => v.id === selectedVariantId) ?? null

  // Cart quantity for the currently selected variant (or base product)
  const variantCartItem = selectedVariantId
    ? items.find(i => i.productId === product.id && i.variantId === selectedVariantId)
    : null
  const activeQty = selectedVariantId ? (variantCartItem?.quantity || 0) : cartQuantity

  // Price shown in the price box
  const activePrice = selectedVariant?.price !== null && selectedVariant?.price !== undefined
    ? selectedVariant.price
    : product.pricePerUnit

  // Image shown in left panel
  const activeImage = selectedVariant?.imageUrl || product.imageUrl

  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg, #f8f7f4, #efefed)'

  useEffect(() => {
    trackProductView({ id: product.id, name: product.name, category: product.category })
  }, [product.id, product.name, product.category])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [onClose])

  const handleAdd = () => {
    if (selectedVariantId) addItem(product.id, selectedVariantId)
    else onAdd()
  }
  const handleRemove = () => {
    if (selectedVariantId) removeItem(product.id, selectedVariantId)
    else onRemove()
  }
  const handleSetQty = (qty: number) => {
    if (selectedVariantId) updateQuantity(product.id, qty, selectedVariantId)
    else onSetQuantity?.(qty)
  }

  return (
    <div
      className="animate-fadeIn"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1001,
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
        .bulk-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 10px 8px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.15s;
          background: #fff;
          text-align: center;
          min-width: 88px;
          flex-shrink: 0;
        }
        .bulk-card:hover { border-color: #B91C1C; background: #FEF2F2; }
        .bulk-card.active { border-color: #B91C1C; background: #FEF2F2; box-shadow: 0 0 0 3px rgba(185,28,28,0.12); }
        .base-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 999px;
          border: 2px solid #e5e7eb;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          transition: all 0.15s;
          background: #fff;
          white-space: nowrap;
        }
        .base-pill:hover { border-color: #B91C1C; background: #FEF2F2; }
        .base-pill.active { border-color: #B91C1C; background: #FEF2F2; color: #B91C1C; box-shadow: 0 0 0 3px rgba(185,28,28,0.12); }
        @media (max-width: 640px) {
          .modal-panel {
            flex-direction: column;
            border-radius: 14px 14px 0 0;
            max-height: 92dvh;
            margin: 0;
            margin-top: auto;
            width: 100%;
            max-width: 100%;
            align-self: flex-end;
          }
          .modal-left-panel {
            width: 100%;
            padding: 12px 16px 6px;
          }
          .modal-image-container {
            height: 18vh;
          }
          .modal-right-panel {
            padding: 8px 14px 16px;
            gap: 8px;
          }
          .bulk-card {
            min-width: 72px;
            padding: 8px 6px;
            gap: 4px;
          }
        }
      `}</style>

      <div className="modal-panel animate-modalIn" onClick={e => e.stopPropagation()}>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 10,
            width: '34px', height: '34px', borderRadius: '50%',
            border: 'none', cursor: 'pointer',
            background: 'rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', color: '#374151', transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#DC2626'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#374151' }}
        >✕</button>

        {/* LEFT: Image — switches when a variant is selected */}
        <div className="modal-left-panel" style={{ background: imgBg, transition: 'background 0.3s' }}>
          {product.category && (
            <div style={{
              position: 'absolute', top: '12px', left: '12px',
              background: '#B91C1C', fontSize: '9px', fontWeight: 700, color: '#fff',
              padding: '4px 10px', borderRadius: '4px', letterSpacing: '1px', textTransform: 'uppercase',
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
            {activeImage ? (
              <Image
                src={activeImage}
                alt={selectedVariant ? `${product.name} – ${selectedVariant.quantity} ${selectedVariant.unit}` : product.name}
                fill
                style={{ objectFit: 'contain', padding: '8px', transition: 'opacity 0.2s' }}
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
            {selectedVariant
              ? <><strong>{selectedVariant.quantity}</strong> {selectedVariant.unit}</>
              : <>{t.per} <strong>{product.unit}</strong></>
            }
          </div>
        </div>

        {/* RIGHT: Details */}
        <div className="modal-right-panel">

          {/* Name + description */}
          <div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(1.3rem, 5vw, 2.4rem)',
              color: '#1a1a1a', lineHeight: 1.1, letterSpacing: '1px',
            }}>
              {product.name}
            </h2>
            {getDescription(product.description, lang) && (
              <p style={{ color: '#4b5563', fontSize: '13px', lineHeight: 1.5, marginTop: '8px' }}>
                {getDescription(product.description, lang)}
              </p>
            )}
          </div>

          {/* ── Bulk variant selector ───────────────────────────────────── */}
          {variants.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Also available in bulk
              </p>

              {/* Scrollable row: base pill + variant cards */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', paddingLeft: '2px', paddingRight: '2px', alignItems: 'flex-start' }}>

                {/* Base product pill */}
                <button
                  type="button"
                  className={`base-pill${selectedVariantId === null ? ' active' : ''}`}
                  onClick={(e) => { setSelectedVariantId(null); (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }) }}
                >
                  <span style={{ fontSize: '14px' }}>📦</span>
                  per {product.unit}
                  {cartQuantity > 0 && (
                    <span style={{
                      background: '#B91C1C', color: '#fff',
                      borderRadius: '999px', fontSize: '10px', fontWeight: 800,
                      padding: '1px 6px', marginLeft: '2px',
                    }}>{cartQuantity}</span>
                  )}
                </button>

                {variants.map(v => {
                  const vCartItem = items.find(i => i.productId === product.id && i.variantId === v.id)
                  const isActive = selectedVariantId === v.id
                  return (
                    <button
                      key={v.id}
                      type="button"
                      className={`bulk-card${isActive ? ' active' : ''}`}
                      onClick={(e) => { setSelectedVariantId(v.id); (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }) }}
                    >
                      {/* Variant image */}
                      <div style={{ position: 'relative', width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', background: '#f9f9f9', border: '1px solid #e5e7eb', flexShrink: 0 }}>
                        {v.imageUrl ? (
                          <Image src={v.imageUrl} alt={`${v.quantity} ${v.unit}`} fill style={{ objectFit: 'cover' }} sizes="52px" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📦</div>
                        )}
                        {vCartItem && vCartItem.quantity > 0 && (
                          <div style={{
                            position: 'absolute', top: '2px', right: '2px',
                            background: '#B91C1C', color: '#fff',
                            borderRadius: '999px', fontSize: '9px', fontWeight: 800,
                            padding: '1px 5px', lineHeight: 1.4,
                          }}>{vCartItem.quantity}</div>
                        )}
                      </div>

                      {/* Qty + unit */}
                      <span style={{ fontSize: '12px', fontWeight: 800, color: isActive ? '#B91C1C' : '#1a1a1a', lineHeight: 1.2 }}>
                        {v.quantity} {v.unit}
                      </span>

                      {/* Label badge */}
                      {v.label && (
                        <span style={{
                          fontSize: '9px', fontWeight: 700,
                          background: isActive ? '#B91C1C' : '#f3f4f6',
                          color: isActive ? '#fff' : '#6b7280',
                          borderRadius: '4px', padding: '2px 5px',
                          letterSpacing: '0.3px',
                          maxWidth: '80px', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          display: 'block',
                        }}>
                          {v.label}
                        </span>
                      )}

                      {/* Price */}
                      {v.price !== null && v.price !== undefined && (
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803d' }}>
                          ₹{v.price.toFixed(0)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Price box */}
          <div style={{
            background: '#FEF2F2', borderRadius: '8px', padding: '14px 18px',
            display: 'flex', alignItems: 'baseline', gap: '8px',
            border: '1px solid #FECACA',
          }}>
            {activePrice > 0 ? (
              <>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', color: '#B91C1C',
                  lineHeight: 1, letterSpacing: '1px',
                }}>₹{activePrice.toFixed(0)}</span>
                <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>
                  {selectedVariant
                    ? `/ ${selectedVariant.quantity} ${selectedVariant.unit}`
                    : `/ ${product.unit}`}
                </span>
              </>
            ) : (
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.6rem', color: '#B91C1C', letterSpacing: '1px',
              }}>{t.callForPrice}</span>
            )}
          </div>

          {/* Cart controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <AddToCartButton
                  quantity={activeQty}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                  onSetQuantity={handleSetQty}
                  disabled={!product.inStock}
                />
              </div>
              {activeQty > 0 && (
                <span style={{ color: '#B91C1C', fontWeight: 700, fontSize: '13px' }}>
                  ✓ {activeQty} {selectedVariant ? `× ${selectedVariant.quantity} ${selectedVariant.unit}` : product.unit} {t.itemsAdded}
                </span>
              )}
            </div>
            {activeQty > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: '6px',
                    border: '2px solid #e5e7eb', background: '#fff',
                    fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                    color: '#374151', fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#B91C1C'; (e.currentTarget as HTMLButtonElement).style.color = '#B91C1C' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLButtonElement).style.color = '#374151' }}
                >
                  ← {lang === 'hi' ? 'और देखें' : 'Continue Shopping'}
                </button>
                <a href="/cart" style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  background: '#B91C1C', color: '#fff',
                  padding: '10px 16px', borderRadius: '6px',
                  fontWeight: 700, fontSize: '12px', textDecoration: 'none', transition: 'all 0.15s',
                  fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#991b1b' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#B91C1C' }}
                >
                  🛒 {t.viewOrder}
                </a>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
