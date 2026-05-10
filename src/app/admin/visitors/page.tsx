'use client'

import { useEffect, useState } from 'react'

interface LocationStat { label: string; count: number }
interface LocationData {
  countries: LocationStat[]
  states: LocationStat[]
  cities: LocationStat[]
  total: number
  setupRequired?: boolean
}

const COUNTRY_FLAGS: Record<string, string> = {
  India: '🇮🇳', 'United States': '🇺🇸', 'United Kingdom': '🇬🇧', Australia: '🇦🇺',
  Canada: '🇨🇦', UAE: '🇦🇪', Singapore: '🇸🇬', 'New Zealand': '🇳🇿',
  Pakistan: '🇵🇰', Bangladesh: '🇧🇩', Nepal: '🇳🇵', 'Sri Lanka': '🇱🇰',
  Malaysia: '🇲🇾', 'South Africa': '🇿🇦', Germany: '🇩🇪', France: '🇫🇷',
  Japan: '🇯🇵', China: '🇨🇳', 'Saudi Arabia': '🇸🇦', Qatar: '🇶🇦',
  Kuwait: '🇰🇼', Bahrain: '🇧🇭', Oman: '🇴🇲', Maldives: '🇲🇻',
}

const DAYS_OPTIONS = [7, 14, 30, 60, 90]

export default function VisitorsPage() {
  const [data, setData] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [days, setDays] = useState(30)
  const [tab, setTab] = useState<'countries' | 'states' | 'cities'>('countries')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`/api/analytics?type=locations&days=${days}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 401 ? 'auth' : 'error')
        return r.json()
      })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message === 'auth' ? 'Session expired — please refresh the page.' : 'Failed to load data. Please try again.'); setLoading(false) })
  }, [days])

  const activeData = data ? data[tab] : []
  const total = data?.total || 0
  const indiaCount = data?.countries.find(c => c.label === 'India')?.count || 0

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: '860px' }}>
      <style>{`
        .visitors-stat-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }
        @media (min-width: 480px) {
          .visitors-stat-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .visitors-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          overflow-x: auto;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
        }
        .visitors-tabs::-webkit-scrollbar { display: none; }
        .visitors-tab {
          padding: 8px 14px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .visitors-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          padding: 12px 16px;
          align-items: center;
          position: relative;
          gap: 8px;
        }
        .visitors-th {
          display: grid;
          grid-template-columns: 1fr auto auto;
          padding: 10px 16px;
          gap: 8px;
        }
        .bar-fill {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          background: rgba(59,130,246,0.07);
          border-radius: 0 4px 4px 0;
          pointer-events: none;
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 5vw, 1.8rem)', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>🌍 Visitor Locations</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0' }}>Where your website visitors are coming from</p>
        </div>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          style={{ border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '8px 12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', background: '#fff', flexShrink: 0 }}
        >
          {DAYS_OPTIONS.map(d => <option key={d} value={d}>Last {d} days</option>)}
        </select>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '12px', padding: '14px 16px', color: '#DC2626', fontWeight: 600, fontSize: '14px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Setup required state */}
      {!loading && !error && data?.setupRequired && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
          <p style={{ fontWeight: 700, fontSize: '15px', color: '#92400e', margin: '0 0 8px' }}>⚙️ One-time setup required</p>
          <p style={{ fontSize: '13px', color: '#78350f', margin: '0 0 12px' }}>
            Location tracking columns are missing from your database. Run this SQL in your{' '}
            <strong>Supabase Dashboard → SQL Editor</strong>:
          </p>
          <pre style={{ background: '#1a1a1a', color: '#a3e635', borderRadius: '10px', padding: '14px', fontSize: '12px', overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{`ALTER TABLE public.analytics ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.analytics ADD COLUMN IF NOT EXISTS country_code text;
ALTER TABLE public.analytics ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.analytics ADD COLUMN IF NOT EXISTS city text;
CREATE INDEX IF NOT EXISTS idx_analytics_country_code ON public.analytics(country_code);`}</pre>
          <p style={{ fontSize: '12px', color: '#92400e', margin: '10px 0 0' }}>
            After running the SQL, refresh this page. New visits will automatically include location data.
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="visitors-stat-grid">
        <StatCard label="Total Visits" value={loading ? '…' : total.toLocaleString()} icon="👁️" color="#3b82f6" />
        <StatCard label="From India" value={loading ? '…' : indiaCount.toLocaleString()} icon="🇮🇳" color="#f97316" />
        <StatCard label="Countries" value={loading ? '…' : (data?.countries.length || 0).toString()} icon="🌐" color="#8b5cf6" />
      </div>

      {/* Tabs */}
      <div className="visitors-tabs">
        {(['countries', 'states', 'cities'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="visitors-tab"
            style={{
              background: tab === t ? '#1a1a1a' : '#f3f4f6',
              color: tab === t ? '#fff' : '#374151',
            }}
          >
            {t === 'countries' ? '🌐 Countries' : t === 'states' ? '🗺️ States' : '🏙️ Cities'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '15px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
            Loading…
          </div>
        ) : !activeData || activeData.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
            <p style={{ color: '#6b7280', fontWeight: 600, fontSize: '15px', margin: '0 0 6px' }}>
              {tab === 'states' ? 'No Indian visitors recorded yet' : 'No location data yet'}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
              Location tracking is active. New visits will appear here automatically.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="visitors-th" style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span>{tab === 'countries' ? 'Country' : tab === 'states' ? 'State' : 'City'}</span>
              <span style={{ textAlign: 'right', minWidth: '48px' }}>Visits</span>
              <span style={{ textAlign: 'right', minWidth: '48px' }}>Share</span>
            </div>

            {activeData.map((item, i) => {
              const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0'
              const barPct = activeData[0]?.count > 0 ? (item.count / activeData[0].count) * 100 : 0
              const flag = tab === 'countries' ? (COUNTRY_FLAGS[item.label] || '🌐') : ''
              return (
                <div
                  key={item.label}
                  className="visitors-row"
                  style={{ borderBottom: i < activeData.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                >
                  <div className="bar-fill" style={{ width: `${barPct * 0.6}%` }} />
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a', position: 'relative', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {flag && <span style={{ marginRight: '6px' }}>{flag}</span>}
                    {item.label}
                  </span>
                  <span style={{ textAlign: 'right', fontWeight: 700, fontSize: '14px', color: '#374151', position: 'relative', minWidth: '48px' }}>
                    {item.count.toLocaleString()}
                  </span>
                  <span style={{ textAlign: 'right', fontSize: '12px', color: '#9ca3af', position: 'relative', minWidth: '48px' }}>
                    {pct}%
                  </span>
                </div>
              )
            })}
          </>
        )}
      </div>

      {!loading && !error && total === 0 && (
        <div style={{ marginTop: '16px', padding: '14px 16px', background: '#fefce8', border: '1.5px solid #fde68a', borderRadius: '12px', fontSize: '13px', color: '#92400e' }}>
          <strong>Note:</strong> Location data is captured from new visits going forward. Visits recorded before this feature was added won&apos;t have location info.
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <div style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 800, color }}>{value}</div>
    </div>
  )
}
