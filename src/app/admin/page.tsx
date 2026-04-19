'use client'

import { useState, useEffect } from 'react'
import { getProducts } from '@/lib/supabase/products'
import { Product } from '@/types/product'
import Link from 'next/link'

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts(true).then(setProducts).catch(console.error).finally(() => setLoading(false))
  }, [])

  const active = products.filter(p => p.inStock).length
  const hidden = products.filter(p => !p.inStock).length
  const noPrice = products.filter(p => !p.pricePerUnit || p.pricePerUnit === 0).length
  const noCategory = products.filter(p => !p.category).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <span className="text-gray-400 text-sm">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Products" value={loading ? '…' : products.length} icon="📦" color="bg-orange-50 border-orange-100" />
        <StatCard label="Active" value={loading ? '…' : active} icon="✅" color="bg-green-50 border-green-100" />
        <StatCard label="Hidden" value={loading ? '…' : hidden} icon="👁️" color="bg-gray-50 border-gray-200" />
        <StatCard label="No Price" value={loading ? '…' : noPrice} icon="⚠️" color="bg-yellow-50 border-yellow-100" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/admin/products/new"
            className="flex items-center gap-3 p-4 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors">
            <span className="text-2xl">➕</span>
            <div>
              <div className="font-bold">Add Product</div>
              <div className="text-orange-100 text-xs">Under 30 seconds</div>
            </div>
          </Link>
          <Link href="/admin/products?bulk=1"
            className="flex items-center gap-3 p-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors">
            <span className="text-2xl">💰</span>
            <div>
              <div className="font-bold">Bulk Price Update</div>
              <div className="text-blue-100 text-xs">Edit all prices at once</div>
            </div>
          </Link>
          <Link href="/admin/products"
            className="flex items-center gap-3 p-4 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors">
            <span className="text-2xl">📋</span>
            <div>
              <div className="font-bold">Manage Products</div>
              <div className="text-purple-100 text-xs">{loading ? '…' : `${products.length} products`}</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {!loading && (noPrice > 0 || noCategory > 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Needs Attention</h2>
          <div className="space-y-2">
            {noPrice > 0 && (
              <Link href="/admin/products?filter=noprice"
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span className="text-sm font-medium text-yellow-800">{noPrice} products have no price set</span>
                </div>
                <span className="text-yellow-500 text-sm">Fix →</span>
              </Link>
            )}
            {noCategory > 0 && (
              <Link href="/admin/products?filter=nocategory"
                className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-2">
                  <span>🏷️</span>
                  <span className="text-sm font-medium text-orange-800">{noCategory} products have no category</span>
                </div>
                <span className="text-orange-500 text-sm">Fix →</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className={`${color} border rounded-2xl p-4`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  )
}
