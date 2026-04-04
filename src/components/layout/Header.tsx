'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { BUSINESS_NAME } from '@/lib/constants'

export default function Header() {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-[#1a3c5e] shadow-lg">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/catalog" className="flex items-center gap-3">
          <div className="bg-orange-500 rounded-lg w-9 h-9 flex items-center justify-center text-white font-black text-lg">
            V
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">{BUSINESS_NAME}</div>
            <div className="text-blue-200 text-xs leading-tight">Wholesale Products</div>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-blue-300 hover:text-white text-sm transition-colors"
          >
            Admin
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            My Order
            {itemCount > 0 && (
              <span className="bg-white text-orange-600 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
