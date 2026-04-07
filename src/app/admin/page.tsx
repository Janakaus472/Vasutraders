'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useProducts } from '@/hooks/useProducts'
import ProductTable from '@/components/admin/ProductTable'
import { Order } from '@/lib/supabase/orders'

const STATUS_COLORS: Record<string, string> = {
  pending: '#FF6B00',
  confirmed: '#15803d',
  delivered: '#0284C7',
  cancelled: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'नया',
  confirmed: 'कन्फर्म',
  delivered: 'डिलीवर',
  cancelled: 'रद्द',
}

export default function AdminDashboard() {
  const { products, isLoading, refetch } = useProducts(true)
  const [tab, setTab] = useState<'products' | 'orders'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (tab !== 'orders') return
    fetch('/api/orders')
      .then(r => r.json())
      .then(({ orders }) => setOrders(orders ?? []))
      .catch(console.error)
      .finally(() => setOrdersLoading(false))
  }, [tab])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
        {(['orders', 'products'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '15px',
              background: tab === t ? '#FF6B00' : '#f3f4f6',
              color: tab === t ? '#fff' : '#374151',
              transition: 'all 0.15s',
            }}
          >
            {t === 'orders' ? '🛒 ऑर्डर' : '📦 Products'}
          </button>
        ))}
        {tab === 'products' && (
          <Link
            href="/admin/products/new"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors ml-auto"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          >
            + Add Product
          </Link>
        )}
      </div>

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div>
          {ordersLoading ? (
            <div className="text-center py-8 text-gray-400">Loading orders…</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: '#8B4513', fontSize: '18px', fontWeight: 600 }}>
              अभी कोई ऑर्डर नहीं है
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(order => (
                <div key={order.id} style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  border: '1.5px solid #FFE0C0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#C2410C', letterSpacing: '2px', marginRight: '12px' }}>
                        {order.order_number}
                      </span>
                      <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                        {new Date(order.created_at).toLocaleString('hi-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: `2px solid ${STATUS_COLORS[order.status] ?? '#e5e7eb'}`,
                        color: STATUS_COLORS[order.status] ?? '#374151',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        background: '#fff',
                      }}
                    >
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: '14px' }}>
                    <div><span style={{ color: '#8B4513', fontSize: '12px', fontWeight: 600 }}>🏪 दुकान</span><br /><span style={{ fontWeight: 700 }}>{order.shop_name}</span></div>
                    <div><span style={{ color: '#8B4513', fontSize: '12px', fontWeight: 600 }}>👤 नाम</span><br /><span style={{ fontWeight: 700 }}>{order.contact_name || '—'}</span></div>
                    <div><span style={{ color: '#8B4513', fontSize: '12px', fontWeight: 600 }}>📱 मोबाइल</span><br /><a href={`tel:${order.phone}`} style={{ fontWeight: 700, color: '#FF6B00', textDecoration: 'none' }}>{order.phone}</a></div>
                    <div><span style={{ color: '#8B4513', fontSize: '12px', fontWeight: 600 }}>📍 इलाका</span><br /><span style={{ fontWeight: 700 }}>{order.locality}</span></div>
                  </div>

                  <div style={{ background: '#FFF8F0', borderRadius: '10px', padding: '12px 16px' }}>
                    {(order.items as { name: string; quantity: number; unit: string }[]).map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px' }}>
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                        <span style={{ color: '#FF6B00', fontWeight: 700 }}>× {item.quantity} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {tab === 'products' && (
        isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading products…</div>
        ) : (
          <ProductTable products={products} onRefresh={refetch} />
        )
      )}
    </div>
  )
}
