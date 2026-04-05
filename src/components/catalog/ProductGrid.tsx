'use client'

import { Product } from '@/types/product'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  cartItems: { productId: string; quantity: number }[]
  onAdd: (productId: string) => void
  onRemove: (productId: string) => void
  noProductsLabel?: string
}

export default function ProductGrid({ products, cartItems, onAdd, onRemove, noProductsLabel = 'No products found' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📦</div>
        <p style={{ fontSize: '16px', fontWeight: 600 }}>{noProductsLabel}</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
      {products.map((product, index) => {
        const cartItem = cartItems.find((i) => i.productId === product.id)
        return (
          <ProductCard
            key={product.id}
            product={product}
            cartQuantity={cartItem?.quantity || 0}
            onAdd={() => onAdd(product.id)}
            onRemove={() => onRemove(product.id)}
            index={index}
          />
        )
      })}
    </div>
  )
}
