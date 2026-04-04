'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'

export default function BottomNav() {
  const pathname = usePathname()
  const { itemCount } = useCart()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="max-w-lg mx-auto flex">
        <Link
          href="/catalog"
          className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
            pathname === '/catalog' ? 'text-orange-500' : 'text-gray-400'
          }`}
        >
          <span className="text-xl">🏪</span>
          Products
        </Link>
        <Link
          href="/cart"
          className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium relative transition-colors ${
            pathname === '/cart' ? 'text-orange-500' : 'text-gray-400'
          }`}
        >
          <span className="text-xl relative">
            🛍️
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </span>
          My Order
        </Link>
      </div>
    </nav>
  )
}
