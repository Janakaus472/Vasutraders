'use client'

import { useState, useMemo } from 'react'
import { useCart } from '@/context/CartContext'
import { useProducts } from '@/hooks/useProducts'
import ProductGrid from '@/components/catalog/ProductGrid'
import Link from 'next/link'

const CATEGORY_EMOJIS: Record<string, string> = {
  'All': '🏪',
  'Playing Cards': '🃏',
  'Party Balloons': '🎈',
  'Kanche & Glass Balls': '🔮',
  'Sports & Games': '⚽',
  'Rubber Bands': '🔗',
  'Spurs': '⚙️',
  'Poker Chips': '🎰',
  'Toothbrushes': '🪥',
  'Burnt Balls': '⚫',
}

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
    <div className="min-h-screen" style={{ background: '#f5f4f0' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f2744 0%, #1a3c5e 60%, #0f2744 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        {/* Orange accent line */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #FF6B00, #FF9A3C, #FF6B00)' }} />

        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between" style={{ position: 'relative' }}>
          <div>
            <p style={{ color: '#FF6B00', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Wholesale Catalog
            </p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.5rem', color: '#fff', lineHeight: 1, letterSpacing: '2px' }}>
              All Products
            </h1>
            <p style={{ color: '#93b4cf', fontSize: '13px', marginTop: '6px' }}>
              Playing Cards · Balloons · Rubber Bands · Sports · Kanche & more
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#FF6B00', lineHeight: 1 }}>
                {isLoading ? '…' : products.length}
              </div>
              <div style={{ color: '#93b4cf', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>Products</div>
            </div>
            <div style={{ width: '1px', height: '48px', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#FF6B00', lineHeight: 1 }}>
                {isLoading ? '…' : categories.length - 1}
              </div>
              <div style={{ color: '#93b4cf', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>Categories</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-7 flex gap-7">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 hidden md:block">
          <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(15,39,68,0.08)', position: 'sticky', top: '80px' }}>
            <div style={{ background: '#0f2744', padding: '14px 18px' }}>
              <p style={{ color: '#FF6B00', fontWeight: 700, fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase' }}>
                Browse By
              </p>
              <p style={{ color: '#fff', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: '1px', marginTop: '2px' }}>
                Category
              </p>
            </div>
            <nav style={{ padding: '6px 0' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: activeCategory === cat ? 700 : 500,
                    color: activeCategory === cat ? '#FF6B00' : '#374151',
                    background: activeCategory === cat ? '#fff7f0' : 'transparent',
                    borderRight: activeCategory === cat ? '3px solid #FF6B00' : '3px solid transparent',
                    transition: 'all 0.15s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '8px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{CATEGORY_EMOJIS[cat] || '📦'}</span>
                    {cat}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: '20px',
                    background: activeCategory === cat ? '#FF6B00' : '#f3f4f6',
                    color: activeCategory === cat ? '#fff' : '#6b7280',
                    minWidth: '28px',
                    textAlign: 'center',
                  }}>
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Order CTA */}
          {totalItems > 0 && (
            <Link href="/cart" style={{
              display: 'block',
              marginTop: '16px',
              background: 'linear-gradient(135deg, #15803d, #16a34a)',
              borderRadius: '16px',
              padding: '18px',
              boxShadow: '0 4px 16px rgba(21,128,61,0.3)',
              textDecoration: 'none',
              transition: 'transform 0.2s',
            }}
            onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <p style={{ color: '#fff', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '1px' }}>
                🛒 My Order
              </p>
              <p style={{ color: '#bbf7d0', fontSize: '12px', marginTop: '4px' }}>
                {totalItems} item{totalItems !== 1 ? 's' : ''} ready to send
              </p>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '13px', marginTop: '10px' }}>
                View & Send on WhatsApp →
              </p>
            </Link>
          )}
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#0f2744', letterSpacing: '1px', lineHeight: 1 }}>
                {activeCategory === 'All' ? 'All Products' : activeCategory}
                <span style={{ fontFamily: 'inherit', fontSize: '1rem', color: '#FF6B00', marginLeft: '10px' }}>
                  {isLoading ? '…' : filtered.length}
                </span>
              </h2>
            </div>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: '38px',
                  paddingRight: '16px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  background: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '13px',
                  outline: 'none',
                  width: '260px',
                  color: '#111827',
                  transition: 'border-color 0.2s',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                onFocus={e => (e.target.style.borderColor = '#FF6B00')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>
          </div>

          {/* Mobile category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 md:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0,
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: activeCategory === cat ? '#FF6B00' : '#fff',
                  color: activeCategory === cat ? '#fff' : '#374151',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.15s',
                }}
              >
                {CATEGORY_EMOJIS[cat] || '📦'} {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', animation: 'pulse 1.5s ease-in-out infinite' }}>
                  <div style={{ background: '#e5e7eb', height: '200px' }} />
                  <div style={{ padding: '16px' }}>
                    <div style={{ height: '14px', background: '#e5e7eb', borderRadius: '6px', width: '80%', marginBottom: '8px' }} />
                    <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '6px', width: '60%', marginBottom: '16px' }} />
                    <div style={{ height: '36px', background: '#e5e7eb', borderRadius: '10px' }} />
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
