'use client'

import { Product } from '@/types/product'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  isAuthenticated: boolean
  cartItems: { productId: string; quantity: number }[]
  onAdd: (productId: string) => void
  onRemove: (productId: string) => void
}

export default function ProductGrid({
  products,
  isAuthenticated,
  cartItems,
  onAdd,
  onRemove,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-3">📦</div>
        <p>No products available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product) => {
        const cartItem = cartItems.find((i) => i.productId === product.id)
        return (
          <ProductCard
            key={product.id}
            product={product}
            isAuthenticated={isAuthenticated}
            cartQuantity={cartItem?.quantity || 0}
            onAdd={() => onAdd(product.id)}
            onRemove={() => onRemove(product.id)}
          />
        )
      })}
    </div>
  )
}
