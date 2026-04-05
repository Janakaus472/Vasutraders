'use client'

import { useState, useMemo } from 'react'
import { useCart } from '@/context/CartContext'
import { useProducts } from '@/hooks/useProducts'
import ProductGrid from '@/components/catalog/ProductGrid'
import Link from 'next/link'

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
    products.forEach((p) => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1 })
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

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-[#1a3c5e] to-[#2a5c8e] text-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Wholesale Products Catalog</h2>
            <p className="text-blue-200 text-sm mt-1">Playing Cards • Balloons • Rubber Bands • Sports • Kanche • More</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-blue-200 text-xs">📍 Indore, Madhya Pradesh</p>
            <p className="text-blue-200 text-xs mt-1">📞 Call for wholesale pricing</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 hidden md:block">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-20 shadow-sm">
            <div className="bg-[#1a3c5e] px-4 py-3">
              <p className="text-white font-bold text-xs uppercase tracking-widest">Categories</p>
            </div>
            <nav className="py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all text-left ${
                    activeCategory === cat
                      ? 'bg-orange-50 text-orange-600 font-semibold border-r-[3px] border-orange-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-xs rounded-full px-1.5 py-0.5 min-w-[1.5rem] text-center ${
                    activeCategory === cat ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Order summary box */}
          {totalItems > 0 && (
            <Link href="/cart" className="block mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl p-4 shadow transition-colors">
              <p className="font-bold text-sm">🛒 My Order</p>
              <p className="text-green-100 text-xs mt-1">{totalItems} item{totalItems !== 1 ? 's' : ''} added</p>
              <p className="text-white font-semibold text-sm mt-2">View Order →</p>
            </Link>
          )}
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <div className="flex-1">
              <h1 className="text-xl font-black text-gray-900">
                {activeCategory === 'All' ? 'All Products' : activeCategory}
                <span className="ml-2 text-sm font-normal text-gray-400">
                  {isLoading ? '…' : `${filtered.length} products`}
                </span>
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
                className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 w-64 text-gray-900"
              />
            </div>
          </div>

          {/* Mobile category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 md:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === cat ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                  <div className="bg-gray-200" style={{ height: '200px' }} />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-4/5" />
                    <div className="h-3 bg-gray-200 rounded w-3/5" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid products={filtered} cartItems={items} onAdd={addItem} onRemove={removeItem} />
          )}
        </div>
      </div>
    </div>
  )
}
