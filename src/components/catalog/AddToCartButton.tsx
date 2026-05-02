'use client'

import { useState, useRef } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { WHATSAPP_NUMBER } from '@/lib/constants'

const MAX_QTY = 1000

interface AddToCartButtonProps {
  quantity: number
  onAdd: () => void
  onRemove: () => void
  onSetQuantity?: (qty: number) => void
  disabled?: boolean
}

export default function AddToCartButton({ quantity, onAdd, onRemove, onSetQuantity, disabled }: AddToCartButtonProps) {
  const { t } = useLanguage()
  const [wiggle, setWiggle] = useState(false)
  const [localVal, setLocalVal] = useState<string | null>(null)
  const [showLimit, setShowLimit] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    if (quantity >= MAX_QTY) {
      setShowLimit(true)
      setTimeout(() => setShowLimit(false), 4000)
      return
    }
    setWiggle(true)
    setTimeout(() => setWiggle(false), 500)
    onAdd()
  }

  const commitVal = () => {
    if (localVal === null || !onSetQuantity) return
    const num = parseInt(localVal, 10)
    if (!isNaN(num) && num >= 0) {
      if (num > MAX_QTY) {
        onSetQuantity(MAX_QTY)
        setShowLimit(true)
        setTimeout(() => setShowLimit(false), 4000)
      } else {
        onSetQuantity(num)
        setShowLimit(false)
      }
    }
    setLocalVal(null)
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

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I need to order more than 1000 qty of a product. Can you help?')}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '2px',
        }}>
        <button
          onClick={onRemove}
          style={{
            width: '32px', height: '34px', color: '#fff',
            fontSize: '18px', fontWeight: 700, border: 'none',
            cursor: 'pointer', background: '#DC2626',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.1s',
            borderRadius: '6px 0 0 6px',
            boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#b91c1c')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#DC2626')}
        >
          −
        </button>
        {onSetQuantity ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={localVal !== null ? localVal : String(quantity)}
            onChange={e => {
              const v = e.target.value.replace(/[^0-9]/g, '')
              setLocalVal(v)
            }}
            onFocus={e => {
              setLocalVal(String(quantity))
              setTimeout(() => e.target.select(), 0)
            }}
            onBlur={commitVal}
            onKeyDown={e => { if (e.key === 'Enter') { commitVal(); inputRef.current?.blur() } }}
            style={{
              width: `${Math.max(3, (localVal !== null ? localVal : String(quantity)).length + 1)}ch`,
              minWidth: '44px',
              height: '34px',
              background: '#fff', color: '#B91C1C',
              fontWeight: 900, fontSize: '15px',
              textAlign: 'center',
              border: '2px solid #DC2626',
              outline: 'none',
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: '1px',
              boxSizing: 'content-box',
              padding: '0 4px',
            }}
          />
        ) : (
          <span style={{
            color: '#fff', fontWeight: 900, fontSize: '15px',
            minWidth: '34px', height: '34px',
            padding: '0 4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#DC2626',
            fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px',
          }}>
            {quantity}
          </span>
        )}
        <button
          onClick={handleAdd}
          style={{
            width: '32px', height: '34px', color: '#fff',
            fontSize: '18px', fontWeight: 700, border: 'none',
            background: quantity >= MAX_QTY ? '#9ca3af' : '#DC2626',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.1s',
            borderRadius: '0 6px 6px 0',
            boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
            cursor: quantity >= MAX_QTY ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={e => { if (quantity < MAX_QTY) (e.currentTarget as HTMLButtonElement).style.background = '#b91c1c' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = quantity >= MAX_QTY ? '#9ca3af' : '#DC2626' }}
        >
          +
        </button>
      </div>
      {showLimit && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '10px', fontWeight: 700,
            color: '#B91C1C', textDecoration: 'none',
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: '6px', padding: '4px 8px',
                  whiteSpace: 'nowrap',
          }}
        >
          Max 1000 — <span style={{ color: '#25D366', textDecoration: 'underline' }}>WhatsApp us</span> for bulk
        </a>
      )}
    </div>
  )
}
