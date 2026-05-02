'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/types/product'
import { useCart } from '@/context/CartContext'
import AddToCartButton from '@/components/catalog/AddToCartButton'
import { CATEGORY_BG } from '@/components/catalog/marketplaceConfig'
import { WHATSAPP_NUMBER } from '@/lib/constants'
import { getDescription } from '@/lib/i18n'

export default function ProductPageInteractive({ product }: { product: Product }) {
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const variants = product.bulkVariants || []
  const gallery = product.galleryImages || []

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
  const selectedVariant = variants.find(v => v.id === selectedVariantId) ?? null

  const activeImage =
    galleryIndex !== null
      ? gallery[galleryIndex]
      : selectedVariant?.imageUrl || product.imageUrl
  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg,#f8f7f4,#efefed)'

  const selectVariant = (id: string | null) => {
    setSelectedVariantId(id)
    setGalleryIndex(null)
  }

  const baseCartItem = items.find(i => i.productId === product.id && !i.variantId)
  const variantCartItem = selectedVariantId
    ? items.find(i => i.productId === product.id && i.variantId === selectedVariantId)
    : null
  const activeQty = selectedVariantId ? (variantCartItem?.quantity || 0) : (baseCartItem?.quantity || 0)

  const displayName = selectedVariant
    ? (selectedVariant.label || `${product.name} — ${selectedVariant.quantity} ${selectedVariant.unit}`)
    : product.name
  const displayPrice = selectedVariant
    ? (selectedVariant.price ?? null)
    : (product.pricePerUnit > 0 ? product.pricePerUnit : null)
  const displayUnit = selectedVariant ? selectedVariant.unit : product.unit
  const displayMinQty = selectedVariant ? selectedVariant.quantity : product.minOrderQty

  const descEn = getDescription(product.description, 'en')
  const descHi = getDescription(product.description, 'hi')

  const whatsappText = selectedVariant
    ? `Hi, I'd like to order ${product.name} — ${selectedVariant.label || `${selectedVariant.quantity} ${selectedVariant.unit}`} from Vasu Traders.`
    : `Hi, I'd like to order ${product.name} (${product.minOrderQty}+ ${product.unit}) from Vasu Traders.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* ── Category badges + Product name — always above the image ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {product.category && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ background: '#FEF2F2', color: '#B91C1C', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>
              {product.category}
            </span>
            {product.subcategory && (
              <span style={{ background: '#EFF6FF', color: '#1d4ed8', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
                {product.subcategory}
              </span>
            )}
          </div>
        )}
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(26px, 6vw, 40px)', color: '#1a1a1a', lineHeight: 1.1, margin: 0 }}>
          {displayName}
        </h1>
      </div>

      {/* ── Two-column grid: image left, details right ── */}
      <div className="product-page-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '24px' }}>

        {/* Left column: image + bulk selector + cart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Main image */}
          <div style={{
            position: 'relative', borderRadius: '16px', overflow: 'hidden',
            background: imgBg, aspectRatio: '1/1', minHeight: '260px',
          }}>
            {activeImage ? (
              <Image
                key={activeImage}
                src={activeImage}
                alt={selectedVariant ? `${product.name} — ${selectedVariant.quantity} ${selectedVariant.unit}` : product.name}
                fill
                style={{ objectFit: 'contain', padding: '24px', transition: 'opacity 0.2s' }}
                sizes="(max-width: 640px) 100vw, 50vw"
                priority
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '80px' }}>🛒</div>
            )}
            {!product.inStock && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ background: '#DC2626', color: '#fff', fontWeight: 800, padding: '8px 20px', borderRadius: '6px', letterSpacing: '1.5px', fontSize: '13px' }}>
                  OUT OF STOCK
                </span>
              </div>
            )}

            {/* Thumbnail strip */}
            {(gallery.length > 0 || variants.length > 0) && (
              <div style={{
                position: 'absolute', bottom: '10px', left: 0, right: 0,
                display: 'flex', justifyContent: 'center', gap: '6px', padding: '0 10px',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => selectVariant(null)}
                  style={{
                    width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden',
                    border: `2px solid ${selectedVariantId === null && galleryIndex === null ? '#1d4ed8' : 'rgba(255,255,255,0.6)'}`,
                    background: imgBg, padding: 0, cursor: 'pointer', position: 'relative', flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {product.imageUrl && (
                    <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: 'contain', padding: '4px' }} sizes="44px" />
                  )}
                </button>

                {gallery.map((url, idx) => (
                  <button
                    key={`gallery-${idx}`}
                    onClick={() => { setGalleryIndex(idx); setSelectedVariantId(null) }}
                    style={{
                      width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden',
                      border: `2px solid ${galleryIndex === idx ? '#1d4ed8' : 'rgba(255,255,255,0.6)'}`,
                      background: imgBg, padding: 0, cursor: 'pointer', position: 'relative', flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    <Image src={url} alt={`${product.name} image ${idx + 2}`} fill style={{ objectFit: 'cover' }} sizes="44px" />
                  </button>
                ))}

                {variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => selectVariant(v.id)}
                    style={{
                      width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden',
                      border: `2px solid ${selectedVariantId === v.id ? '#1d4ed8' : 'rgba(255,255,255,0.6)'}`,
                      background: imgBg, padding: 0, cursor: 'pointer', position: 'relative', flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    {(v.imageUrl || product.imageUrl) && (
                      <Image src={v.imageUrl || product.imageUrl} alt={`${v.quantity} ${v.unit}`} fill style={{ objectFit: 'contain', padding: '4px' }} sizes="44px" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bulk variant selector */}
          {variants.length > 0 && (
            <div style={{ borderRadius: '14px', border: '2px solid #BFDBFE', overflow: 'hidden' }}>
              <div style={{ background: '#EFF6FF', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📦</span>
                <div>
                  <p style={{ fontWeight: 800, color: '#1e40af', fontSize: '13px', margin: 0 }}>Also Available in Bulk</p>
                  <p style={{ color: '#3b82f6', fontSize: '11px', margin: 0 }}>Select a pack size — price and info update</p>
                </div>
              </div>

              {/* Base product option */}
              <div
                onClick={() => selectVariant(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  cursor: 'pointer', borderBottom: '1px solid #E0ECFF',
                  background: selectedVariantId === null ? '#F0F7FF' : '#fff',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${selectedVariantId === null ? '#1d4ed8' : '#d1d5db'}`,
                  background: selectedVariantId === null ? '#1d4ed8' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {selectedVariantId === null && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', display: 'block' }} />}
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: imgBg, position: 'relative' }}>
                  {product.imageUrl && <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: 'contain', padding: '4px' }} sizes="40px" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: '13px', color: '#1a1a1a', margin: 0 }}>Standard ({product.unit})</p>
                  {product.pricePerUnit > 0 && (
                    <p style={{ color: '#B91C1C', fontWeight: 800, fontSize: '12px', margin: 0 }}>₹{product.pricePerUnit.toFixed(0)} / {product.unit}</p>
                  )}
                </div>
              </div>

              {variants.map((v, i) => (
                <div
                  key={v.id}
                  onClick={() => selectVariant(v.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: i < variants.length - 1 ? '1px solid #E0ECFF' : 'none',
                    background: selectedVariantId === v.id ? '#F0F7FF' : '#fff',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${selectedVariantId === v.id ? '#1d4ed8' : '#d1d5db'}`,
                    background: selectedVariantId === v.id ? '#1d4ed8' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selectedVariantId === v.id && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', display: 'block' }} />}
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: imgBg, position: 'relative' }}>
                    {(v.imageUrl || product.imageUrl) && (
                      <Image src={v.imageUrl || product.imageUrl} alt={`${v.quantity} ${v.unit}`} fill style={{ objectFit: 'contain', padding: '4px' }} sizes="40px" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '13px', color: '#1a1a1a', margin: 0 }}>
                      {v.label || `${v.quantity} ${v.unit}`}
                    </p>
                    {v.label && (
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{v.quantity} {v.unit}</p>
                    )}
                    {v.price != null ? (
                      <p style={{ color: '#B91C1C', fontWeight: 800, fontSize: '12px', margin: 0 }}>₹{v.price.toFixed(0)} total</p>
                    ) : product.pricePerUnit > 0 ? (
                      <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Price on request</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add to cart */}
          {product.inStock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AddToCartButton
                quantity={activeQty}
                onAdd={() => selectedVariantId ? addItem(product.id, selectedVariantId) : addItem(product.id)}
                onRemove={() => selectedVariantId ? removeItem(product.id, selectedVariantId) : removeItem(product.id)}
                onSetQuantity={n => selectedVariantId ? updateQuantity(product.id, n, selectedVariantId) : updateQuantity(product.id, n)}
              />
              {activeQty > 0 && (
                <span style={{ color: '#6b7280', fontSize: '13px' }}>
                  {activeQty} {selectedVariant ? selectedVariant.unit : product.unit} in cart
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right column: description + price + WhatsApp */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Description */}
          {descEn && (
            <div style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.7 }}>
              {descEn.split('\n').map((line, i) => (
                <p key={i} style={{ margin: i === 0 ? 0 : '4px 0 0' }}>{line}</p>
              ))}
            </div>
          )}
          {descHi && descHi !== descEn && (
            <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.7, fontFamily: 'sans-serif' }}>
              {descHi.split('\n').map((line, i) => (
                <p key={i} style={{ margin: i === 0 ? 0 : '4px 0 0' }}>{line}</p>
              ))}
            </div>
          )}

          {/* Price */}
          <div style={{ background: '#FFF8F0', borderRadius: '12px', padding: '16px' }}>
            {displayPrice != null && displayPrice > 0 ? (
              <>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#B91C1C', margin: 0, lineHeight: 1 }}>
                  ₹{displayPrice.toFixed(0)}
                </p>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
                  {selectedVariant
                    ? `for ${displayMinQty} ${displayUnit}`
                    : `per ${displayUnit} · Min order: ${displayMinQty} ${displayUnit}`
                  }
                </p>
              </>
            ) : (
              <p style={{ color: '#B91C1C', fontWeight: 800, fontSize: '15px', margin: 0 }}>
                Call for price · Min order: {displayMinQty} {displayUnit}
              </p>
            )}
          </div>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: '#25D366', color: '#fff', fontWeight: 800, fontSize: '15px',
              padding: '14px', borderRadius: '12px', textDecoration: 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Order on WhatsApp
          </a>

        </div>
      </div>
    </div>
  )
}
