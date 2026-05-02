import { getProducts } from '@/lib/supabase/products'
import { getCategories, CategoryWithSubs } from '@/lib/supabase/categories'
import HomePageClient from './HomePageClient'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [products, dbCats] = await Promise.all([
    getProducts(false).catch(() => []),
    getCategories().catch((): CategoryWithSubs[] => []),
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

  return <HomePageClient categories={categories} totalProducts={products.length} />
}
