'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const STORAGE_KEY = 'vt_lead'

interface Props {
  href: string
  source: string
  context?: string
  style?: React.CSSProperties
  className?: string
  ariaLabel?: string
  children: React.ReactNode
}

function readSaved(): { name: string; phone: string; location: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { name: '', phone: '', location: '', ...JSON.parse(raw) }
  } catch {}
  return { name: '', phone: '', location: '' }
}

export default function WhatsAppLeadLink({ href, source, context, style, className, ariaLabel, children }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const saved = readSaved()
    setName(saved.name)
    setPhone(saved.phone)
    setLocation(saved.location)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  function openWhatsApp() {
    window.open(href, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your name'); return }
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 13) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    if (!location.trim()) { setError('Please enter your city / area'); return }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, phone, location })) } catch {}
    // keepalive lets the request finish even though we open WhatsApp right away
    fetch('/api/whatsapp-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, location, source, context, page: window.location.href }),
      keepalive: true,
    }).catch(() => {})
    openWhatsApp()
  }

  const input: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '12px 14px', fontSize: '16px',
    border: '1.5px solid #d1d5db', borderRadius: '8px', outline: 'none', fontFamily: 'inherit',
  }

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        className={className}
        aria-label={ariaLabel}
        onClick={(e) => { e.preventDefault(); setError(''); setOpen(true) }}
      >
        {children}
      </a>

      {open && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: '#1a1a1a' }}>Enquire on WhatsApp</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6b7280' }}>
              Just 3 quick details and we'll reply on WhatsApp{context ? ` about ${context}` : ''}.
            </p>

            <input
              value={name} onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="Your name" aria-label="Your name" autoComplete="name" maxLength={80} autoFocus
              style={{ ...input, marginBottom: '10px' }}
            />
            <input
              value={phone} onChange={(e) => { setPhone(e.target.value); setError('') }}
              type="tel" inputMode="tel" autoComplete="tel" placeholder="Mobile number" aria-label="Mobile number"
              style={{ ...input, marginBottom: '10px' }}
            />
            <input
              value={location} onChange={(e) => { setLocation(e.target.value); setError('') }}
              placeholder="City / area" aria-label="City or area" autoComplete="address-level2" maxLength={80}
              style={input}
            />
            {error && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#dc2626' }}>{error}</p>}

            <button
              type="submit"
              style={{ marginTop: '16px', width: '100%', background: '#25D366', color: '#fff', fontWeight: 800, fontSize: '15px', padding: '13px', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
            >
              Continue to WhatsApp
            </button>
          </form>
        </div>,
        document.body
      )}
    </>
  )
}
