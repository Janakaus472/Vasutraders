'use client'

import { useState, useEffect, useMemo } from 'react'
import { Order } from '@/lib/supabase/orders'

interface CustomerRow {
  phone: string
  name: string
  shopName: string
  locality: string
  email: string
  orderCount: number
  lastOrder: string
}

export default function CustomersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [emailMap, setEmailMap] = useState<Record<string, { email: string; name?: string; shop_name?: string }>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/customer-email').then(r => r.json()),
    ])
      .then(([ordersRes, emailRes]) => {
        setOrders(ordersRes.orders ?? [])
        setEmailMap(emailRes.emails ?? {})
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const customers = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>()
    for (const order of orders) {
      const phone = order.phone
      const existing = map.get(phone)
      const emailData = emailMap[phone]
      if (!existing) {
        map.set(phone, {
          phone,
          name: order.contact_name || emailData?.name || '',
          shopName: order.shop_name || emailData?.shop_name || '',
          locality: order.locality,
          email: emailData?.email || '',
          orderCount: 1,
          lastOrder: order.created_at,
        })
      } else {
        existing.orderCount++
        if (order.created_at > existing.lastOrder) {
          existing.lastOrder = order.created_at
          if (!existing.name && order.contact_name) existing.name = order.contact_name
          if (!existing.shopName && order.shop_name) existing.shopName = order.shop_name
          existing.locality = order.locality
        }
        if (!existing.email && emailData?.email) existing.email = emailData.email
      }
    }
    return Array.from(map.values()).sort((a, b) => b.lastOrder.localeCompare(a.lastOrder))
  }, [orders, emailMap])

  const filtered = useMemo(() => {
    if (!search.trim()) return customers
    const q = search.toLowerCase()
    return customers.filter(c =>
      c.phone.includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.shopName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.locality.toLowerCase().includes(q)
    )
  }, [customers, search])

  const exportCSV = () => {
    const headers = ['Phone', 'Name', 'Shop Name', 'Locality', 'Email', 'Orders', 'Last Order']
    const rows = filtered.map(c => [
      c.phone,
      c.name,
      c.shopName,
      c.locality,
      c.email,
      c.orderCount,
      new Date(c.lastOrder).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Database</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} unique customer{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name, phone, shop, email, or area..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        style={{ fontSize: '16px' }}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading customers...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {search ? 'No customers match your search' : 'No customers yet'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Area</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(c => (
                  <tr key={c.phone} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{c.name || <span className="text-gray-400 italic">No name</span>}</div>
                      <div className="text-gray-500 text-sm">{c.shopName || <span className="text-gray-300 italic text-xs">No shop</span>}</div>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`tel:${c.phone}`} className="text-orange-500 font-medium text-sm">{c.phone}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{c.locality}</td>
                    <td className="px-4 py-3">
                      {c.email
                        ? <a href={`mailto:${c.email}`} className="text-blue-500 text-sm">{c.email}</a>
                        : <span className="text-gray-300 text-sm italic">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                        {c.orderCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {new Date(c.lastOrder).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
