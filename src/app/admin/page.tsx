'use client'

import Link from 'next/link'
import { useProducts } from '@/hooks/useProducts'
import ProductTable from '@/components/admin/ProductTable'

export default function AdminDashboard() {
  const { products, isLoading, refetch } = useProducts(true)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading products…</div>
      ) : (
        <ProductTable products={products} onRefresh={refetch} />
      )}
    </div>
  )
}
