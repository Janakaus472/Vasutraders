'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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

function CatalogContent() {
  const { items, addItem, removeItem } = useCart()
  const { t, catLabel, lang } = useLanguage()
  const { products, isLoading } = useProducts()
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get('category') || 'All')
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [orderedCats, setOrderedCats] = useState<string[]>([])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setActiveCategory(cat)
  }, [searchParams])

  // Fetch category order from API
  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then((data: { name: string }[]) => {
        if (Array.isArray(data)) setOrderedCats(data.map(c => c.name))
      })
      .catch(() => {})
  }, [])

  const categories = useMemo(() => {
    const productCats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
    if (orderedCats.length > 0) {
      // Use API order, then append any product categories not in the API list
      const ordered = orderedCats.filter(c => productCats.includes(c))
      const remaining = productCats.filter(c => !orderedCats.includes(c)).sort()
      return ['All', ...ordered, ...remaining]
    }
    return ['All', ...productCats.sort()]
  }, [products, orderedCats])

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
    <div style={{ minHeight: '100vh', position: 'relative', background: '#f9f9f9', overflowX: 'hidden', width: '100%' }}>
      <style>{`
        .product-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 540px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .product-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
        }
      `}</style>

      {/* ── Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #7f1d1d, #991b1b, #B91C1C)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 80px)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', gap: '12px' }}>
          <div className={mounted ? 'animate-fadeInDown' : ''}>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#fff', lineHeight: 1, letterSpacing: '2px' }}>
              {activeCategory === 'All' ? (lang === 'hi' ? 'सभी श्रेणियाँ' : 'Browse Categories') : catLabel(activeCategory)}
            </h1>
          </div>
          <div className={`hidden sm:flex items-center gap-6 ${mounted ? 'animate-fadeInDown stagger-2' : ''}`}>
            {[
              { val: isLoading ? '…' : products.length, label: t.products },
              { val: isLoading ? '…' : categories.length - 1, label: t.categories },
            ].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', lineHeight: 1, color: '#FAC41A' }}>{val}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '2px', fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 12px', display: 'flex', gap: '20px' }}>

        {/* ── Sidebar ── */}
        <aside className={`w-56 flex-shrink-0 hidden md:block ${mounted ? 'animate-slideInLeft' : ''}`}>
          <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'sticky', top: '70px', border: '1px solid #f0f0f0' }}>
            <div style={{ background: 'linear-gradient(135deg, #7f1d1d, #B91C1C)', padding: '18px 18px' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase' }}>{t.browseBy}</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: '#FAC41A', letterSpacing: '1px', marginTop: '2px' }}>{t.category}</p>
            </div>
            <nav style={{ padding: '6px 0' }}>
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
                      fontSize: '13px',
                      fontWeight: active ? 700 : 500,
                      color: active ? '#B91C1C' : '#374151',
                      background: active ? '#FEF2F2' : 'transparent',
                      borderRight: active ? '3px solid #DC2626' : '3px solid transparent',
                      borderLeft: 'none', borderTop: 'none', borderBottom: 'none',
                      cursor: 'pointer', textAlign: 'left', gap: '6px',
                      transition: 'all 0.15s',
                      animationDelay: `${i * 0.04}s`,
                    }}
                    className={mounted ? 'animate-fadeInUp' : ''}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '15px', flexShrink: 0 }}>{CATEGORY_EMOJIS[cat] || '📦'}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{catLabel(cat)}</span>
                    </span>
                    <span style={{
                      fontSize: '11px', fontWeight: 800,
                      padding: '2px 8px', borderRadius: '4px',
                      background: active ? '#DC2626' : '#f3f4f6',
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
              background: '#B91C1C',
              borderRadius: '12px', padding: '18px',
              boxShadow: '0 4px 16px rgba(185,28,28,0.3)',
              textDecoration: 'none',
              animation: 'popIn 0.4s cubic-bezier(.34,1.56,.64,1)',
            }}>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: '#FAC41A', letterSpacing: '1px' }}>
                🛒 {t.myOrder}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '4px' }}>
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
          <div className={`flex flex-col sm:flex-row sm:items-center gap-3 mb-3 ${mounted ? 'animate-fadeInDown' : ''}`}>
            <div style={{ flex: 1 }}>
              {activeCategory === 'All' && (
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', color: '#1a1a1a', letterSpacing: '1px', lineHeight: 1 }}>
                  {lang === 'hi' ? 'सभी श्रेणियाँ' : 'All Categories'}
                </h2>
              )}
              {activeCategory !== 'All' && !isLoading && (
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  {filtered.length} {lang === 'hi' ? 'उत्पाद' : 'products'}
                </p>
              )}
            </div>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
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
                  background: '#fff',
                  border: '2px solid #e5e7eb', borderRadius: '8px',
                  fontSize: '16px', outline: 'none', width: '100%', color: '#111827',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#DC2626'; e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
              />
            </div>
          </div>

          {/* Mobile pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 md:hidden" style={{ scrollbarWidth: 'none', paddingLeft: '2px', paddingRight: '2px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0, padding: '8px 16px', borderRadius: '6px',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none',
                  background: activeCategory === cat ? '#DC2626' : '#fff',
                  color: activeCategory === cat ? '#fff' : '#374151',
                  boxShadow: activeCategory === cat ? '0 2px 8px rgba(220,38,38,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
                  transition: 'all 0.15s',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '0.3px',
                }}
              >
                {CATEGORY_EMOJIS[cat] || '📦'} {catLabel(cat)}
              </button>
            ))}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="product-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', animationDelay: `${i * 0.06}s` }} className="animate-shimmer">
                  <div style={{ height: '340px', background: '#e5e7eb' }} />
                  <div style={{ padding: '16px', background: '#fff' }}>
                    <div className="animate-shimmer" style={{ height: '16px', borderRadius: '4px', width: '80%', marginBottom: '10px' }} />
                    <div className="animate-shimmer" style={{ height: '13px', borderRadius: '4px', width: '55%', marginBottom: '18px' }} />
                    <div className="animate-shimmer" style={{ height: '36px', borderRadius: '6px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : activeCategory === 'All' && !search.trim() ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
              gap: '16px',
            }}>
              {categories.filter(c => c !== 'All').map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="animate-popIn"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '24px 20px',
                    border: '2px solid #f0f0f0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#DC2626'
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(185,28,28,0.12)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#f0f0f0'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{
                    fontSize: '44px',
                    lineHeight: 1,
                    flexShrink: 0,
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#FEF2F2',
                    borderRadius: '12px',
                  }}>
                    {CATEGORY_EMOJIS[cat] || '📦'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '17px',
                      color: '#1a1a1a',
                      lineHeight: 1.3,
                      marginBottom: '4px',
                    }}>
                      {catLabel(cat)}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#DC2626',
                    }}>
                      {categoryCounts[cat] || 0} {t.products.toLowerCase()}
                    </div>
                  </div>
                  <svg width="20" height="20" fill="none" stroke="#9ca3af" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
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
              hideCategory={activeCategory !== 'All'}
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

export default function CatalogPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <CatalogContent />
    </Suspense>
  )
}
