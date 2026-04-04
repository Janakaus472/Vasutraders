'use client'

import Image from 'next/image'
import { Product } from '@/types/product'
import PriceGate from './PriceGate'
import AddToCartButton from './AddToCartButton'

interface ProductCardProps {
  product: Product
  isAuthenticated: boolean
  cartQuantity: number
  onAdd: () => void
  onRemove: () => void
}

export default function ProductCard({
  product,
  isAuthenticated,
  cartQuantity,
  onAdd,
  onRemove,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-gray-50">
        <Image
          src={product.imageUrl || '/placeholder-product.png'}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</p>
          <p className="text-gray-400 text-xs mt-0.5">per {product.unit}</p>
        </div>
        {isAuthenticated ? (
          <>
            <p className="text-orange-600 font-bold text-lg">
              ${product.pricePerUnit.toFixed(2)}
            </p>
            <AddToCartButton
              quantity={cartQuantity}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          </>
        ) : (
          <PriceGate />
        )}
      </div>
    </div>
  )
}
