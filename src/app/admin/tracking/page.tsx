'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts'

interface ProductView {
  product_id: string
  product_name: string
  category: string
  views: number
}

interface PageView {
  page: string
  views: number
}

interface DailyView {
  date: string
  views: number
}

interface Summary {
  totalPageViews: number
  totalProductViews: number
  todayViews: number
  topProducts: ProductView[]
  topPages: PageView[]
  dailyViews: DailyView[]
  days: number
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/catalog': 'Catalog',
  '/cart': 'Cart',
  '/auth': 'Login',
}

export default function TrackingPage() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [days, setDays] = useState(30)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics?days=${days}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [days])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-center">
          <div className="text-4xl animate-pulse">📊</div>
          <p className="mt-2">Loading tracking data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Website Tracking</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
          <p className="font-bold mb-2">Setup Required</p>
          <p>You need to create the <code className="bg-yellow-100 px-1 rounded">analytics</code> table in your Supabase project. Go to the SQL Editor in your Supabase Dashboard and run:</p>
          <pre className="mt-2 bg-white border border-yellow-200 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre">{`CREATE TABLE public.analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  page text NOT NULL,
  product_id text,
  product_name text,
  category text,
  referrer text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_analytics_event_type ON public.analytics(event_type);
CREATE INDEX idx_analytics_product_id ON public.analytics(product_id);
CREATE INDEX idx_analytics_created_at ON public.analytics(created_at);

-- Allow anyone to insert (for tracking)
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert" ON public.analytics
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON public.analytics
  FOR ALL USING (true);`}</pre>
        </div>
      </div>
    )
  }

  if (!data) return null

  const dailyChartData = data.dailyViews.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Website Tracking</h1>
          <p className="text-gray-400 text-sm">Monitor visitors & product views</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 14, 30, 60].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                days === d ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Today's Visits" value={data.todayViews} icon="👀" color="bg-blue-50 border-blue-100" />
        <StatCard label={`Page Views (${days}d)`} value={data.totalPageViews} icon="📄" color="bg-green-50 border-green-100" />
        <StatCard label={`Product Views (${days}d)`} value={data.totalProductViews} icon="📦" color="bg-orange-50 border-orange-100" />
        <StatCard
          label="Avg Daily"
          value={data.days > 0 ? Math.round((data.totalPageViews + data.totalProductViews) / data.days) : 0}
          icon="📈"
          color="bg-purple-50 border-purple-100"
        />
      </div>

      {/* Daily Traffic Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Daily Traffic</h2>
        {dailyChartData.every(d => d.views === 0) ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm">No traffic data yet. Views will appear here as visitors browse your site.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyChartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                labelFormatter={val => `Date: ${val}`}
              />
              <Area type="monotone" dataKey="views" stroke="#f97316" strokeWidth={2} fill="url(#viewsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
            Most Viewed Products
          </h2>
          {data.topProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-sm">No product views yet</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {data.topProducts.slice(0, 10).map((p, i) => (
                  <div key={p.product_id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-gray-100 text-gray-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm truncate">{p.product_name}</div>
                      {p.category && <div className="text-xs text-gray-400">{p.category}</div>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-orange-600 font-bold text-sm">{p.views}</span>
                      <span className="text-gray-400 text-xs">views</span>
                    </div>
                  </div>
                ))}
              </div>
              {data.topProducts.length > 3 && (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.topProducts.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="product_name"
                      width={120}
                      tick={{ fontSize: 11 }}
                      tickFormatter={val => val.length > 18 ? val.slice(0, 18) + '…' : val}
                    />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                    <Bar dataKey="views" fill="#f97316" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </>
          )}
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
            Most Visited Pages
          </h2>
          {data.topPages.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-3xl mb-2">📄</div>
              <p className="text-sm">No page view data yet</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {data.topPages.map((p, i) => (
                  <div key={p.page} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-blue-100 text-blue-700' :
                      i === 1 ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm truncate">
                        {PAGE_LABELS[p.page] || p.page}
                      </div>
                      {PAGE_LABELS[p.page] && (
                        <div className="text-xs text-gray-400 font-mono">{p.page}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">{p.views}</span>
                      <span className="text-gray-400 text-xs">visits</span>
                    </div>
                  </div>
                ))}
              </div>
              {data.topPages.length > 3 && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.topPages.slice(0, 6)} margin={{ left: 10 }}>
                    <XAxis
                      dataKey="page"
                      tick={{ fontSize: 11 }}
                      tickFormatter={val => PAGE_LABELS[val] || (val.length > 15 ? val.slice(0, 15) + '…' : val)}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                      labelFormatter={val => PAGE_LABELS[val] || val}
                    />
                    <Bar dataKey="views" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className={`${color} border rounded-2xl p-4`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  )
}
