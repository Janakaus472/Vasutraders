'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const SESSION_KEY = 'vt_admin_session'
const SESSION_TTL = 24 * 60 * 60 * 1000 // 24 hours

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const session = JSON.parse(raw)
        if (session.expires > Date.now()) {
          router.replace('/admin')
          return
        }
      }
    } catch {}
    setChecking(false)
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/auth', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError('Invalid username or password.')
        setPassword('')
        return
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify({ expires: Date.now() + SESSION_TTL }))
      router.replace('/admin')
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) return null

  const ready = username.trim() && password && !loading

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-card { animation: fadeUp 0.5s ease forwards; }
        .login-input { outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .login-input:focus { border-color: #FF6B00 !important; box-shadow: 0 0 0 3px rgba(255,107,0,0.15) !important; }
      `}</style>

      <div className="login-card" style={{
        background:    'rgba(255,245,235,0.96)',
        backdropFilter:'blur(20px)',
        borderRadius:  '24px',
        padding:       '40px 32px',
        width:         '100%',
        maxWidth:      '400px',
        boxShadow:     '0 20px 60px rgba(92,45,15,0.2), 0 0 0 1px rgba(194,105,26,0.15)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #FF6B00, #C2410C)',
            borderRadius: '18px',
            boxShadow: '0 8px 24px rgba(255,107,0,0.35)',
            marginBottom: '16px',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '2rem', color: '#fff',
          }}>V</div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '2rem', color: '#5C2D0F',
            letterSpacing: '2px', margin: '0 0 4px',
          }}>VASU TRADERS</h1>
          <p style={{ color: '#8B4513', fontSize: '13px', fontWeight: 600, margin: 0 }}>
            Admin Panel
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{
              display: 'block', fontWeight: 700, fontSize: '13px',
              color: '#5C2D0F', marginBottom: '7px',
            }}>👤 Username</label>
            <input
              type="text"
              className="login-input"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder="Enter username"
              autoFocus
              autoComplete="username"
              style={{
                width: '100%', padding: '13px 16px', fontSize: '16px',
                borderRadius: '12px', border: '2px solid #FFD4A0',
                background: '#FFFAF5', color: '#1a1a1a',
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontWeight: 700, fontSize: '13px',
              color: '#5C2D0F', marginBottom: '7px',
            }}>🔑 Password</label>
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="Enter password"
              autoComplete="current-password"
              style={{
                width: '100%', padding: '13px 16px', fontSize: '16px',
                borderRadius: '12px', border: '2px solid #FFD4A0',
                background: '#FFFAF5', color: '#1a1a1a',
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#FEE2E2', border: '1px solid #FECACA',
              borderRadius: '10px', padding: '10px 14px',
              color: '#DC2626', fontSize: '13px', fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!ready}
            style={{
              width: '100%', padding: '15px',
              background: ready ? 'linear-gradient(135deg, #FF6B00, #C2410C)' : '#E5E7EB',
              color: ready ? '#fff' : '#9CA3AF',
              border: 'none', borderRadius: '14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: '15px',
              cursor: ready ? 'pointer' : 'not-allowed',
              boxShadow: ready ? '0 6px 20px rgba(255,107,0,0.35)' : 'none',
              transition: 'all 0.2s', marginTop: '4px',
            }}
          >
            {loading ? '⏳ Verifying...' : 'Login →'}
          </button>
        </form>
      </div>
    </div>
  )
}
