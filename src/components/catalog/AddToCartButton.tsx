'use client'

import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

interface AddToCartButtonProps {
  quantity: number
  onAdd: () => void
  onRemove: () => void
  disabled?: boolean
}

export default function AddToCartButton({ quantity, onAdd, onRemove, disabled }: AddToCartButtonProps) {
  const { t } = useLanguage()
  const [wiggle, setWiggle] = useState(false)

  const handleAdd = () => {
    setWiggle(true)
    setTimeout(() => setWiggle(false), 500)
    onAdd()
  }

  if (disabled) return (
    <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>{t.outOfStock}</span>
  )

  if (quantity === 0) {
    return (
      <button
        onClick={handleAdd}
        className={wiggle ? 'animate-wiggle' : ''}
        style={{
          background: '#0f2744', color: '#fff',
          fontWeight: 700, fontSize: '12px',
          padding: '8px 16px', borderRadius: '10px',
          border: 'none', cursor: 'pointer',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '0.3px', transition: 'background 0.15s, transform 0.1s',
          boxShadow: '0 2px 8px rgba(15,39,68,0.25)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.background = '#FF6B00'
          el.style.boxShadow = '0 4px 12px rgba(255,107,0,0.4)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.background = '#0f2744'
          el.style.boxShadow = '0 2px 8px rgba(15,39,68,0.25)'
        }}
      >
        {t.add}
      </button>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: '#FF6B00', borderRadius: '10px', overflow: 'hidden',
      boxShadow: '0 3px 10px rgba(255,107,0,0.35)',
      animation: 'popIn 0.3s cubic-bezier(.34,1.56,.64,1)',
    }}>
      <button
        onClick={onRemove}
        style={{
          width: '32px', height: '34px', color: '#fff',
          fontSize: '18px', fontWeight: 700, border: 'none',
          cursor: 'pointer', background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.18)')}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
      >
        −
      </button>
      <span style={{
        color: '#fff', fontWeight: 900, fontSize: '15px',
        minWidth: '26px', textAlign: 'center',
        fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px',
      }}>
        {quantity}
      </span>
      <button
        onClick={handleAdd}
        style={{
          width: '32px', height: '34px', color: '#fff',
          fontSize: '18px', fontWeight: 700, border: 'none',
          cursor: 'pointer', background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.18)')}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
      >
        +
      </button>
    </div>
  )
}
