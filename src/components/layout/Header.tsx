'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { BUSINESS_NAME } from '@/lib/constants'
import { usePathname } from 'next/navigation'
import { getProducts } from '@/lib/supabase/products'
import type { Product } from '@/types/product'

const CAT_EMOJIS: Record<string, string> = {
  'Playing Cards': '🃏',
  'Party Balloons': '🎈',
  'Kanche & Glass Balls': '🔮',
  'Sports & Games': '🏏',
  'Rubber Bands': '🔁',
  'Tapes': '📦',
  'Poker Chips': '🎰',
  'Toothbrushes': '🪥',
  'Boric Acid': '⚗️',
  'General Goods': '🛍️',
}

export default function Header() {
  const { itemCount } = useCart()
  const { lang, setLang, catLabel } = useLanguage()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)
  const isAdminPage = pathname.startsWith('/admin')

  // Fetch products when menu opens
  useEffect(() => {
    if (mobileMenuOpen && !loaded) {
      getProducts(false).then(p => { setProducts(p); setLoaded(true) }).catch(() => setLoaded(true))
    }
  }, [mobileMenuOpen, loaded])

  const closeMenu = () => {
    setMobileMenuOpen(false)
    setProductsOpen(false)
    setExpandedCat(null)
  }

  // Build category → products map
  const categoryMap: Record<string, Product[]> = {}
  products.forEach(p => {
    if (p.category) {
      if (!categoryMap[p.category]) categoryMap[p.category] = []
      categoryMap[p.category].push(p)
    }
  })
  const categoryNames = Object.keys(categoryMap).sort()

  if (isAdminPage) return null

  return (
    <>
      <style>{`
        .header-nav-link {
          padding: 8px 18px;
          border-radius: 0;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          transition: all 0.15s;
          border-bottom: 3px solid transparent;
          color: rgba(255,255,255,0.7);
        }
        .header-nav-link:hover {
          color: #FAC41A;
          border-bottom-color: #FAC41A;
        }
        .header-nav-link-active {
          color: #FAC41A !important;
          border-bottom-color: #FAC41A !important;
        }
      `}</style>
      <header className="sticky top-0 z-50" style={{
        background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 100%)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}>
        {/* Top bar - contact info */}
        <div className="hidden sm:block" style={{
          background: '#5c1414',
          padding: '3px 16px',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center' as const,
          fontWeight: 500,
          letterSpacing: '0.5px',
        }}>
          Wholesale Supplier · Indore, MP · {lang === 'hi' ? '20+ साल का अनुभव' : '20+ Years in Business'}
        </div>

        {/* Main header */}
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '0 16px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, textDecoration: 'none' }}>
            <Image src="/logo.png" alt={BUSINESS_NAME} width={34} height={34} style={{ borderRadius: '6px', flexShrink: 0 }} />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontFamily: "'Mandali', sans-serif", fontSize: '0.95rem', color: '#fff', letterSpacing: '1px', fontWeight: 700 }}>{BUSINESS_NAME}</div>
              <div style={{ color: '#FAC41A', fontSize: '8px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Since 2005</div>
            </div>
          </Link>

          {/* Mobile: Cart icon + Hamburger */}
          <div className="flex sm:hidden items-center" style={{ gap: '8px', marginLeft: 'auto' }}>
            <Link
              href="/cart"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                minWidth: '44px',
                minHeight: '44px',
                textDecoration: 'none',
              }}
            >
              <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: '#FAC41A',
                  color: '#7f1d1d',
                  fontSize: '10px',
                  fontWeight: 900,
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'popIn 0.3s ease',
                }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            <button
              className="flex items-center justify-center"
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); if (mobileMenuOpen) { setProductsOpen(false); setExpandedCat(null) } }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                cursor: 'pointer',
                minWidth: '44px',
                minHeight: '44px',
              }}
            >
              <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" stroke="white" strokeWidth="2" fill="none"/>
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="white" strokeWidth="2" fill="none"/>
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center justify-center" style={{ gap: '4px', flex: 1 }}>
            <Link href="/catalog" className={`header-nav-link ${pathname === '/catalog' ? 'header-nav-link-active' : ''}`}>
              Products
            </Link>
            <Link href="/cart" className={`header-nav-link ${pathname === '/cart' ? 'header-nav-link-active' : ''}`}>
              My Order
            </Link>
          </nav>

          {/* Right side — desktop only */}
          <div className="hidden sm:flex items-center" style={{ gap: '8px' }}>
            <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', padding: 0 }}>
              <span style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 700, background: lang === 'en' ? '#FAC41A' : 'transparent', color: lang === 'en' ? '#7f1d1d' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>EN</span>
              <span style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 700, background: lang === 'hi' ? '#FAC41A' : 'transparent', color: lang === 'hi' ? '#7f1d1d' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>हिं</span>
            </button>
            <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FAC41A', color: '#7f1d1d', fontWeight: 800, padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', transition: 'all 0.15s', flexShrink: 0, letterSpacing: '0.5px' }}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart
              {itemCount > 0 && (
                <span style={{ background: '#7f1d1d', color: '#FAC41A', fontSize: '10px', fontWeight: 900, borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'popIn 0.3s ease' }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div
            className="flex sm:hidden flex-col"
            style={{
              position: 'absolute',
              top: '50px',
              left: 0,
              right: 0,
              background: '#7f1d1d',
              padding: '12px 16px 16px',
              gap: '4px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              zIndex: 100,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            {/* ── Products with nested categories ── */}
            <button
              onClick={() => { setProductsOpen(!productsOpen); setExpandedCat(null) }}
              style={{
                padding: '14px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '1px',
                background: productsOpen ? 'rgba(250,196,26,0.15)' : 'transparent',
                color: productsOpen ? '#FAC41A' : 'rgba(255,255,255,0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <span style={{ flex: 1 }}>{lang === 'hi' ? 'उत्पाद' : 'Products'}</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transition: 'transform 0.2s', transform: productsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Category list */}
            {productsOpen && (
              <div style={{ paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {/* View All */}
                <Link href="/catalog" onClick={closeMenu} style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: '#FAC41A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(250,196,26,0.08)',
                }}>
                  <span style={{ fontSize: '16px' }}>📋</span>
                  {lang === 'hi' ? 'सभी उत्पाद देखें' : 'View All Products'}
                </Link>

                {!loaded ? (
                  <div style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Loading...</div>
                ) : (
                  categoryNames.map(cat => (
                    <div key={cat}>
                      {/* Category row */}
                      <button
                        onClick={() => setExpandedCat(expandedCat === cat ? null : cat)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          background: expandedCat === cat ? 'rgba(255,255,255,0.08)' : 'transparent',
                          color: expandedCat === cat ? '#FAC41A' : 'rgba(255,255,255,0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          border: 'none',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: '16px', width: '22px', textAlign: 'center' }}>{CAT_EMOJIS[cat] || '📦'}</span>
                        <span style={{ flex: 1 }}>{catLabel(cat)}</span>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{categoryMap[cat].length}</span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transition: 'transform 0.2s', transform: expandedCat === cat ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.5 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Products in this category */}
                      {expandedCat === cat && (
                        <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '4px' }}>
                          {categoryMap[cat].map(product => (
                            <Link
                              key={product.id}
                              href={`/catalog?category=${encodeURIComponent(cat)}`}
                              onClick={closeMenu}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 500,
                                textDecoration: 'none',
                                color: 'rgba(255,255,255,0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.15s',
                                borderLeft: '2px solid rgba(250,196,26,0.2)',
                              }}
                            >
                              {product.imageUrl ? (
                                <div style={{ width: '28px', height: '28px', borderRadius: '6px', overflow: 'hidden', background: 'rgba(255,255,255,0.1)', flexShrink: 0, position: 'relative' }}>
                                  <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: 'contain', padding: '2px' }} />
                                </div>
                              ) : (
                                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                                  {CAT_EMOJIS[cat] || '📦'}
                                </div>
                              )}
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
                              {product.pricePerUnit > 0 && (
                                <span style={{ fontSize: '11px', color: 'rgba(250,196,26,0.7)', fontWeight: 600, flexShrink: 0 }}>₹{product.pricePerUnit}</span>
                              )}
                            </Link>
                          ))}
                          {/* View category link */}
                          <Link
                            href={`/catalog?category=${encodeURIComponent(cat)}`}
                            onClick={closeMenu}
                            style={{
                              padding: '8px 14px',
                              fontSize: '12px',
                              fontWeight: 700,
                              textDecoration: 'none',
                              color: '#FAC41A',
                              borderLeft: '2px solid rgba(250,196,26,0.3)',
                              marginTop: '2px',
                            }}
                          >
                            {lang === 'hi' ? `सभी ${catLabel(cat)} देखें →` : `View all ${catLabel(cat)} →`}
                          </Link>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── My Order ── */}
            <Link href="/cart" onClick={closeMenu} style={{
              padding: '14px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '1px',
              background: pathname === '/cart' ? 'rgba(250,196,26,0.15)' : 'transparent',
              color: pathname === '/cart' ? '#FAC41A' : 'rgba(255,255,255,0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              {lang === 'hi' ? 'मेरा ऑर्डर' : 'My Order'}
              {itemCount > 0 && (
                <span style={{ background: '#FAC41A', color: '#7f1d1d', fontSize: '11px', fontWeight: 900, borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

            {/* ── Language toggle ── */}
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                {lang === 'hi' ? 'भाषा' : 'Language'}
              </span>
              <button
                onClick={() => { setLang(lang === 'en' ? 'hi' : 'en'); closeMenu() }}
                style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', padding: 0 }}
              >
                <span style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 700, background: lang === 'en' ? '#FAC41A' : 'transparent', color: lang === 'en' ? '#7f1d1d' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>EN</span>
                <span style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 700, background: lang === 'hi' ? '#FAC41A' : 'transparent', color: lang === 'hi' ? '#7f1d1d' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>हिं</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
