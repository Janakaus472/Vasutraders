'use client'

import { useState, useEffect } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { Order } from '@/lib/supabase/orders'
import Link from 'next/link'

interface Stats {
  totalOrders: number
  todayOrders: number
  pendingOrders: number
  totalProducts: number
  revenue: number
  todayRevenue: number
}

export default function AdminDashboard() {
  const { products } = useProducts(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    revenue: 0,
    todayRevenue: 0,
  })

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(({ orders: orderList }) => {
        const today = new Date().toDateString()
        const todayOrders = orderList?.filter((o: Order) => new Date(o.created_at).toDateString() === today) || []
        
        const totalRevenue = orderList?.reduce((sum: number, o: Order) => {
          const items = o.items as { price?: number }[]
          return sum + (items?.reduce((s, i) => s + (i.price || 0), 0) || 0)
        }, 0) || 0
        
        const todayRevenue = todayOrders.reduce((sum: number, o: Order) => {
          const items = o.items as { price?: number }[]
          return sum + (items?.reduce((s, i) => s + (i.price || 0), 0) || 0)
        }, 0)

        setStats({
          totalOrders: orderList?.length || 0,
          todayOrders: todayOrders.length,
          pendingOrders: orderList?.filter((o: Order) => o.status === 'pending').length || 0,
          totalProducts: products.length,
          revenue: totalRevenue,
          todayRevenue,
        })
        setOrders(orderList || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [products.length])

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <span className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Orders" value={stats.totalOrders} icon="🛒" color="bg-blue-50" />
        <StatCard label="Today's Orders" value={stats.todayOrders} icon="📅" color="bg-green-50" />
        <StatCard label="Pending" value={stats.pendingOrders} icon="⏳" color="bg-yellow-50" />
        <StatCard label="Products" value={stats.totalProducts} icon="📦" color="bg-purple-50" />
        <StatCard label="Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} icon="💰" color="bg-emerald-50" />
        <StatCard label="Today" value={`₹${stats.todayRevenue.toLocaleString('en-IN')}`} icon="📈" color="bg-orange-50" />
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/products/new" className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
              <span>➕</span>
              <span className="text-sm font-medium">Add Product</span>
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
              <span>📋</span>
              <span className="text-sm font-medium">View Orders</span>
            </Link>
            <Link href="/admin/products" className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
              <span>📦</span>
              <span className="text-sm font-medium">Manage Inventory</span>
            </Link>
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
              <span>🔄</span>
              <span className="text-sm font-medium">Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Orders</h2>
            <Link href="/admin/orders" className="text-orange-500 text-sm hover:underline">View All →</Link>
          </div>
          {loading ? (
            <div className="text-center py-4 text-gray-400">Loading...</div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-4 text-gray-400">No orders yet</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <span className="font-semibold text-gray-800">{order.order_number}</span>
                    <span className="text-gray-500 text-sm ml-2">{order.shop_name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'notifying' ? 'bg-orange-100 text-orange-600' :
                    order.status === 'notified'  ? 'bg-purple-100 text-purple-700' :
                    order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    order.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Orders by Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Orders by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['pending', 'confirmed', 'delivered', 'cancelled'].map(status => {
            const count = orders.filter(o => o.status === status).length
            return (
              <div key={status} className="text-center p-4 rounded-xl bg-gray-50">
                <div className="text-2xl font-bold text-gray-800">{count}</div>
                <div className="text-gray-500 text-sm capitalize">{status}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className={`${color} rounded-2xl p-4`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  )
}