'use client'

import { Product } from '@/types/product'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  cartItems: { productId: string; quantity: number }[]
  onAdd: (productId: string) => void
  onRemove: (productId: string) => void
  onSetQuantity?: (productId: string, qty: number) => void
  onOpen: (product: Product) => void
  noProductsLabel?: string
  hideCategory?: boolean
}

export default function ProductGrid({ products, cartItems, onAdd, onRemove, onSetQuantity, onOpen, noProductsLabel = 'No products found', hideCategory = false }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📦</div>
        <p style={{ fontSize: '18px', fontWeight: 600 }}>{noProductsLabel}</p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .product-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 540px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }
        @media (min-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }
      `}</style>
      <div className="product-grid">
        {products.map((product, index) => {
          const hasVariants = (product.bulkVariants?.length ?? 0) > 0
          const baseCartItem = cartItems.find((i) => i.productId === product.id && !('variantId' in i && i.variantId))
          const baseQty = baseCartItem?.quantity || 0
          // For variant products show total qty across all variants so the badge is accurate
          const totalCartQty = hasVariants
            ? cartItems.filter(i => i.productId === product.id).reduce((s, i) => s + i.quantity, 0)
            : baseQty
          return (
            <ProductCard
              key={product.id}
              product={product}
              cartQuantity={totalCartQty}
              onAdd={() => {
                // Variant products always open modal — card +/− controls only manage base
                if (hasVariants) { onOpen(product); return }
                onAdd(product.id)
              }}
              onRemove={() => {
                if (hasVariants) { onOpen(product); return }
                onRemove(product.id)
              }}
              onSetQuantity={hasVariants ? undefined : (onSetQuantity ? (qty) => onSetQuantity(product.id, qty) : undefined)}
              onOpen={() => onOpen(product)}
              index={index}
              hideCategory={hideCategory}
            />
          )
        })}
      </div>
    </>
  )
}
