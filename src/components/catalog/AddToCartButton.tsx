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
          background: '#FAC41A', color: '#7f1d1d',
          fontWeight: 800, fontSize: '12px',
          padding: '8px 18px', borderRadius: '6px',
          border: 'none', cursor: 'pointer',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '0.5px', transition: 'background 0.15s, transform 0.1s',
          textTransform: 'uppercase',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.background = '#E5A800'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.background = '#FAC41A'
        }}
      >
        {t.add}
      </button>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: '#DC2626', borderRadius: '6px', overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
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
