'use client'

import { useAdminGuard } from '@/hooks/useAdminGuard'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/orders', label: 'Orders', icon: '🛒' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAdmin } = useAdminGuard()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-center">
          <div className="text-4xl animate-pulse">🔐</div>
          <p className="mt-2">Checking access…</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1a3c5e] text-white flex flex-col transition-all duration-300 fixed h-full z-10`}>
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {sidebarOpen && <span className="font-bold text-lg">Vasu Traders</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/70 hover:text-white">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive ? 'bg-orange-500 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/catalog" className="flex items-center gap-3 text-white/70 hover:text-white">
            <span className="text-xl">🏪</span>
            {sidebarOpen && <span>Back to Store</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}