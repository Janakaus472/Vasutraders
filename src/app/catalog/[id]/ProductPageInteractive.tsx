'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/types/product'
import { useCart } from '@/context/CartContext'
import AddToCartButton from '@/components/catalog/AddToCartButton'
import { CATEGORY_BG } from '@/components/catalog/marketplaceConfig'

export default function ProductPageInteractive({ product }: { product: Product }) {
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const variants = product.bulkVariants || []
  const gallery = product.galleryImages || []

  // null = base product, string = variant id, 'gallery-N' = gallery image N
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
  const selectedVariant = variants.find(v => v.id === selectedVariantId) ?? null

  // Active image: gallery image > variant image > base image
  const activeImage =
    galleryIndex !== null
      ? gallery[galleryIndex]
      : selectedVariant?.imageUrl || product.imageUrl
  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg,#f8f7f4,#efefed)'

  const selectVariant = (id: string | null) => {
    setSelectedVariantId(id)
    setGalleryIndex(null)
  }

  // Cart quantities
  const baseCartItem = items.find(i => i.productId === product.id && !i.variantId)
  const variantCartItem = selectedVariantId
    ? items.find(i => i.productId === product.id && i.variantId === selectedVariantId)
    : null
  const activeQty = selectedVariantId ? (variantCartItem?.quantity || 0) : (baseCartItem?.quantity || 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Main image — reactive to selected variant ── */}
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

        {/* Thumbnail strip — shows when there are gallery images or bulk variants */}
        {(gallery.length > 0 || variants.length > 0) && (
          <div style={{
            position: 'absolute', bottom: '10px', left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: '6px', padding: '0 10px',
            flexWrap: 'wrap',
          }}>
            {/* Base product thumb */}
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

            {/* Gallery image thumbs */}
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

            {/* Variant thumbs */}
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

      {/* ── Bulk variant selector ── */}
      {variants.length > 0 && (
        <div style={{ borderRadius: '14px', border: '2px solid #BFDBFE', overflow: 'hidden' }}>

          <div style={{ background: '#EFF6FF', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📦</span>
            <div>
              <p style={{ fontWeight: 800, color: '#1e40af', fontSize: '13px', margin: 0 }}>Also Available in Bulk</p>
              <p style={{ color: '#3b82f6', fontSize: '11px', margin: 0 }}>Select a pack size — image updates above</p>
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
              <p style={{ fontWeight: 700, fontSize: '13px', color: '#1a1a1a', margin: 0 }}>
                Standard ({product.unit})
              </p>
              {product.pricePerUnit > 0 && (
                <p style={{ color: '#B91C1C', fontWeight: 800, fontSize: '12px', margin: 0 }}>₹{product.pricePerUnit.toFixed(0)} / {product.unit}</p>
              )}
            </div>
          </div>

          {/* Bulk variants */}
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

      {/* ── Add to cart ── */}
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
  )
}
