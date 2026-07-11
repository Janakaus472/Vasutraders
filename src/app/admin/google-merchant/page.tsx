'use client'

import { useState, useEffect } from 'react'
import { useProducts } from '@/hooks/useProducts'

export default function GoogleMerchantPage() {
  const [storeCode, setStoreCode] = useState('')
  const [inventory, setInventory] = useState<Record<string, boolean>>({})
  const [gmLoading, setGmLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const { products, isLoading: prodLoading } = useProducts(true)

  useEffect(() => {
    fetch('/api/admin/google-merchant')
      .then(r => r.json())
      .then(data => {
        setStoreCode(data.storeCode ?? '')
        setInventory(data.inventory ?? {})
      })
      .catch(e => setError(e.message))
      .finally(() => setGmLoading(false))
  }, [])

  const loading = gmLoading || prodLoading

  const toggleProduct = (id: string) => {
    setInventory(prev => ({ ...prev, [id]: !(prev[id] ?? true) }))
  }

  const selectAll = (val: boolean) => {
    const next: Record<string, boolean> = {}
    products.forEach(p => { next[p.id] = val })
    setInventory(next)
  }

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/admin/google-merchant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeCode, inventory }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  const inStoreCount = products.filter(p => inventory[p.id] ?? true).length
  const feedUrl = 'https://www.vasutraders.com/api/feed/local-inventory'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <span className="animate-pulse text-4xl">🛒</span>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: '800px' }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Google Merchant Center</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage local store inventory for Google Shopping</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold rounded-xl transition-colors text-sm shadow-sm"
        >
          {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Changes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center justify-between mb-5">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-4">✕</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Store Code */}
        <Section icon="🏪" title="Store Code">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Your Google Business Profile store code links this inventory to your Siyaganj store.
              Find it in <strong>Merchant Center → Settings → Linked accounts → Google Business Profile → Show details</strong>.
              If you can&apos;t find it, leave as <code>SIYAGANJ001</code> and update when found.
            </p>
            <input
              type="text"
              value={storeCode}
              onChange={e => setStoreCode(e.target.value)}
              placeholder="e.g. SIYAGANJ001"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-orange-400"
            />
          </div>
        </Section>

        {/* Feed URL */}
        <Section icon="🔗" title="Feed URL for Merchant Center">
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 10px' }}>
            Paste this URL in <strong>Merchant Center → Add-ons → Free local listings → Add inventory → Enter a link to your file</strong>.
            Google will auto-fetch it every 24 hours.
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <code style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#374151', wordBreak: 'break-all' }}>
              {feedUrl}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(feedUrl)}
              style={{ flexShrink: 0, padding: '10px 14px', background: '#1a3c5e', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Copy
            </button>
          </div>
        </Section>

        {/* Inventory */}
        <Section icon="📦" title={`Store Inventory (${inStoreCount} / ${products.length} products in store)`}>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px' }}>
            Toggle which products are available at your Siyaganj physical store. Google shows these in local search results.
          </p>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              style={{ flex: 1, minWidth: '180px', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
            />
            <button onClick={() => selectAll(true)} style={{ padding: '8px 14px', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              All In Store
            </button>
            <button onClick={() => selectAll(false)} style={{ padding: '8px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              All Out
            </button>
          </div>

          {/* Product list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '480px', overflowY: 'auto' }}>
            {filtered.map(p => {
              const inStore = inventory[p.id] ?? true
              return (
                <div
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '12px', cursor: 'pointer',
                    border: `1.5px solid ${inStore ? '#86efac' : '#e5e7eb'}`,
                    background: inStore ? '#f0fdf4' : '#f9fafb',
                    transition: 'all 0.15s',
                  }}
                >
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    {p.category && <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{p.category}</div>}
                  </div>
                  <div style={{
                    flexShrink: 0, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800,
                    background: inStore ? '#15803d' : '#e5e7eb',
                    color: inStore ? '#fff' : '#6b7280',
                  }}>
                    {inStore ? 'IN STORE' : 'NOT IN STORE'}
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '13px' }}>No products found</div>
            )}
          </div>
        </Section>

      </div>

      {/* Bottom save */}
      <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold rounded-xl transition-colors shadow-sm"
        >
          {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save All Changes'}
        </button>
      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', background: '#f9fafb', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <span style={{ fontWeight: 800, fontSize: '15px', color: '#1a1a1a' }}>{title}</span>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {children}
      </div>
    </div>
  )
}
