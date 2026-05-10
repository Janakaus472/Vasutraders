'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Product } from '@/types/product'
import { useCart } from '@/context/CartContext'
import { CATEGORY_BG } from '@/components/catalog/marketplaceConfig'
import { getDescription } from '@/lib/i18n'
import ProductModal from '@/components/catalog/ProductModal'

export default function RelatedProductsSection({ products }: { products: Product[] }) {
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const [modalProduct, setModalProduct] = useState<Product | null>(null)

  return (
    <>
      <div className="related-grid">
        {products.map(product => {
          const cartItem = items.find(i => i.productId === product.id && !i.variantId)
          const cartQty = cartItem?.quantity || 0
          const hasVariants = (product.bulkVariants?.length ?? 0) > 0
          const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg,#f8f7f4,#efefed)'
          const descEn = getDescription(product.description, 'en')

          const handleAdd = (e: React.MouseEvent) => {
            e.preventDefault()
            if (hasVariants) {
              setModalProduct(product)
            } else {
              addItem(product.id)
            }
          }

          return (
            <div key={product.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', background: '#fff' }}>
              <Link href={`/catalog/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ position: 'relative', aspectRatio: '1/1', background: imgBg }}>
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'contain', padding: '12px' }}
                      sizes="(max-width: 540px) 50vw, (max-width: 1024px) 33vw, 200px"
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '40px' }}>📦</div>
                  )}
                  {hasVariants && (
                    <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: '#1d4ed8', fontSize: '8px', fontWeight: 800, color: '#fff', padding: '3px 7px', borderRadius: '4px', letterSpacing: '0.8px' }}>
                      BULK
                    </div>
                  )}
                  {cartQty > 0 && (
                    <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#DC2626', color: '#fff', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                      {cartQty}
                    </div>
                  )}
                </div>

                <div style={{ padding: '10px 12px 6px' }}>
                  <p style={{ fontWeight: 800, fontSize: '13px', color: '#1a1a1a', margin: '0 0 3px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                  </p>
                  {descEn && (
                    <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {descEn}
                    </p>
                  )}
                  {product.pricePerUnit > 0 ? (
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: '#B91C1C', margin: 0 }}>
                      ₹{product.pricePerUnit.toFixed(0)}{' '}
                      <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'sans-serif', fontWeight: 400 }}>/{product.unit}</span>
                    </p>
                  ) : (
                    <p style={{ color: '#B91C1C', fontWeight: 700, fontSize: '12px', margin: 0 }}>Call for price</p>
                  )}
                </div>
              </Link>

              {product.inStock !== false && (
                <div style={{ padding: '0 10px 10px' }}>
                  {cartQty === 0 || hasVariants ? (
                    <button
                      onClick={handleAdd}
                      style={{
                        width: '100%', padding: '7px 4px', border: 'none', borderRadius: '6px',
                        background: '#FAC41A', color: '#7f1d1d',
                        fontWeight: 800, fontSize: '11px', cursor: 'pointer',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        letterSpacing: '0.5px', textTransform: 'uppercase',
                      }}
                    >
                      {hasVariants ? '+ Options' : '+ Add'}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <button
                          onClick={e => { e.preventDefault(); removeItem(product.id) }}
                          style={{ flex: 1, height: '28px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: '6px 0 0 6px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}
                        >−</button>
                        <span style={{ width: '32px', height: '28px', background: '#DC2626', color: '#fff', fontFamily: "'Bebas Neue', sans-serif", fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                          {cartQty}
                        </span>
                        <button
                          onClick={e => { e.preventDefault(); addItem(product.id) }}
                          style={{ flex: 1, height: '28px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: '0 6px 6px 0', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}
                        >+</button>
                      </div>
                      <button
                        onClick={e => { e.preventDefault(); updateQuantity(product.id, 0) }}
                        title="Remove from cart"
                        style={{ width: '28px', height: '28px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2' }}
                      >
                        <svg width="12" height="12" fill="none" stroke="#DC2626" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {modalProduct && (
        <ProductModal
          product={modalProduct}
          cartQuantity={items.find(i => i.productId === modalProduct.id && !i.variantId)?.quantity || 0}
          onAdd={() => addItem(modalProduct.id)}
          onRemove={() => removeItem(modalProduct.id)}
          onSetQuantity={(qty) => updateQuantity(modalProduct.id, qty)}
          onClose={() => setModalProduct(null)}
        />
      )}
    </>
  )
}
