'use client'

import { useAdminGuard } from '@/hooks/useAdminGuard'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAdmin } = useAdminGuard()

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
    <div>
      <div className="bg-[#1a3c5e] text-white px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-sm">⚙️ Admin Panel — Vasu Traders</span>
        <Link href="/catalog" className="text-blue-200 text-sm hover:text-white">
          ← Back to Store
        </Link>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-6">{children}</div>
    </div>
  )
}
