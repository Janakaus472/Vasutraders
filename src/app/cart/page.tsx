'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/hooks/useProducts'
import WhatsAppOrderButton from '@/components/cart/WhatsAppOrderButton'

export default function CartPage() {
  const { items, addItem, removeItem, clearCart } = useCart()
  const { firebaseUser } = useAuth()
  const { products } = useProducts()

  const cartProducts = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product ? { ...item, product } : null
    })
    .filter(Boolean) as { productId: string; quantity: number; product: (typeof products)[0] }[]

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-16 pb-24 text-center">
        <div className="text-6xl mb-4">🛍️</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Your order is empty</h2>
        <p className="text-gray-400 mb-6">Add products from the catalog</p>
        <Link
          href="/catalog"
          className="bg-orange-500 text-white font-semibold px-8 py-3 rounded-xl inline-block"
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

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-32">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">My Order</h1>
        <button onClick={clearCart} className="text-red-400 text-sm hover:text-red-600">
          Clear all
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {cartProducts.map(({ productId, quantity, product }) => (
          <div key={productId} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
              <Image
                src={product.imageUrl || '/placeholder-product.png'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
              {firebaseUser && (
                <p className="text-orange-600 text-sm font-medium">
                  ${(product.pricePerUnit * quantity).toFixed(2)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 bg-orange-500 rounded-xl px-2">
              <button
                onClick={() => removeItem(productId)}
                className="text-white text-xl font-bold py-1 px-2"
              >
                −
              </button>
              <span className="text-white font-bold w-5 text-center">{quantity}</span>
              <button
                onClick={() => addItem(productId)}
                className="text-white text-xl font-bold py-1 px-2"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {firebaseUser && (
        <div className="bg-orange-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between font-bold text-gray-900">
            <span>Estimated Total</span>
            <span className="text-orange-600">${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {firebaseUser ? (
        <WhatsAppOrderButton
          cart={items}
          products={products}
          customerPhone={firebaseUser.phoneNumber || ''}
        />
      ) : (
        <Link
          href="/auth?returnTo=/cart"
          className="block w-full bg-orange-500 text-white font-bold py-4 rounded-2xl text-lg text-center"
        >
          Enter Mobile to Place Order
        </Link>
      )}
    </div>
  )
}
