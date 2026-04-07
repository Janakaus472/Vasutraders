'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'

interface Order {
  id: string
  created_at: string
  customerName: string
  customerPhone: string
  items: { productId: string; name: string; quantity: number }[]
  status: string
  total: number
}

interface ProductStats { name: string; quantity: number }
interface MonthlyStats { month: string; orders: number }
interface CustomerStats { name: string; orders: number }
interface StatusStats { name: string; value: number }

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  notifying: '#8b5cf6',
  notified: '#a855f7',
  confirmed: '#3b82f6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  notifying: 'Sending...',
  notified: 'Notified',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function AnalysisPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || [])
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load orders')
        setLoading(false)
      })
  }, [])

  const productStats: ProductStats[] = orders
    .flatMap(o => o.items.map(item => ({ name: item.name, quantity: item.quantity })))
    .reduce((acc, curr) => {
      const existing = acc.find(p => p.name === curr.name)
      if (existing) existing.quantity += curr.quantity
      else acc.push({ ...curr })
      return acc
    }, [] as ProductStats[])
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)

  const monthlyStats: MonthlyStats[] = (() => {
    const months: Record<string, number> = {}
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months[d.toISOString().slice(0, 7)] = 0
    }
    orders.forEach(o => {
      const m = o.created_at?.slice(0, 7)
      if (m && m in months) months[m]++
    })
    return Object.entries(months).map(([month, orders]) => ({ month, orders }))
  })()

  const customerStats: CustomerStats[] = (() => {
    const customers: Record<string, number> = {}
    orders.forEach(o => {
      const key = o.customerName || o.customerPhone || 'Unknown'
      customers[key] = (customers[key] || 0) + 1
    })
    return Object.entries(customers)
      .map(([name, orders]) => ({ name: name.slice(0, 20), orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10)
  })()

  const statusStats: StatusStats[] = (() => {
    const statuses: Record<string, number> = {}
    orders.forEach(o => {
      statuses[o.status] = (statuses[o.status] || 0) + 1
    })
    return Object.entries(statuses).map(([name, value]) => ({ name: STATUS_LABELS[name] || name, value }))
  })()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-center">
          <div className="text-4xl animate-pulse">📈</div>
          <p className="mt-2">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    )
  }

  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const deliveredCount = orders.filter(o => o.status === 'delivered').length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[140px]">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[140px]">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-orange-600">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[140px]">
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Products (by Quantity)</h3>
          {productStats.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No product data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productStats} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Order Trends</h3>
          {monthlyStats.every(m => m.orders === 0) ? (
            <p className="text-gray-400 text-center py-8">No order data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyStats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Breakdown</h3>
          {statusStats.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No status data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {statusStats.map((entry, index) => {
                    const statusKey = Object.entries(STATUS_LABELS).find(([, v]) => v === entry.name)?.[0] as keyof typeof STATUS_COLORS
                    return <Cell key={index} fill={statusKey ? STATUS_COLORS[statusKey] : '#9ca3af'} />
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Customers (by Orders)</h3>
          {customerStats.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No customer data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerStats} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}