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
  sub?: string
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

export interface RecentVisit {
  time: string
  page: string
  city: string
  state: string
  country: string
  device: string
  source: string
}

export async function getLocationStats(days = 30): Promise<{
  countries: LocationStat[]
  states: LocationStat[]
  cities: LocationStat[]
  recent: RecentVisit[]
  total: number
  setupRequired?: boolean
}> {
  const db = getAdminSupabase()
  const since = new Date()
  since.setDate(since.getDate() - days)

  type Row = { country: string; country_code: string; region: string; city: string; created_at: string; page: string; referrer: string; user_agent: string }
  const rows: Row[] = []
  const PAGE = 1000

  // Supabase caps a single response at 1000 rows, so page through everything
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from('analytics')
      .select('country, country_code, region, city, created_at, page, referrer, user_agent')
      .eq('event_type', 'page_view')
      .gte('created_at', since.toISOString())
      .not('country_code', 'is', null)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1)

    // Location columns don't exist — user needs to run the SQL migration
    if (error && error.code === '42703') {
      return { countries: [], states: [], cities: [], recent: [], total: 0, setupRequired: true }
    }
    if (error || !data) break
    rows.push(...(data as Row[]))
    if (data.length < PAGE) break
  }

  const countryMap: Record<string, number> = {}
  const stateMap: Record<string, number> = {}
  const cityMap: Record<string, { label: string; sub: string; count: number }> = {}

  const stateName = (r: Row) => r.region ? (r.country_code === 'IN' ? INDIA_STATES[r.region] || r.region : r.region) : ''

  for (const r of rows) {
    const countryLabel = r.country || r.country_code
    countryMap[countryLabel] = (countryMap[countryLabel] || 0) + 1

    const state = stateName(r)
    if (state) {
      const key = r.country_code === 'IN' ? state : `${state}, ${countryLabel}`
      stateMap[key] = (stateMap[key] || 0) + 1
    }

    if (r.city) {
      const city = decodeCity(r.city)
      const sub = [state, countryLabel].filter(Boolean).join(', ')
      const key = `${city}|${sub}`
      if (!cityMap[key]) cityMap[key] = { label: city, sub, count: 0 }
      cityMap[key].count++
    }
  }

  const toStats = (map: Record<string, number>): LocationStat[] =>
    Object.entries(map).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)

  const recent: RecentVisit[] = rows.slice(0, 50).map(r => ({
    time: r.created_at,
    page: r.page,
    city: r.city ? decodeCity(r.city) : 'Unknown city',
    state: stateName(r),
    country: r.country || r.country_code,
    device: deviceFromUA(r.user_agent),
    source: sourceFromReferrer(r.referrer),
  }))

  return {
    countries: toStats(countryMap).slice(0, 100),
    states: toStats(stateMap).slice(0, 100),
    cities: Object.values(cityMap).sort((a, b) => b.count - a.count).slice(0, 100),
    recent,
    total: rows.length,
  }
}

function deviceFromUA(ua: string | null): string {
  if (!ua) return 'Unknown'
  if (/iphone|ipad|ios/i.test(ua)) return 'iPhone/iPad'
  if (/android/i.test(ua)) return 'Android'
  if (/windows/i.test(ua)) return 'Windows'
  if (/mac os/i.test(ua)) return 'Mac'
  if (/linux/i.test(ua)) return 'Linux'
  return 'Other'
}

function sourceFromReferrer(ref: string | null): string {
  if (!ref) return 'Direct'
  try {
    const host = new URL(ref).hostname.replace(/^www\./, '')
    if (/vasutraders|vercel\.app/.test(host)) return 'Direct'
    if (/google\./.test(host)) return 'Google'
    if (/facebook|fb\.com/.test(host)) return 'Facebook'
    if (/instagram/.test(host)) return 'Instagram'
    if (/whatsapp|wa\.me/.test(host)) return 'WhatsApp'
    return host
  } catch { return 'Direct' }
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
