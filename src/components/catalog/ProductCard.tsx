'use client'

import Image from 'next/image'
import { Product } from '@/types/product'
import AddToCartButton from './AddToCartButton'

interface ProductCardProps {
  product: Product
  cartQuantity: number
  onAdd: () => void
  onRemove: () => void
}

const CATEGORY_BG: Record<string, string> = {
  'Playing Cards': '#fef3e2',
  'Party Balloons': '#fce7f3',
  'Kanche & Glass Balls': '#e0f2fe',
  'Sports & Games': '#dcfce7',
  'Rubber Bands': '#fef9c3',
  'Spurs': '#f3e8ff',
  'Poker Chips': '#fee2e2',
  'Toothbrushes': '#e0fdf4',
  'Burnt Balls': '#f1f5f9',
}

export default function ProductCard({ product, cartQuantity, onAdd, onRemove }: ProductCardProps) {
  const imgBg = CATEGORY_BG[product.category] || '#f8f7f4'
  const isInCart = cartQuantity > 0

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isInCart
          ? '0 0 0 2px #FF6B00, 0 8px 24px rgba(255,107,0,0.15)'
          : '0 2px 12px rgba(15,39,68,0.06)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'default',
        position: 'relative',
      }}
      onMouseOver={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-3px)'
        el.style.boxShadow = isInCart
          ? '0 0 0 2px #FF6B00, 0 16px 32px rgba(255,107,0,0.2)'
          : '0 8px 28px rgba(15,39,68,0.14)'
      }}
      onMouseOut={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = isInCart
          ? '0 0 0 2px #FF6B00, 0 8px 24px rgba(255,107,0,0.15)'
          : '0 2px 12px rgba(15,39,68,0.06)'
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', background: imgBg, height: '190px', overflow: 'hidden' }}>
        <Image
          src={product.imageUrl || '/placeholder-product.png'}
          alt={product.name}
          fill
          className="object-contain"
          style={{ padding: '16px', transition: 'transform 0.35s ease' }}
          sizes="(max-width: 768px) 50vw, 25vw"
          onError={(e) => {
            const t = e.target as HTMLImageElement
            t.src = '/placeholder-product.png'
          }}
        />

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              background: '#ef4444', color: '#fff',
              fontSize: '10px', fontWeight: 800,
              padding: '4px 12px', borderRadius: '20px',
              letterSpacing: '1px', textTransform: 'uppercase',
            }}>Out of Stock</span>
          </div>
        )}

        {/* Cart qty badge */}
        {cartQuantity > 0 && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: '#FF6B00', color: '#fff',
            fontSize: '11px', fontWeight: 800,
            width: '24px', height: '24px',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(255,107,0,0.5)',
          }}>
            {cartQuantity}
          </div>
        )}

        {/* Category tag */}
        {product.category && (
          <div style={{
            position: 'absolute', bottom: '8px', left: '8px',
            background: 'rgba(255,255,255,0.9)',
            fontSize: '10px', fontWeight: 600,
            color: '#374151',
            padding: '2px 8px', borderRadius: '20px',
            backdropFilter: 'blur(4px)',
          }}>
            {product.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontWeight: 700, color: '#111827',
            fontSize: '13px', lineHeight: '1.4',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            minHeight: '36px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {product.name}
          </p>
          {product.description && (
            <p style={{
              color: '#9ca3af', fontSize: '11px', marginTop: '4px',
              display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {product.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
          <div>
            {product.pricePerUnit > 0 ? (
              <>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: '#15803d', lineHeight: 1, letterSpacing: '0.5px' }}>
                  ₹{product.pricePerUnit.toFixed(0)}
                </p>
                <p style={{ color: '#9ca3af', fontSize: '10px', marginTop: '2px' }}>
                  per {product.unit}
                </p>
              </>
            ) : (
              <>
                <p style={{ color: '#FF6B00', fontWeight: 700, fontSize: '12px' }}>Call for Price</p>
                <p style={{ color: '#9ca3af', fontSize: '10px', marginTop: '2px' }}>per {product.unit}</p>
              </>
            )}
          </div>

          <AddToCartButton
            quantity={cartQuantity}
            onAdd={onAdd}
            onRemove={onRemove}
            disabled={!product.inStock}
          />
        </div>
      </div>
    </div>
  )
}
