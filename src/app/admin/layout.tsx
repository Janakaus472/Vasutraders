'use client'

import { adminLogout } from '@/hooks/useAdminGuard'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const SESSION_KEY = 'vt_admin_session'
const SESSION_TTL = 24 * 60 * 60 * 1000

const navItems = [
  { href: '/admin', label: 'Home', icon: '🏠' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
  { href: '/admin/orders', label: 'Orders', icon: '🛒' },
  { href: '/admin/analysis', label: 'Analysis', icon: '📈' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const session = JSON.parse(raw)
        if (session.expires > Date.now()) {
          setIsAdmin(true)
          // Re-set the httpOnly cookie in case it expired or was never set
          if (session.u && session.p) {
            fetch('/api/admin/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: session.u, password: session.p }),
            }).catch(() => {})
          }
        } else {
          localStorage.removeItem(SESSION_KEY)
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError('Invalid username or password.')
        setPassword('')
        return
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify({ expires: Date.now() + SESSION_TTL, u: username, p: password }))
      setIsAdmin(true)
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    adminLogout()
    // Clear the httpOnly cookie server-side
    fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {})
    setIsAdmin(false)
    setUsername('')
    setPassword('')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-center">
          <div className="text-4xl animate-pulse">🔐</div>
          <p className="mt-2">Checking access…</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '24px 16px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          .login-input { outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
          .login-input:focus { border-color: #FF6B00 !important; box-shadow: 0 0 0 3px rgba(255,107,0,0.15) !important; }
        `}</style>
        <div style={{
          background: 'rgba(255,245,235,0.96)', backdropFilter: 'blur(20px)',
          borderRadius: '24px', padding: '40px 32px', width: '100%', maxWidth: '400px',
          boxShadow: '0 20px 60px rgba(92,45,15,0.2), 0 0 0 1px rgba(194,105,26,0.15)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg, #FF6B00, #C2410C)',
              borderRadius: '18px', boxShadow: '0 8px 24px rgba(255,107,0,0.35)',
              marginBottom: '16px', fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '2rem', color: '#fff',
            }}>V</div>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem',
              color: '#5C2D0F', letterSpacing: '2px', margin: '0 0 4px',
            }}>VASU TRADERS</h1>
            <p style={{ color: '#8B4513', fontSize: '13px', fontWeight: 600, margin: 0 }}>Admin Panel</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#5C2D0F', marginBottom: '7px' }}>👤 Username</label>
              <input type="text" className="login-input" value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                placeholder="Enter username" autoFocus autoComplete="username"
                style={{ width: '100%', padding: '13px 16px', fontSize: '16px', borderRadius: '12px', border: '2px solid #FFD4A0', background: '#FFFAF5', color: '#1a1a1a', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#5C2D0F', marginBottom: '7px' }}>🔑 Password</label>
              <input type="password" className="login-input" value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Enter password" autoComplete="current-password"
                style={{ width: '100%', padding: '13px 16px', fontSize: '16px', borderRadius: '12px', border: '2px solid #FFD4A0', background: '#FFFAF5', color: '#1a1a1a', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, boxSizing: 'border-box' }}
              />
            </div>
            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', color: '#DC2626', fontSize: '13px', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}
            <button type="submit" disabled={!username.trim() || !password || loginLoading}
              style={{
                width: '100%', padding: '15px',
                background: (username.trim() && password && !loginLoading) ? 'linear-gradient(135deg, #FF6B00, #C2410C)' : '#E5E7EB',
                color: (username.trim() && password && !loginLoading) ? '#fff' : '#9CA3AF',
                border: 'none', borderRadius: '14px',
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '15px',
                cursor: (username.trim() && password && !loginLoading) ? 'pointer' : 'not-allowed',
                boxShadow: (username.trim() && password && !loginLoading) ? '0 6px 20px rgba(255,107,0,0.35)' : 'none',
                transition: 'all 0.2s', marginTop: '4px',
              }}
            >
              {loginLoading ? '⏳ Verifying...' : 'Login →'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`bg-[#1a3c5e] text-white flex flex-col transition-all duration-300 fixed h-full z-30
        ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0 md:w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {sidebarOpen && <span className="font-bold text-lg">Vasu Traders</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/70 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center">
            {sidebarOpen ? '✕' : '▶'}
          </button>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive ? 'bg-orange-500 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}>
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/catalog" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 text-white/70 hover:text-white">
            <span className="text-xl">🏪</span>
            {sidebarOpen && <span>Back to Store</span>}
          </Link>
        </div>
      </aside>
      <main className="flex-1 md:ml-20 min-w-0">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(prev => !prev)}
            className="text-gray-600 hover:text-gray-900 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100">
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-700 flex-1">Admin Panel</span>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}
