'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { BUSINESS_NAME } from '@/lib/constants'

export default function Header() {
  const { itemCount } = useCart()
  const { customer, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/catalog" className="font-bold text-lg text-orange-600">
          🛒 {BUSINESS_NAME}
        </Link>
        <div className="flex items-center gap-3">
          {customer ? (
            <button onClick={logout} className="text-gray-400 text-xs hover:text-gray-600">
              Sign out
            </button>
          ) : (
            <Link href="/auth" className="text-orange-500 text-sm font-medium">
              Enter Mobile to See Price
            </Link>
          )}
          <Link href="/cart" className="relative">
            <span className="text-2xl">🛍️</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
