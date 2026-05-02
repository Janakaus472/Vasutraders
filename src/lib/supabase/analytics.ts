import { getAdminSupabase } from './client'

export interface AnalyticsEvent {
  id?: string
  event_type: 'page_view' | 'product_view'
  page: string
  product_id?: string
  product_name?: string
  category?: string
  referrer?: string
  user_agent?: string
  created_at?: string
}

export interface ProductViewCount {
  product_id: string
  product_name: string
  category: string
  views: number
}

export interface PageViewCount {
  page: string
  views: number
}

export interface DailyCount {
  date: string
  views: number
}

// Ensure the analytics table exists
let tableChecked = false
async function ensureTable() {
  if (tableChecked) return
  const db = getAdminSupabase()
  // Try a simple select — if it fails, create the table
  const { error } = await db.from('analytics').select('id').limit(1)
  if (error && error.code === 'PGRST205') {
    // Table doesn't exist — create it via raw SQL
    const { error: createError } = await db.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.analytics (
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
        CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);
        CREATE INDEX IF NOT EXISTS idx_analytics_product_id ON public.analytics(product_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics(created_at);
        ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
        CREATE POLICY IF NOT EXISTS "Allow service role full access" ON public.analytics FOR ALL USING (true);
        CREATE POLICY IF NOT EXISTS "Allow anon insert" ON public.analytics FOR INSERT WITH CHECK (true);
      `
    })
    if (createError) {
      console.warn('Could not auto-create analytics table. Please create it manually in Supabase Dashboard:', createError.message)
    }
  }
  tableChecked = true
}

export async function recordEvent(event: AnalyticsEvent) {
  await ensureTable()
  const db = getAdminSupabase()
  const { error } = await db.from('analytics').insert({
    event_type: event.event_type,
    page: event.page,
    product_id: event.product_id || null,
    product_name: event.product_name || null,
    category: event.category || null,
    referrer: event.referrer || null,
    user_agent: event.user_agent || null,
  })
  if (error) console.error('Analytics insert error:', error.message)
}

export async function getAnalyticsSummary(days = 30) {
  await ensureTable()
  const db = getAdminSupabase()
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString()

  // Total page views
  const { count: totalPageViews } = await db
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'page_view')
    .gte('created_at', sinceStr)

  // Total product views
  const { count: totalProductViews } = await db
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'product_view')
    .gte('created_at', sinceStr)

  // Today's views
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count: todayViews } = await db
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart.toISOString())

  // Product view counts (top products)
  const { data: productEvents } = await db
    .from('analytics')
    .select('product_id, product_name, category')
    .eq('event_type', 'product_view')
    .gte('created_at', sinceStr)
    .not('product_id', 'is', null)

  const productViewMap: Record<string, ProductViewCount> = {}
  ;(productEvents || []).forEach((e: any) => {
    if (!e.product_id) return
    if (!productViewMap[e.product_id]) {
      productViewMap[e.product_id] = {
        product_id: e.product_id,
        product_name: e.product_name || 'Unknown',
        category: e.category || '',
        views: 0,
      }
    }
    productViewMap[e.product_id].views++
  })
  const topProducts = Object.values(productViewMap).sort((a, b) => b.views - a.views).slice(0, 20)

  // Page view counts
  const { data: pageEvents } = await db
    .from('analytics')
    .select('page')
    .eq('event_type', 'page_view')
    .gte('created_at', sinceStr)

  const pageViewMap: Record<string, number> = {}
  ;(pageEvents || []).forEach((e: any) => {
    pageViewMap[e.page] = (pageViewMap[e.page] || 0) + 1
  })
  const topPages = Object.entries(pageViewMap)
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 15)

  // Daily views (last N days)
  const { data: allEvents } = await db
    .from('analytics')
    .select('created_at')
    .gte('created_at', sinceStr)
    .order('created_at', { ascending: true })

  const dailyMap: Record<string, number> = {}
  // Prefill all days
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().slice(0, 10)] = 0
  }
  ;(allEvents || []).forEach((e: any) => {
    const day = e.created_at?.slice(0, 10)
    if (day && day in dailyMap) dailyMap[day]++
  })
  const dailyViews: DailyCount[] = Object.entries(dailyMap).map(([date, views]) => ({ date, views }))

  return {
    totalPageViews: totalPageViews || 0,
    totalProductViews: totalProductViews || 0,
    todayViews: todayViews || 0,
    topProducts,
    topPages,
    dailyViews,
    days,
  }
}
