'use client'

import { Product } from '@/types/product'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  cartItems: { productId: string; quantity: number }[]
  onAdd: (productId: string) => void
  onRemove: (productId: string) => void
}

export default function ProductGrid({ products, cartItems, onAdd, onRemove }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-24 text-gray-400">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-lg">No products in this category</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => {
        const cartItem = cartItems.find((i) => i.productId === product.id)
        return (
          <ProductCard
            key={product.id}
            product={product}
            cartQuantity={cartItem?.quantity || 0}
            onAdd={() => onAdd(product.id)}
            onRemove={() => onRemove(product.id)}
          />
        )
      })}
    </div>
  )
}
