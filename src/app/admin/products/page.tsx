'use client'

import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import Link from 'next/link'
import { Product } from '@/types/product'
import { updateProduct, deleteProduct } from '@/lib/supabase/products'

export default function ProductsPage() {
  const { products, isLoading, refetch } = useProducts(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  const filteredProducts = products.filter(product => {
    const matchesSearch = !search || 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleToggleStock = async (product: Product) => {
    await updateProduct(product.id, { inStock: !product.inStock })
    refetch()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await deleteProduct(id)
    setDeletingId(null)
    setConfirmId(null)
    refetch()
  }

  const inStockCount = products.filter(p => p.inStock).length
  const outOfStockCount = products.filter(p => !p.inStock).length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} total • {inStockCount} in stock • {outOfStockCount} out of stock</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <span>➕</span>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:flex-1 sm:min-w-48 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          style={{ fontSize: '16px' }}
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">📦</div>
          <p>No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{product.name}</div>
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg mt-1 object-cover" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{product.category || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-orange-600 font-semibold">₹{product.pricePerUnit}</span>
                      <span className="text-gray-400 text-sm">/{product.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStock(product)}
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          product.inStock 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-xs px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100"
                        >
                          Edit
                        </Link>
                        {confirmId === product.id ? (
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="text-xs px-3 py-1.5 rounded-xl bg-red-500 text-white hover:bg-red-600"
                          >
                            {deletingId === product.id ? '...' : 'Confirm'}
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmId(product.id)}
                            className="text-xs px-3 py-1.5 rounded-xl bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}