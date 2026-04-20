'use client'

import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { updateProduct } from '@/lib/supabase/products'
import Link from 'next/link'

export default function CategoriesPage() {
  const { products, isLoading, refetch } = useProducts(true)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [search, setSearch] = useState('')

  // Derive categories from products
  const categoryMap = new Map<string, { count: number; active: number; hidden: number }>()
  products.forEach(p => {
    const cat = p.category || 'Uncategorized'
    const entry = categoryMap.get(cat) || { count: 0, active: 0, hidden: 0 }
    entry.count++
    if (p.inStock) entry.active++
    else entry.hidden++
    categoryMap.set(cat, entry)
  })

  const categories = Array.from(categoryMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const handleRename = async (oldName: string) => {
    if (!newName.trim() || newName.trim() === oldName) {
      setEditingCategory(null)
      return
    }
    const toUpdate = products.filter(p => (p.category || 'Uncategorized') === oldName)
    for (const product of toUpdate) {
      await updateProduct(product.id, { category: newName.trim() })
    }
    setEditingCategory(null)
    setNewName('')
    refetch()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-500 text-sm">{categories.length} categories</p>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search categories..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        style={{ fontSize: '16px' }}
      />

      {/* Categories List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">🏷️</div>
          <p>No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(cat => (
            <div
              key={cat.name}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {editingCategory === cat.name ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRename(cat.name)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    autoFocus
                    style={{ fontSize: '16px' }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRename(cat.name)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                    <button
                      onClick={() => {
                        setEditingCategory(cat.name)
                        setNewName(cat.name)
                      }}
                      className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                    >
                      Rename
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>📦 {cat.count} products</span>
                    <span>✅ {cat.active} active</span>
                    {cat.hidden > 0 && <span>👁️ {cat.hidden} hidden</span>}
                  </div>
                  <Link
                    href={`/admin/products?category=${encodeURIComponent(cat.name)}`}
                    className="mt-3 inline-block text-xs text-orange-500 hover:text-orange-600 font-medium"
                  >
                    View products →
                  </Link>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
