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
    <div className="bg-white rounded-lg border border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Image */}
      <div className="relative bg-gray-50 overflow-hidden" style={{ height: '200px' }}>
        <Image
          src={product.imageUrl || '/placeholder-product.png'}
          alt={product.name}
          fill
          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 33vw"
          onError={(e) => {
            const t = e.target as HTMLImageElement
            t.src = '/placeholder-product.png'
          }}
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">OUT OF STOCK</span>
          </div>
        )}
        {cartQuantity > 0 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
            {cartQuantity}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2" style={{ minHeight: '2.5rem' }}>
            {product.name}
          </p>
          {product.description && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-1">{product.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div>
            {product.pricePerUnit > 0 ? (
              <>
                <p className="text-green-600 font-black text-xl leading-none">₹{product.pricePerUnit.toFixed(0)}</p>
                <p className="text-gray-400 text-xs mt-0.5">per {product.unit}</p>
              </>
            ) : (
              <>
                <p className="text-orange-500 font-semibold text-sm">Call for Price</p>
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
