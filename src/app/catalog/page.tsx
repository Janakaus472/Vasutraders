'use client'

import { useState, useMemo, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
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
  const { t, catLabel, lang } = useLanguage()
  const { products, isLoading } = useProducts()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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
    <div style={{ minHeight: '100vh', background: '#f5f4f0' }}>

      {/* ── Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1e38 0%, #0f2744 50%, #132f52 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Animated gradient orb */}
        <div style={{
          position: 'absolute', top: '-60px', right: '10%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite',
        }} />
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Bottom orange rule */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #FF6B00 20%, #FF9A3C 50%, #FF6B00 80%, transparent)' }} />

        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div className={mounted ? 'animate-fadeInDown' : ''}>
            <p style={{ color: '#FF6B00', fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '6px' }}>
              {t.wholesaleCatalog}
            </p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#fff', lineHeight: 1, letterSpacing: '2px' }}>
              {activeCategory === 'All' ? t.allProducts : catLabel(activeCategory)}
            </h1>
            <p style={{ color: '#7bafd4', fontSize: '13px', marginTop: '6px' }}>{t.tagline}</p>
          </div>

          {/* Stats */}
          <div className={`hidden sm:flex items-center gap-8 ${mounted ? 'animate-fadeInDown stagger-2' : ''}`}>
            {[
              { val: isLoading ? '…' : products.length, label: t.products },
              { val: isLoading ? '…' : categories.length - 1, label: t.categories },
            ].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', color: '#FF6B00', lineHeight: 1 }}>{val}</div>
                <div style={{ color: '#7bafd4', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px 16px', display: 'flex', gap: '20px' }}>

        {/* ── Sidebar ── */}
        <aside className={`w-52 flex-shrink-0 hidden md:block ${mounted ? 'animate-slideInLeft' : ''}`}>
          <div style={{ background: '#fff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(15,39,68,0.1)', position: 'sticky', top: '80px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0f2744, #1a3c5e)', padding: '16px 18px' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>{t.browseBy}</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: '#fff', letterSpacing: '1px', marginTop: '2px' }}>{t.category}</p>
            </div>
            <nav style={{ padding: '8px 0' }}>
              {categories.map((cat, i) => {
                const active = activeCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      fontSize: '12.5px',
                      fontWeight: active ? 700 : 500,
                      color: active ? '#FF6B00' : '#374151',
                      background: active ? 'linear-gradient(90deg, #fff7f0, #fff)' : 'transparent',
                      borderRight: active ? '3px solid #FF6B00' : '3px solid transparent',
                      borderLeft: 'none', borderTop: 'none', borderBottom: 'none',
                      cursor: 'pointer', textAlign: 'left', gap: '6px',
                      transition: 'all 0.15s',
                      animationDelay: `${i * 0.04}s`,
                    }}
                    className={mounted ? 'animate-fadeInUp' : ''}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '15px', flexShrink: 0 }}>{CATEGORY_EMOJIS[cat] || '📦'}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{catLabel(cat)}</span>
                    </span>
                    <span style={{
                      fontSize: '10px', fontWeight: 800,
                      padding: '2px 7px', borderRadius: '20px',
                      background: active ? '#FF6B00' : '#f3f4f6',
                      color: active ? '#fff' : '#6b7280',
                      minWidth: '26px', textAlign: 'center', flexShrink: 0,
                      transition: 'all 0.2s',
                    }}>
                      {categoryCounts[cat] || 0}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Cart CTA */}
          {totalItems > 0 && (
            <Link href="/cart" style={{
              display: 'block', marginTop: '14px',
              background: 'linear-gradient(135deg, #15803d, #16a34a)',
              borderRadius: '16px', padding: '16px 18px',
              boxShadow: '0 6px 20px rgba(21,128,61,0.35)',
              textDecoration: 'none',
              animation: 'popIn 0.4s cubic-bezier(.34,1.56,.64,1)',
            }}>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: '#fff', letterSpacing: '1px' }}>
                🛒 {t.myOrder}
              </p>
              <p style={{ color: '#bbf7d0', fontSize: '12px', marginTop: '3px' }}>
                {totalItems} {t.itemsAdded}
              </p>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '12px', marginTop: '10px' }}>
                {t.viewOrder}
              </p>
            </Link>
          )}
        </aside>

        {/* ── Main ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <div className={`flex items-center gap-3 mb-5 flex-wrap ${mounted ? 'animate-fadeInDown' : ''}`}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#0f2744', letterSpacing: '1px', lineHeight: 1 }}>
                {activeCategory === 'All' ? t.allProducts : catLabel(activeCategory)}
                {!isLoading && (
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: '#FF6B00', marginLeft: '12px' }}>
                    {filtered.length}
                  </span>
                )}
              </h2>
            </div>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: '36px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px',
                  background: '#fff', border: '2px solid #e5e7eb', borderRadius: '12px',
                  fontSize: '13px', outline: 'none', width: '260px', color: '#111827',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#FF6B00'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,0,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          {/* Mobile category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 md:hidden" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0, padding: '7px 14px', borderRadius: '20px',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: activeCategory === cat ? '#FF6B00' : '#fff',
                  color: activeCategory === cat ? '#fff' : '#374151',
                  boxShadow: activeCategory === cat ? '0 3px 10px rgba(255,107,0,0.35)' : '0 1px 4px rgba(0,0,0,0.08)',
                  transition: 'all 0.15s',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {CATEGORY_EMOJIS[cat] || '📦'} {catLabel(cat)}
              </button>
            ))}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ borderRadius: '18px', overflow: 'hidden', animationDelay: `${i * 0.06}s` }} className="animate-shimmer">
                  <div style={{ height: '230px', background: '#e5e7eb' }} />
                  <div style={{ padding: '16px', background: '#fff' }}>
                    <div className="animate-shimmer" style={{ height: '14px', borderRadius: '6px', width: '80%', marginBottom: '8px' }} />
                    <div className="animate-shimmer" style={{ height: '12px', borderRadius: '6px', width: '55%', marginBottom: '16px' }} />
                    <div className="animate-shimmer" style={{ height: '38px', borderRadius: '10px' }} />
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
              noProductsLabel={t.noProducts}
            />
          )}
        </div>
      </div>
    </div>
  )
}
