'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { BUSINESS_NAME } from '@/lib/constants'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { itemCount } = useCart()
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <header className="sticky top-0 z-50 bg-[#1a3c5e] shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/catalog" className="flex items-center gap-3 flex-shrink-0">
          <div className="bg-orange-500 rounded-lg w-9 h-9 flex items-center justify-center font-black text-white text-lg shadow">
            V
          </div>
          <div className="leading-tight">
            <div className="text-white font-black text-base tracking-tight">{BUSINESS_NAME}</div>
            <div className="text-blue-300 text-[11px] font-medium">Wholesale Supplier · Indore</div>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1 flex-1 justify-center">
          <Link href="/catalog" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/catalog' ? 'bg-white/20 text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'}`}>
            Products
          </Link>
          <Link href="/cart" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/cart' ? 'bg-white/20 text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'}`}>
            My Order
          </Link>
          {!isAdmin && (
            <Link href="/admin" className="text-blue-300/60 hover:text-blue-200 text-xs px-3 py-2 transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {/* Cart button */}
        <Link
          href="/cart"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-lg transition-colors shadow flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm">Order</span>
          {itemCount > 0 && (
            <span className="bg-white text-orange-600 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center leading-none">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
