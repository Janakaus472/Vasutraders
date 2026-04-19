'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { BUSINESS_NAME } from '@/lib/constants'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { itemCount } = useCart()
  const { lang, setLang } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isHome = pathname === '/'
  const isAdminPage = pathname.startsWith('/admin')

  const closeMenu = () => setMobileMenuOpen(false)

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
          padding: '4px 16px',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center',
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
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          {/* Logo */}
          {isHome ? (
            <Link href="/catalog" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, textDecoration: 'none' }}>
              <div style={{
                background: '#FAC41A',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.5rem',
                color: '#7f1d1d',
                fontWeight: 900,
                flexShrink: 0,
              }}>
                V
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: '#fff', letterSpacing: '2px' }}>{BUSINESS_NAME}</div>
                <div style={{ color: '#FAC41A', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Since 2005</div>
              </div>
            </Link>
          ) : (
            <button
              onClick={() => router.back()}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div style={{
                background: '#FAC41A',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.5rem',
                color: '#7f1d1d',
                fontWeight: 900,
                flexShrink: 0,
              }}>
                V
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: '#fff', letterSpacing: '2px' }}>{BUSINESS_NAME}</div>
                <div style={{ color: '#FAC41A', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Since 2005</div>
              </div>
            </button>
          )}

          {/* Mobile menu button */}
          <button
            className="sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center' }} className="hidden sm:flex">
            <Link
              href="/catalog"
              className={`header-nav-link ${pathname === '/catalog' ? 'header-nav-link-active' : ''}`}
            >
              Products
            </Link>
            <Link
              href="/cart"
              className={`header-nav-link ${pathname === '/cart' ? 'header-nav-link-active' : ''}`}
            >
              My Order
            </Link>
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <span style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 700, background: lang === 'en' ? '#FAC41A' : 'transparent', color: lang === 'en' ? '#7f1d1d' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>EN</span>
              <span style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 700, background: lang === 'hi' ? '#FAC41A' : 'transparent', color: lang === 'hi' ? '#7f1d1d' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>हिं</span>
            </button>

            {/* Cart button */}
            <Link
              href="/cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FAC41A',
                color: '#7f1d1d',
                fontWeight: 800,
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13px',
                transition: 'all 0.15s',
                flexShrink: 0,
                letterSpacing: '0.5px',
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span style={{
                  background: '#7f1d1d',
                  color: '#FAC41A',
                  fontSize: '10px',
                  fontWeight: 900,
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'popIn 0.3s ease',
                }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div
            className="sm:hidden"
            style={{
              position: 'absolute',
              top: '60px',
              left: 0,
              right: 0,
              background: '#7f1d1d',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Link href="/catalog" onClick={closeMenu} style={{
              padding: '14px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              background: pathname === '/catalog' ? 'rgba(250,196,26,0.15)' : 'transparent',
              color: pathname === '/catalog' ? '#FAC41A' : 'rgba(255,255,255,0.7)',
              display: 'block',
            }}>
              Products
            </Link>
            <Link href="/cart" onClick={closeMenu} style={{
              padding: '14px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              background: pathname === '/cart' ? 'rgba(250,196,26,0.15)' : 'transparent',
              color: pathname === '/cart' ? '#FAC41A' : 'rgba(255,255,255,0.7)',
              display: 'block',
            }}>
              My Order
            </Link>
          </div>
        )}
      </header>
    </>
  )
}
