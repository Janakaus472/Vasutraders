import { getProducts } from '@/lib/supabase/products'
import { getCategories, CategoryWithSubs } from '@/lib/supabase/categories'
import { getSetting } from '@/lib/supabase/settings'
import HomePageClient from './HomePageClient'
import { StoreInfo, DEFAULT_STORE_INFO } from './api/admin/store-info/route'

export const revalidate = 3600

export default async function HomePage() {
  const [products, dbCats, layout, storeInfo] = await Promise.all([
    getProducts(false).catch(() => []),
    getCategories().catch((): CategoryWithSubs[] => []),
    getSetting<{ name: string; emoji: string; visible: boolean }[]>('home_layout', []).catch(() => []),
    getSetting<StoreInfo>('store_info', DEFAULT_STORE_INFO).catch(() => DEFAULT_STORE_INFO),
  ])

  // Build ordered category list with counts
  const counts: Record<string, number> = {}
  products.forEach(p => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1 })
  const orderedNames = dbCats.map(c => c.name)
  const allCatNames = [
    ...orderedNames.filter(n => counts[n]),
    ...Object.keys(counts).filter(n => !orderedNames.includes(n)),
  ]
  const categories = allCatNames.map(name => ({ name, count: counts[name] || 0 }))

  return <HomePageClient categories={categories} totalProducts={products.length} layout={layout} storeInfo={{ ...DEFAULT_STORE_INFO, ...storeInfo }} />
}
