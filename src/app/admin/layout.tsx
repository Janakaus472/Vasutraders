'use client'

import { useAdminGuard, adminLogout } from '@/hooks/useAdminGuard'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/admin', label: 'Home', icon: '🏠' },
  { href: '/admin/orders', label: 'Orders', icon: '🛒' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/analysis', label: 'Analysis', icon: '📈' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAdmin } = useAdminGuard()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace('/admin/login')
    }
  }, [isLoading, isAdmin, router])

  if (isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-center">
          <div className="text-4xl animate-pulse">🔐</div>
          <p className="mt-2">{isLoading ? 'Checking access…' : 'Redirecting…'}</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    adminLogout()
    router.replace('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`bg-[#1a3c5e] text-white flex flex-col transition-all duration-300 fixed h-full z-30
        ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0 md:w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {sidebarOpen && <span className="font-bold text-lg">Vasu Traders</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/70 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {sidebarOpen ? '✕' : '▶'}
          </button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive ? 'bg-orange-500 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/catalog" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 text-white/70 hover:text-white">
            <span className="text-xl">🏪</span>
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-20 min-w-0">
        {/* Top bar with hamburger */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-700 flex-1">Admin Panel</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}