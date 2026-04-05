'use client'

interface AddToCartButtonProps {
  quantity: number
  onAdd: () => void
  onRemove: () => void
  disabled?: boolean
}

export default function AddToCartButton({ quantity, onAdd, onRemove, disabled }: AddToCartButtonProps) {
  if (disabled) return (
    <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.5px' }}>
      Out of stock
    </span>
  )

  if (quantity === 0) {
    return (
      <button
        onClick={onAdd}
        style={{
          background: '#0f2744',
          color: '#fff',
          fontWeight: 700,
          fontSize: '12px',
          padding: '7px 16px',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.15s',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '0.3px',
        }}
        onMouseOver={e => ((e.currentTarget as HTMLButtonElement).style.background = '#FF6B00')}
        onMouseOut={e => ((e.currentTarget as HTMLButtonElement).style.background = '#0f2744')}
      >
        + Add
      </button>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: '#FF6B00',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <button
        onClick={onRemove}
        style={{
          width: '30px', height: '32px',
          color: '#fff', fontSize: '18px', fontWeight: 700,
          border: 'none', cursor: 'pointer',
          background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.1s',
        }}
        onMouseOver={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.15)')}
        onMouseOut={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
      >
        −
      </button>
      <span style={{
        color: '#fff', fontWeight: 800, fontSize: '14px',
        minWidth: '24px', textAlign: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {quantity}
      </span>
      <button
        onClick={onAdd}
        style={{
          width: '30px', height: '32px',
          color: '#fff', fontSize: '18px', fontWeight: 700,
          border: 'none', cursor: 'pointer',
          background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.1s',
        }}
        onMouseOver={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.15)')}
        onMouseOut={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
      >
        +
      </button>
    </div>
  )
}
