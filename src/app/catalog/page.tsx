'use client'

import { useState, useMemo, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { useProducts } from '@/hooks/useProducts'
import { Product } from '@/types/product'
import ProductGrid from '@/components/catalog/ProductGrid'
import ProductModal from '@/components/catalog/ProductModal'
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
  const { t, catLabel } = useLanguage()
  const { products, isLoading } = useProducts()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

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

  const selectedCartItem = selectedProduct ? items.find(i => i.productId === selectedProduct.id) : null

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      {/* ── Banner ── */}
      <div style={{
        background: 'linear-gradient(150deg, rgba(139,26,26,0.88) 0%, rgba(194,65,12,0.88) 40%, rgba(255,107,0,0.88) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        position: 'relative', overflow: 'hidden',
      }}>

        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div className={mounted ? 'animate-fadeInDown' : ''}>
            <p style={{ color: '#FF6B00', fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '6px' }}>
              {t.wholesaleCatalog}
            </p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', color: '#fff', lineHeight: 1, letterSpacing: '2px', textShadow: '0 0 30px rgba(255,107,0,0.4), 0 0 60px rgba(255,107,0,0.2)' }}>
              {activeCategory === 'All' ? t.allProducts : catLabel(activeCategory)}
            </h1>
            <p style={{ color: '#fcd9b0', fontSize: '14px', marginTop: '8px' }}>{t.tagline}</p>
          </div>
          <div className={`hidden sm:flex items-center gap-10 ${mounted ? 'animate-fadeInDown stagger-2' : ''}`}>
            {[
              { val: isLoading ? '…' : products.length, label: t.products },
              { val: isLoading ? '…' : categories.length - 1, label: t.categories },
            ].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.5rem', color: '#FF6B00', lineHeight: 1, textShadow: '0 0 20px rgba(255,107,0,0.5), 0 0 40px rgba(255,107,0,0.25)' }}>{val}</div>
                <div style={{ color: '#fcd9b0', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '3px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ background: 'rgba(255,240,230,0.92)', maxWidth: '1600px', margin: '0 auto', padding: '24px 16px', display: 'flex', gap: '20px' }}>

        {/* ── Sidebar ── */}
        <aside className={`w-56 flex-shrink-0 hidden md:block ${mounted ? 'animate-slideInLeft' : ''}`}>
          <div style={{ background: 'rgba(255,240,230,0.95)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(194,105,26,0.15)', position: 'sticky', top: '80px', border: '1px solid rgba(194,105,26,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg, #7c2d12, #c2410c)', padding: '18px 18px' }}>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>{t.browseBy}</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#fff', letterSpacing: '1px', marginTop: '2px' }}>{t.category}</p>
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
                      padding: '11px 16px',
                      fontSize: '14px',
                      fontWeight: active ? 700 : 500,
                      color: active ? '#FF6B00' : '#374151',
                      background: active ? 'rgba(255,107,0,0.08)' : 'transparent',
                      borderRight: active ? '3px solid #FF6B00' : '3px solid transparent',
                      borderLeft: 'none', borderTop: 'none', borderBottom: 'none',
                      cursor: 'pointer', textAlign: 'left', gap: '6px',
                      transition: 'all 0.15s',
                      animationDelay: `${i * 0.04}s`,
                    }}
                    className={mounted ? 'animate-fadeInUp' : ''}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '16px', flexShrink: 0 }}>{CATEGORY_EMOJIS[cat] || '📦'}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{catLabel(cat)}</span>
                    </span>
                    <span style={{
                      fontSize: '11px', fontWeight: 800,
                      padding: '2px 8px', borderRadius: '20px',
                      background: active ? '#FF6B00' : 'rgba(0,0,0,0.07)',
                      color: active ? '#fff' : '#6b7280',
                      minWidth: '28px', textAlign: 'center', flexShrink: 0,
                      transition: 'all 0.2s',
                    }}>
                      {categoryCounts[cat] || 0}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          {totalItems > 0 && (
            <Link href="/cart" style={{
              display: 'block', marginTop: '14px',
              background: 'linear-gradient(135deg, #15803d, #16a34a)',
              borderRadius: '18px', padding: '18px',
              boxShadow: '0 6px 24px rgba(21,128,61,0.35)',
              textDecoration: 'none',
              animation: 'popIn 0.4s cubic-bezier(.34,1.56,.64,1)',
            }}>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: '#fff', letterSpacing: '1px' }}>
                🛒 {t.myOrder}
              </p>
              <p style={{ color: '#bbf7d0', fontSize: '13px', marginTop: '4px' }}>
                {totalItems} {t.itemsAdded}
              </p>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '13px', marginTop: '10px' }}>
                {t.viewOrder}
              </p>
            </Link>
          )}
        </aside>

        {/* ── Main ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <div className={`flex items-center gap-3 mb-6 flex-wrap ${mounted ? 'animate-fadeInDown' : ''}`}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.4rem', color: '#5C2D0F', letterSpacing: '1px', lineHeight: 1 }}>
                {activeCategory === 'All' ? t.allProducts : catLabel(activeCategory)}
                {!isLoading && (
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#C2691A', marginLeft: '14px' }}>
                    {filtered.length}
                  </span>
                )}
              </h2>
            </div>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: '40px', paddingRight: '18px', paddingTop: '12px', paddingBottom: '12px',
                  background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
                  border: '2px solid rgba(194,105,26,0.2)', borderRadius: '14px',
                  fontSize: '14px', outline: 'none', width: '280px', color: '#111827',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: '0 2px 8px rgba(15,39,68,0.06)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#FF6B00'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,0,0.12)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.6)'; e.target.style.boxShadow = '0 2px 8px rgba(15,39,68,0.06)' }}
              />
            </div>
          </div>

          {/* Mobile pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 md:hidden" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0, padding: '8px 16px', borderRadius: '20px',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: activeCategory === cat ? '#FF6B00' : 'rgba(255,255,255,0.85)',
                  color: activeCategory === cat ? '#fff' : '#374151',
                  boxShadow: activeCategory === cat ? '0 4px 12px rgba(255,107,0,0.4)' : '0 1px 4px rgba(0,0,0,0.08)',
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '22px' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ borderRadius: '22px', overflow: 'hidden', animationDelay: `${i * 0.06}s` }} className="animate-shimmer">
                  <div style={{ height: '230px', background: '#e5e7eb' }} />
                  <div style={{ padding: '18px', background: '#fff' }}>
                    <div className="animate-shimmer" style={{ height: '16px', borderRadius: '6px', width: '80%', marginBottom: '10px' }} />
                    <div className="animate-shimmer" style={{ height: '13px', borderRadius: '6px', width: '55%', marginBottom: '18px' }} />
                    <div className="animate-shimmer" style={{ height: '40px', borderRadius: '10px' }} />
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
              onOpen={setSelectedProduct}
              noProductsLabel={t.noProducts}
            />
          )}
        </div>
      </div>

      {/* ── Product modal ── */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          cartQuantity={selectedCartItem?.quantity || 0}
          onAdd={() => addItem(selectedProduct.id)}
          onRemove={() => removeItem(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
