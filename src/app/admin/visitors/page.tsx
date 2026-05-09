'use client'

import { useEffect, useState } from 'react'

interface LocationStat { label: string; count: number }
interface LocationData {
  countries: LocationStat[]
  states: LocationStat[]
  cities: LocationStat[]
  total: number
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
  const [days, setDays] = useState(30)
  const [tab, setTab] = useState<'countries' | 'states' | 'cities'>('countries')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics?type=locations&days=${days}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [days])

  const activeData = data ? data[tab] : []
  const total = data?.total || 0
  const indiaCount = data?.countries.find(c => c.label === 'India')?.count || 0

  return (
    <div style={{ padding: '24px', maxWidth: '900px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>🌍 Visitor Locations</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0' }}>Where your website visitors are coming from</p>
        </div>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          style={{ border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '8px 14px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', background: '#fff' }}
        >
          {DAYS_OPTIONS.map(d => <option key={d} value={d}>Last {d} days</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
        <StatCard label="Total Visits" value={loading ? '…' : total.toLocaleString()} icon="👁️" color="#3b82f6" />
        <StatCard label="From India" value={loading ? '…' : indiaCount.toLocaleString()} icon="🇮🇳" color="#f97316" />
        <StatCard
          label="Countries"
          value={loading ? '…' : (data?.countries.length || 0).toString()}
          icon="🌐" color="#8b5cf6"
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['countries', 'states', 'cities'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 18px', borderRadius: '10px', border: 'none',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              background: tab === t ? '#1a1a1a' : '#f3f4f6',
              color: tab === t ? '#fff' : '#374151',
            }}
          >
            {t === 'countries' ? '🌐 Countries' : t === 'states' ? '🗺️ States (India)' : '🏙️ Cities'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontSize: '16px' }}>Loading…</div>
        ) : activeData.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
            <p style={{ color: '#6b7280', fontWeight: 600 }}>
              {tab === 'states'
                ? 'No Indian visitors recorded yet in this period'
                : 'No data yet — visits will appear here once people open the website'}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '8px' }}>
              Location tracking is active. New visits will show up automatically.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span>{tab === 'countries' ? 'Country' : tab === 'states' ? 'State' : 'City'}</span>
              <span style={{ textAlign: 'right' }}>Visits</span>
              <span style={{ textAlign: 'right' }}>Share</span>
            </div>

            {activeData.map((item, i) => {
              const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0'
              const barPct = activeData[0]?.count > 0 ? (item.count / activeData[0].count) * 100 : 0
              const flag = tab === 'countries' ? (COUNTRY_FLAGS[item.label] || '🌐') : ''
              return (
                <div
                  key={item.label}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 80px',
                    padding: '14px 20px', borderBottom: i < activeData.length - 1 ? '1px solid #f3f4f6' : 'none',
                    alignItems: 'center', position: 'relative',
                  }}
                >
                  {/* Progress bar background */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${barPct * 0.6}%`, background: 'rgba(59,130,246,0.06)',
                    borderRadius: '0 4px 4px 0',
                  }} />
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a', position: 'relative' }}>
                    {flag && <span style={{ marginRight: '8px' }}>{flag}</span>}
                    {item.label}
                  </span>
                  <span style={{ textAlign: 'right', fontWeight: 700, fontSize: '14px', color: '#374151', position: 'relative' }}>
                    {item.count.toLocaleString()}
                  </span>
                  <span style={{ textAlign: 'right', fontSize: '13px', color: '#9ca3af', position: 'relative' }}>
                    {pct}%
                  </span>
                </div>
              )
            })}
          </>
        )}
      </div>

      {!loading && total === 0 && (
        <div style={{ marginTop: '20px', padding: '16px', background: '#fefce8', border: '1.5px solid #fde68a', borderRadius: '12px', fontSize: '13px', color: '#92400e' }}>
          <strong>Note:</strong> Location data is captured from new visits going forward. Previous visits before this feature was added won&apos;t show location info.
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color }}>{value}</div>
    </div>
  )
}
