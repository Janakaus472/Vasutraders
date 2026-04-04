'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useProducts } from '@/hooks/useProducts'
import WhatsAppOrderButton from '@/components/cart/WhatsAppOrderButton'

export default function CartPage() {
  const { items, addItem, removeItem, clearCart } = useCart()
  const { products } = useProducts()

  const cartProducts = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product ? { ...item, product } : null
    })
    .filter(Boolean) as { productId: string; quantity: number; product: (typeof products)[0] }[]

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-3">Your order is empty</h2>
        <p className="text-gray-400 mb-8">Add products from the catalog to place an order</p>
        <Link
          href="/catalog"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl inline-block text-lg transition-colors"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  const total = cartProducts.reduce(
    (sum, item) => sum + item.product.pricePerUnit * item.quantity,
    0
  )
  const hasPrice = cartProducts.some((i) => i.product.pricePerUnit > 0)

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Order</h1>
        <button onClick={clearCart} className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors">
          Clear all
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <div className="col-span-6">Product</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Subtotal</div>
        </div>

        {/* Rows */}
        {cartProducts.map(({ productId, quantity, product }) => (
          <div key={productId} className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-gray-100 last:border-0">
            {/* Product */}
            <div className="col-span-6 flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                <Image
                  src={product.imageUrl || '/placeholder-product.png'}
                  alt={product.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">per {product.unit}</p>
              </div>
            </div>

            {/* Price */}
            <div className="col-span-2 text-center">
              {product.pricePerUnit > 0 ? (
                <span className="font-semibold text-gray-700">₹{product.pricePerUnit.toFixed(0)}</span>
              ) : (
                <span className="text-orange-500 text-sm font-medium">On Request</span>
              )}
            </div>

            {/* Qty stepper */}
            <div className="col-span-2 flex items-center justify-center">
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => removeItem(productId)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-lg transition-colors"
                >
                  −
                </button>
                <span className="px-3 font-bold text-gray-900 min-w-[2rem] text-center">{quantity}</span>
                <button
                  onClick={() => addItem(productId)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Subtotal */}
            <div className="col-span-2 text-right">
              {product.pricePerUnit > 0 ? (
                <span className="font-bold text-green-700">₹{(product.pricePerUnit * quantity).toFixed(0)}</span>
              ) : (
                <span className="text-gray-400 text-sm">—</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary + order */}
      <div className="flex items-start justify-between gap-8">
        <div className="flex-1">
          <p className="text-gray-500 text-sm">
            Items will be confirmed with Vasu Traders after sending your order on WhatsApp.
          </p>
        </div>
        <div className="w-72 flex-shrink-0">
          {hasPrice && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Items ({cartProducts.length})</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-200 pt-2 mt-2">
                <span>Estimated Total</span>
                <span className="text-green-700">₹{total.toFixed(0)}</span>
              </div>
            </div>
          )}
          <WhatsAppOrderButton cart={items} products={products} />
        </div>
      </div>
    </div>
  )
}
