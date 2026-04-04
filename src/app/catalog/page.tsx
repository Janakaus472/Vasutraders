'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useProducts } from '@/hooks/useProducts'
import ProductGrid from '@/components/catalog/ProductGrid'

export default function CatalogPage() {
  const { firebaseUser, isLoading: authLoading } = useAuth()
  const { items, addItem, removeItem } = useCart()
  const { products, isLoading: productsLoading } = useProducts()
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
    return ['All', ...cats.sort()]
  }, [products])

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return products
    return products.filter((p) => p.category === activeCategory)
  }, [products, activeCategory])

  if (authLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-center">
          <div className="text-4xl animate-pulse">🛒</div>
          <p className="mt-2">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
      {!firebaseUser && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 text-center">
          <p className="text-orange-700 font-medium text-sm">
            🔒 Enter your mobile number to see wholesale prices
          </p>
        </div>
      )}

      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <ProductGrid
        products={filtered}
        isAuthenticated={!!firebaseUser}
        cartItems={items}
        onAdd={addItem}
        onRemove={removeItem}
      />
    </div>
  )
}
