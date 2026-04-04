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

export default function ProductCard({ product, cartQuantity, onAdd, onRemove }: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative bg-gray-50" style={{ paddingTop: '75%' }}>
        <Image
          src={product.imageUrl || '/placeholder-product.png'}
          alt={product.name}
          fill
          className="object-contain p-2"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </p>

        <div className="flex items-end justify-between mt-auto pt-1">
          <div>
            {product.pricePerUnit > 0 ? (
              <>
                <p className="text-green-700 font-black text-xl leading-none">
                  ₹{product.pricePerUnit.toFixed(0)}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">per {product.unit}</p>
              </>
            ) : (
              <>
                <p className="text-orange-500 font-bold text-sm">Call for Price</p>
                <p className="text-gray-400 text-xs mt-0.5">per {product.unit}</p>
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
