'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { Product } from '@/types/product'
import ProductGrid from '@/components/catalog/ProductGrid'
import ProductModal from '@/components/catalog/ProductModal'
import Link from 'next/link'

const DEFAULT_EMOJI = '📦'

interface Props {
  initialProducts: Product[]
}

function CatalogContent({ initialProducts }: Props) {
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const { t, catLabel, lang } = useLanguage()
  const searchParams = useSearchParams()
  const [products] = useState<Product[]>(initialProducts)
  const isLoading = false
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get('category') || 'All')
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(() => searchParams.get('subcategory') || null)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [orderedCats, setOrderedCats] = useState<string[]>([])
  const [catEmojis, setCatEmojis] = useState<Record<string, string>>({})
  const [catImages, setCatImages] = useState<Record<string, string>>({})
  const [catSubMap, setCatSubMap] = useState<Record<string, string[]>>({})
  const [catsLoaded, setCatsLoaded] = useState(false)

  // Helper to update URL without triggering Next.js navigation (avoids Suspense freeze)
  const syncUrl = (cat: string, sub: string | null) => {
    const params = new URLSearchParams()
    if (cat !== 'All') params.set('category', cat)
    if (sub) params.set('subcategory', sub)
    const qs = params.toString()
    window.history.replaceState(null, '', `/catalog${qs ? `?${qs}` : ''}`)
  }

  // Helper to switch category and reset subcategory
  const selectCategory = (cat: string) => {
    setActiveCategory(cat)
    setActiveSubcategory(null)
    syncUrl(cat, null)
  }

  // Helper to select subcategory
  const selectSubcategory = (sub: string | null) => {
    setActiveSubcategory(sub)
    syncUrl(activeCategory, sub)
  }

  // Fetch category order+emojis from home-layout, subcategories from categories API
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/home-layout').then(r => r.json()).catch(() => []),
      fetch('/api/admin/categories').then(r => r.json()).catch(() => []),
    ]).then(([layout, cats]) => {
      // Order + emojis from home layout
      if (Array.isArray(layout) && layout.length > 0) {
        setOrderedCats(layout.filter((l: any) => l.visible !== false).map((l: any) => l.name))
        const emojiMap: Record<string, string> = {}
        const imageMap: Record<string, string> = {}
        layout.forEach((l: any) => {
          emojiMap[l.name] = l.emoji || DEFAULT_EMOJI
          if (l.imageUrl) imageMap[l.name] = l.imageUrl
        })
        setCatEmojis(emojiMap)
        setCatImages(imageMap)
      } else if (Array.isArray(cats)) {
        setOrderedCats(cats.map((c: any) => c.name))
      }
      // Subcategories from categories API
      if (Array.isArray(cats)) {
        const subMap: Record<string, string[]> = {}
        cats.forEach((c: any) => {
          if (c.subcategories) subMap[c.name] = c.subcategories.map((s: any) => s.name)
        })
        setCatSubMap(subMap)
      }
      setCatsLoaded(true)
    })
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
    if (activeSubcategory) {
      list = list.filter((p) => p.subcategory === activeSubcategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }
    return list
  }, [products, activeCategory, activeSubcategory, search])

  // Get subcategories for active category (with product counts)
  const activeSubcategories = useMemo(() => {
    if (activeCategory === 'All') return []
    const orderedSubs = catSubMap[activeCategory] || []
    const catProducts = products.filter(p => p.category === activeCategory)
    // Get all subcategories that have products
    const subsWithProducts: { name: string; count: number }[] = []
    const seen = new Set<string>()
    // Admin-ordered subs first
    for (const sub of orderedSubs) {
      const count = catProducts.filter(p => p.subcategory === sub).length
      if (count > 0) {
        subsWithProducts.push({ name: sub, count })
        seen.add(sub)
      }
    }
    // Then any extra subs not in admin list
    const extraSubs = Array.from(new Set(catProducts.map(p => p.subcategory).filter(s => s && !seen.has(s))))
    for (const sub of extraSubs) {
      subsWithProducts.push({ name: sub, count: catProducts.filter(p => p.subcategory === sub).length })
    }
    return subsWithProducts
  }, [activeCategory, catSubMap, products])

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
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#fff', lineHeight: 1, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {activeCategory === 'All' ? (lang === 'hi' ? 'सभी श्रेणियाँ' : 'Browse Categories') : (
                <>
                  <span
                    onClick={() => { if (activeSubcategory) selectSubcategory(null) }}
                    style={{ cursor: activeSubcategory ? 'pointer' : 'default', opacity: activeSubcategory ? 0.7 : 1 }}
                  >
                    {catLabel(activeCategory)}
                  </span>
                  {activeSubcategory && (
                    <>
                      <span style={{ opacity: 0.5, fontSize: '0.8em' }}>&rsaquo;</span>
                      <span>{activeSubcategory}</span>
                    </>
                  )}
                </>
              )}
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            {[
              { val: products.length, label: t.products },
              { val: categories.length - 1, label: t.categories },
            ].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', lineHeight: 1, color: '#FAC41A' }}>{val}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '2px', fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky navigation bar — category + subcategory pills ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '8px 12px' }}>
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto md:hidden" style={{ scrollbarWidth: 'none', paddingBottom: activeCategory !== 'All' && activeSubcategories.length > 0 && !search.trim() && catsLoaded ? '6px' : '0' }}>
            {catsLoaded && categories.map((cat) => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                style={{
                  flexShrink: 0, padding: '7px 14px', borderRadius: '6px',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none',
                  background: activeCategory === cat ? '#DC2626' : '#f3f4f6',
                  color: activeCategory === cat ? '#fff' : '#374151',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '0.3px',
                }}
              >
                {catEmojis[cat] || DEFAULT_EMOJI} {catLabel(cat)}
              </button>
            ))}
          </div>

          {/* Subcategory pills */}
          {activeCategory !== 'All' && activeSubcategories.length > 0 && !search.trim() && catsLoaded && (
            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => selectSubcategory(null)}
                style={{
                  flexShrink: 0, padding: '6px 12px', borderRadius: '20px',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  border: !activeSubcategory ? '2px solid #DC2626' : '2px solid #e5e7eb',
                  background: !activeSubcategory ? '#FEF2F2' : '#fff',
                  color: !activeSubcategory ? '#DC2626' : '#374151',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {lang === 'hi' ? 'सभी' : 'All'}
              </button>
              {activeSubcategories.map((sub) => (
                <button
                  key={sub.name}
                  onClick={() => selectSubcategory(sub.name)}
                  style={{
                    flexShrink: 0, padding: '6px 12px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    border: activeSubcategory === sub.name ? '2px solid #DC2626' : '2px solid #e5e7eb',
                    background: activeSubcategory === sub.name ? '#FEF2F2' : '#fff',
                    color: activeSubcategory === sub.name ? '#DC2626' : '#374151',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {sub.name} <span style={{ color: '#9ca3af', fontWeight: 600 }}>({sub.count})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 12px', display: 'flex', gap: '20px' }}>

        {/* ── Sidebar ── */}
        <aside className="w-56 flex-shrink-0 hidden md:block">
          <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'sticky', top: '70px', border: '1px solid #f0f0f0' }}>
            <div style={{ background: 'linear-gradient(135deg, #7f1d1d, #B91C1C)', padding: '18px 18px' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase' }}>{t.browseBy}</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: '#FAC41A', letterSpacing: '1px', marginTop: '2px' }}>{t.category}</p>
            </div>
            <nav style={{ padding: '6px 0' }}>
              {(!catsLoaded || isLoading) ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '15px', height: '15px', borderRadius: '4px', background: '#e5e7eb' }} />
                    <div style={{ flex: 1, height: '13px', borderRadius: '4px', background: '#e5e7eb' }} />
                  </div>
                ))
              ) : categories.map((cat) => {
                const active = activeCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => selectCategory(cat)}
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
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      {catImages[cat]
                        ? <img src={catImages[cat]} alt={cat} style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'cover', flexShrink: 0 }} />
                        : <span style={{ fontSize: '15px', flexShrink: 0 }}>{catEmojis[cat] || DEFAULT_EMOJI}</span>
                      }
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div style={{ flex: 1 }}>
              {activeCategory === 'All' && (
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', color: '#1a1a1a', letterSpacing: '1px', lineHeight: 1 }}>
                  {lang === 'hi' ? 'सभी श्रेणियाँ' : 'All Categories'}
                </h2>
              )}
              {activeCategory !== 'All' && !isLoading && (
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  {activeSubcategory ? (
                    <>
                      <button
                        onClick={() => selectSubcategory(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontWeight: 700, fontSize: '13px', padding: 0, marginRight: '8px' }}
                      >
                        &larr; {lang === 'hi' ? 'वापस' : 'Back'}
                      </button>
                      {filtered.length} {lang === 'hi' ? 'उत्पाद' : 'products'}
                    </>
                  ) : (
                    <>
                      {activeSubcategories.length > 0
                        ? `${activeSubcategories.length} ${lang === 'hi' ? 'उपश्रेणियाँ' : 'subcategories'}`
                        : `${filtered.length} ${lang === 'hi' ? 'उत्पाद' : 'products'}`
                      }
                    </>
                  )}
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

          {/* Grid */}
          {activeCategory === 'All' && !search.trim() ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
              gap: '16px',
            }}>
              {categories.filter(c => c !== 'All').map((cat) => (
                <button
                  key={cat}
                  onClick={() => selectCategory(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '24px 20px',
                    border: '2px solid #f0f0f0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{
                    flexShrink: 0, width: '64px', height: '64px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#FEF2F2', borderRadius: '12px', overflow: 'hidden',
                  }}>
                    {catImages[cat]
                      ? <img src={catImages[cat]} alt={cat} style={{ width: '64px', height: '64px', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '44px', lineHeight: 1 }}>{catEmojis[cat] || DEFAULT_EMOJI}</span>
                    }
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
              onSetQuantity={updateQuantity}
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
          onSetQuantity={(qty) => updateQuantity(selectedProduct.id, qty)}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}

export default function CatalogClient({ initialProducts }: Props) {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <CatalogContent initialProducts={initialProducts} />
    </Suspense>
  )
}
