'use client'

import { Product } from '@/types/product'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  cartItems: { productId: string; quantity: number }[]
  onAdd: (productId: string) => void
  onRemove: (productId: string) => void
  onOpen: (product: Product) => void
  noProductsLabel?: string
}

export default function ProductGrid({ products, cartItems, onAdd, onRemove, onOpen, noProductsLabel = 'No products found' }: ProductGridProps) {
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
          gap: 20px;
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
          const cartItem = cartItems.find((i) => i.productId === product.id)
          return (
            <ProductCard
              key={product.id}
              product={product}
              cartQuantity={cartItem?.quantity || 0}
              onAdd={() => onAdd(product.id)}
              onRemove={() => onRemove(product.id)}
              onOpen={() => onOpen(product)}
              index={index}
            />
          )
        })}
      </div>
    </>
  )
}
