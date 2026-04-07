'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { BUSINESS_NAME } from '@/lib/constants'
import { usePathname } from 'next/navigation'

const LOGO = (
  <>
    <div style={{ background: '#FF6B00', borderRadius: '10px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#fff', boxShadow: '0 3px 10px rgba(255,107,0,0.4)', flexShrink: 0 }}>
      V
    </div>
    <div style={{ lineHeight: 1.2 }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.25rem', color: '#FFE4CC', letterSpacing: '1px' }}>{BUSINESS_NAME}</div>
      <div style={{ color: '#FFD4B0', fontSize: '10px', fontWeight: 600 }}>Wholesale Supplier · Indore</div>
    </div>
  </>
)

export default function Header() {
  const { itemCount } = useCart()
  const { lang, setLang } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = pathname.startsWith('/admin')
  const isHome = pathname === '/'

  return (
    <header className="sticky top-0 z-50 animate-fadeInDown" style={{ background: 'rgba(139,26,26,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 2px 20px rgba(139,26,26,0.3)' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

        {/* Logo — home page: go to catalog, all other pages: go back */}
        {isHome ? (
          <Link href="/catalog" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, textDecoration: 'none' }}>
            {LOGO}
          </Link>
        ) : (
          <button
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {LOGO}
          </button>
        )}

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center' }} className="hidden sm:flex">
          <Link href="/catalog" style={{
            padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            textDecoration: 'none', transition: 'all 0.15s',
            background: pathname === '/catalog' ? 'rgba(255,255,255,0.18)' : 'transparent',
            color: pathname === '/catalog' ? '#fff' : '#93b4cf',
          }}>
            Products
          </Link>
          <Link href="/cart" style={{
            padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            textDecoration: 'none', transition: 'all 0.15s',
            background: pathname === '/cart' ? 'rgba(255,255,255,0.18)' : 'transparent',
            color: pathname === '/cart' ? '#fff' : '#93b4cf',
          }}>
            My Order
          </Link>
          {!isAdmin && (
            <Link href="/admin" style={{ padding: '6px 12px', fontSize: '11px', color: 'rgba(147,180,207,0.5)', textDecoration: 'none' }}>
              Admin
            </Link>
          )}
        </nav>

        {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            style={{
              display: 'flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px', overflow: 'hidden',
              cursor: 'pointer', padding: 0,
            }}
          >
            <span style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 700, background: lang === 'en' ? '#FF6B00' : 'transparent', color: lang === 'en' ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>EN</span>
            <span style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 700, background: lang === 'hi' ? '#FF6B00' : 'transparent', color: lang === 'hi' ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>हिं</span>
          </button>

        {/* Cart button */}
        <Link
          href="/cart"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#FF6B00', color: '#fff',
            fontWeight: 700, padding: '8px 18px',
            borderRadius: '10px', textDecoration: 'none',
            boxShadow: '0 3px 12px rgba(255,107,0,0.4)',
            fontSize: '13px', transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Order
          {itemCount > 0 && (
            <span style={{
              background: '#fff', color: '#FF6B00',
              fontSize: '10px', fontWeight: 900,
              borderRadius: '50%', width: '20px', height: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'popIn 0.3s ease',
            }}>
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
