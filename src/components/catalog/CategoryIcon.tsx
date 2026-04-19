// Fallback icon shown when a product has no imageUrl
const ICONS: Record<string, { symbol: string; color: string }> = {
  'Playing Cards':       { symbol: '♠', color: '#1a1a2e' },
  'Party Balloons':      { symbol: '🎈', color: '#ec4899' },
  'Kanche & Glass Balls':{ symbol: '🔮', color: '#6366f1' },
  'Sports & Games':      { symbol: '⚽', color: '#16a34a' },
  'Rubber Bands':        { symbol: '⭕', color: '#eab308' },
  'Poker Chips':         { symbol: '🎰', color: '#dc2626' },
  'Toothbrushes':        { symbol: '🪥', color: '#0891b2' },
  'Boric Acid':          { symbol: '🧪', color: '#7c3aed' },
  'Tapes':               { symbol: '🖊️', color: '#d97706' },
}

interface Props {
  category: string
  size?: 'card' | 'modal'
}

export default function CategoryIcon({ category, size = 'card' }: Props) {
  const icon = ICONS[category] || { symbol: '📦', color: '#6b7280' }
  const fontSize = size === 'modal' ? '120px' : '96px'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '10px',
      opacity: 0.85,
    }}>
      <span style={{ fontSize, lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }}>
        {icon.symbol}
      </span>
      <span style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
        color: icon.color, opacity: 0.7, textTransform: 'uppercase',
      }}>
        {category}
      </span>
    </div>
  )
}
