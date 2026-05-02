'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product, BulkVariant } from '@/types/product'
import { useCart } from '@/context/CartContext'
import AddToCartButton from '@/components/catalog/AddToCartButton'
import { CATEGORY_BG } from '@/components/catalog/marketplaceConfig'

export default function ProductPageCart({ product }: { product: Product }) {
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const variants = product.bulkVariants || []

  // null = base product selected, string = variant id
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const selectedVariant = variants.find(v => v.id === selectedVariantId) ?? null

  const baseCartItem = items.find(i => i.productId === product.id && !i.variantId)
  const variantCartItem = selectedVariantId
    ? items.find(i => i.productId === product.id && i.variantId === selectedVariantId)
    : null
  const activeQty = selectedVariantId ? (variantCartItem?.quantity || 0) : (baseCartItem?.quantity || 0)

  const activePrice = selectedVariant?.price != null ? selectedVariant.price : product.pricePerUnit
  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg,#f8f7f4,#efefed)'

  if (!product.inStock) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Bulk variants section ── */}
      {variants.length > 0 && (
        <div style={{ borderRadius: '14px', border: '2px solid #BFDBFE', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ background: '#EFF6FF', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📦</span>
            <div>
              <p style={{ fontWeight: 800, color: '#1e40af', fontSize: '13px', margin: 0 }}>Also Available in Bulk</p>
              <p style={{ color: '#3b82f6', fontSize: '11px', margin: 0 }}>Select a pack size below to order in bulk</p>
            </div>
          </div>

          {/* Base product option */}
          <div
            onClick={() => setSelectedVariantId(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
              cursor: 'pointer', borderBottom: '1px solid #E0ECFF',
              background: selectedVariantId === null ? '#F0F7FF' : '#fff',
              transition: 'background 0.15s',
            }}
          >
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              border: `2px solid ${selectedVariantId === null ? '#1d4ed8' : '#d1d5db'}`,
              background: selectedVariantId === null ? '#1d4ed8' : '#fff',
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selectedVariantId === null && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', display: 'block' }} />}
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: imgBg, position: 'relative' }}>
              {product.imageUrl && (
                <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: 'contain', padding: '4px' }} sizes="44px" />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '13px', color: '#1a1a1a', margin: 0 }}>
                {product.minOrderQty} {product.unit} (Standard)
              </p>
              {product.pricePerUnit > 0 && (
                <p style={{ color: '#B91C1C', fontWeight: 800, fontSize: '12px', margin: 0 }}>₹{product.pricePerUnit.toFixed(0)} / {product.unit}</p>
              )}
            </div>
          </div>

          {/* Bulk variant options */}
          {variants.map((v, i) => (
            <div
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: i < variants.length - 1 ? '1px solid #E0ECFF' : 'none',
                background: selectedVariantId === v.id ? '#F0F7FF' : '#fff',
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                border: `2px solid ${selectedVariantId === v.id ? '#1d4ed8' : '#d1d5db'}`,
                background: selectedVariantId === v.id ? '#1d4ed8' : '#fff',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selectedVariantId === v.id && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', display: 'block' }} />}
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: imgBg, position: 'relative' }}>
                {(v.imageUrl || product.imageUrl) && (
                  <Image src={v.imageUrl || product.imageUrl} alt={`${product.name} ${v.quantity} ${v.unit}`} fill style={{ objectFit: 'contain', padding: '4px' }} sizes="44px" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
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

      {/* ── Add to cart row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AddToCartButton
          quantity={activeQty}
          onAdd={() => selectedVariantId ? addItem(product.id, selectedVariantId) : addItem(product.id)}
          onRemove={() => selectedVariantId ? removeItem(product.id, selectedVariantId) : removeItem(product.id)}
          onSetQuantity={n => selectedVariantId ? updateQuantity(product.id, n, selectedVariantId) : updateQuantity(product.id, n)}
        />
        {activeQty > 0 && (
          <span style={{ color: '#6b7280', fontSize: '13px' }}>
            {activeQty} {selectedVariant ? `${selectedVariant.unit}` : product.unit} in cart
          </span>
        )}
      </div>

    </div>
  )
}
