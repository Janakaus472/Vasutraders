'use client'

import { useState, useMemo } from 'react'
import { useCart } from '@/context/CartContext'
import { useProducts } from '@/hooks/useProducts'
import ProductGrid from '@/components/catalog/ProductGrid'

export default function CatalogPage() {
  const { items, addItem, removeItem } = useCart()
  const { products, isLoading } = useProducts()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
    return ['All', ...cats.sort()]
  }, [products])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length }
    products.forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1
    })
    return counts
  }, [products])

  const filtered = useMemo(() => {
    let list = activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }
    return list
  }, [products, activeCategory, search])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-20">
          <div className="bg-[#1a3c5e] px-4 py-3">
            <p className="text-white font-bold text-sm uppercase tracking-wide">Categories</p>
          </div>
          <nav className="py-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                  activeCategory === cat
                    ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-500'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-xs rounded-full px-2 py-0.5 ${
                  activeCategory === cat ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {categoryCounts[cat] || 0}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Search + heading */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeCategory === 'All' ? 'All Products' : activeCategory}
              <span className="ml-2 text-base font-normal text-gray-400">({filtered.length} items)</span>
            </h1>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 w-56"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="bg-gray-200" style={{ paddingTop: '75%' }} />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid
            products={filtered}
            cartItems={items}
            onAdd={addItem}
            onRemove={removeItem}
          />
        )}
      </div>
    </div>
  )
}
