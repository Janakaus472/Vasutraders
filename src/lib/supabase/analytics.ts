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
  country?: string
  country_code?: string
  region?: string
  city?: string
  created_at?: string
}

export interface LocationStat {
  label: string
  code?: string
  count: number
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

export async function recordEvent(event: AnalyticsEvent) {
  const db = getAdminSupabase()

  const fullRow = {
    event_type: event.event_type,
    page: event.page,
    product_id: event.product_id || null,
    product_name: event.product_name || null,
    category: event.category || null,
    referrer: event.referrer || null,
    user_agent: event.user_agent || null,
    country: event.country || null,
    country_code: event.country_code || null,
    region: event.region || null,
    city: event.city || null,
  }

  const { error } = await db.from('analytics').insert(fullRow)

  if (error) {
    // If location columns don't exist yet, fall back to basic fields so visits still get recorded
    if (error.code === '42703') {
      const { error: fallbackError } = await db.from('analytics').insert({
        event_type: event.event_type,
        page: event.page,
        product_id: event.product_id || null,
        product_name: event.product_name || null,
        category: event.category || null,
        referrer: event.referrer || null,
        user_agent: event.user_agent || null,
      })
      if (fallbackError) console.error('Analytics insert error:', fallbackError.message)
    } else {
      console.error('Analytics insert error:', error.message)
    }
  }
}

export async function getLocationStats(days = 30): Promise<{
  countries: LocationStat[]
  states: LocationStat[]
  cities: LocationStat[]
  total: number
  setupRequired?: boolean
}> {
  const db = getAdminSupabase()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, count, error } = await db
    .from('analytics')
    .select('country, country_code, region, city', { count: 'exact' })
    .eq('event_type', 'page_view')
    .gte('created_at', since.toISOString())
    .not('country_code', 'is', null)

  // Location columns don't exist — user needs to run the SQL migration
  if (error && error.code === '42703') {
    return { countries: [], states: [], cities: [], total: 0, setupRequired: true }
  }

  const rows = (data || []) as { country: string; country_code: string; region: string; city: string }[]

  const countryMap: Record<string, number> = {}
  const stateMap: Record<string, number> = {}
  const cityMap: Record<string, number> = {}

  for (const r of rows) {
    if (r.country_code) {
      const label = r.country || r.country_code
      countryMap[label] = (countryMap[label] || 0) + 1
    }
    if (r.country_code === 'IN' && r.region) {
      const label = INDIA_STATES[r.region] || r.region
      stateMap[label] = (stateMap[label] || 0) + 1
    }
    if (r.city) {
      const decoded = decodeCity(r.city)
      const key = r.region && r.country_code === 'IN'
        ? `${decoded}, ${INDIA_STATES[r.region] || r.region}`
        : decoded
      cityMap[key] = (cityMap[key] || 0) + 1
    }
  }

  const toStats = (map: Record<string, number>): LocationStat[] =>
    Object.entries(map).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)

  return {
    countries: toStats(countryMap).slice(0, 20),
    states: toStats(stateMap).slice(0, 20),
    cities: toStats(cityMap).slice(0, 20),
    total: count || rows.length,
  }
}

function decodeCity(city: string): string {
  try { return decodeURIComponent(city) } catch { return city }
}

const INDIA_STATES: Record<string, string> = {
  AN: 'Andaman & Nicobar', AP: 'Andhra Pradesh', AR: 'Arunachal Pradesh',
  AS: 'Assam', BR: 'Bihar', CH: 'Chandigarh', CT: 'Chhattisgarh',
  DL: 'Delhi', GA: 'Goa', GJ: 'Gujarat', HR: 'Haryana',
  HP: 'Himachal Pradesh', JK: 'Jammu & Kashmir', JH: 'Jharkhand',
  KA: 'Karnataka', KL: 'Kerala', LA: 'Ladakh', MP: 'Madhya Pradesh',
  MH: 'Maharashtra', MN: 'Manipur', ML: 'Meghalaya', MZ: 'Mizoram',
  NL: 'Nagaland', OR: 'Odisha', PB: 'Punjab', PY: 'Puducherry',
  RJ: 'Rajasthan', SK: 'Sikkim', TN: 'Tamil Nadu', TG: 'Telangana',
  TR: 'Tripura', UP: 'Uttar Pradesh', UT: 'Uttarakhand', WB: 'West Bengal',
}

export async function getAnalyticsSummary(days = 30) {
  const db = getAdminSupabase()
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString()

  const { count: totalPageViews } = await db
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'page_view')
    .gte('created_at', sinceStr)

  const { count: totalProductViews } = await db
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'product_view')
    .gte('created_at', sinceStr)

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count: todayViews } = await db
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart.toISOString())

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
      productViewMap[e.product_id] = { product_id: e.product_id, product_name: e.product_name || 'Unknown', category: e.category || '', views: 0 }
    }
    productViewMap[e.product_id].views++
  })
  const topProducts = Object.values(productViewMap).sort((a, b) => b.views - a.views).slice(0, 20)

  const { data: pageEvents } = await db
    .from('analytics').select('page').eq('event_type', 'page_view').gte('created_at', sinceStr)

  const pageViewMap: Record<string, number> = {}
  ;(pageEvents || []).forEach((e: any) => { pageViewMap[e.page] = (pageViewMap[e.page] || 0) + 1 })
  const topPages = Object.entries(pageViewMap).map(([page, views]) => ({ page, views })).sort((a, b) => b.views - a.views).slice(0, 15)

  const { data: allEvents } = await db
    .from('analytics').select('created_at').gte('created_at', sinceStr).order('created_at', { ascending: true })

  const dailyMap: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().slice(0, 10)] = 0
  }
  ;(allEvents || []).forEach((e: any) => {
    const day = e.created_at?.slice(0, 10)
    if (day && day in dailyMap) dailyMap[day]++
  })
  const dailyViews: DailyCount[] = Object.entries(dailyMap).map(([date, views]) => ({ date, views }))

  return { totalPageViews: totalPageViews || 0, totalProductViews: totalProductViews || 0, todayViews: todayViews || 0, topProducts, topPages, dailyViews, days }
}
