'use client'

import { useProducts } from '@/hooks/useProducts'
import Link from 'next/link'

export default function AdminDashboard() {
  const { products, isLoading } = useProducts(true)

  const totalProducts = products.length
  const activeProducts = products.filter(p => p.inStock).length
  const hiddenProducts = products.filter(p => !p.inStock).length
  const noPriceProducts = products.filter(p => !p.pricePerUnit || p.pricePerUnit === 0).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <span className="text-gray-400 text-sm">
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-orange-50 border-orange-100 border rounded-2xl p-4">
          <div className="text-2xl mb-1">📦</div>
          <div className="text-2xl font-bold text-gray-800">{isLoading ? '…' : totalProducts}</div>
          <div className="text-gray-500 text-sm">Total Products</div>
        </div>
        <div className="bg-green-50 border-green-100 border rounded-2xl p-4">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-2xl font-bold text-gray-800">{isLoading ? '…' : activeProducts}</div>
          <div className="text-gray-500 text-sm">Active</div>
        </div>
        <div className="bg-gray-50 border-gray-200 border rounded-2xl p-4">
          <div className="text-2xl mb-1">👁️</div>
          <div className="text-2xl font-bold text-gray-800">{isLoading ? '…' : hiddenProducts}</div>
          <div className="text-gray-500 text-sm">Hidden</div>
        </div>
        <div className="bg-yellow-50 border-yellow-100 border rounded-2xl p-4">
          <div className="text-2xl mb-1">⚠️</div>
          <div className="text-2xl font-bold text-gray-800">{isLoading ? '…' : noPriceProducts}</div>
          <div className="text-gray-500 text-sm">No Price</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 p-4 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            <span className="text-2xl">➕</span>
            <div>
              <div className="font-bold">Add Product</div>
              <div className="text-orange-100 text-xs">Under 30 seconds</div>
            </div>
          </Link>
          <Link
            href="/admin/products?bulk=1"
            className="flex items-center gap-3 p-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <span className="text-2xl">💰</span>
            <div>
              <div className="font-bold">Bulk Price Update</div>
              <div className="text-blue-100 text-xs">Edit all prices at once</div>
            </div>
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-4 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            <span className="text-2xl">📋</span>
            <div>
              <div className="font-bold">Manage Products</div>
              <div className="text-purple-100 text-xs">{totalProducts} products</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Needs Attention */}
      {noPriceProducts > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Needs Attention</h2>
          <div className="space-y-2">
            <Link
              href="/admin/products?filter=noprice"
              className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100"
            >
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="text-sm font-medium text-yellow-800">
                  {noPriceProducts} products have no price set
                </span>
              </div>
              <span className="text-yellow-500 text-sm">Fix →</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
