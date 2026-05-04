import { getProducts } from '@/lib/supabase/products'
import { getCategories } from '@/lib/supabase/categories'
import { getSetting } from '@/lib/supabase/settings'
import CatalogClient from './CatalogClient'

interface HomeCategoryItem {
  name: string
  emoji: string
  visible: boolean
  imageUrl?: string
}

export const revalidate = 3600

export default async function CatalogPage() {
  const [products, cats, layout] = await Promise.all([
    getProducts(false).catch(() => []),
    getCategories().catch(() => []),
    getSetting<HomeCategoryItem[]>('home_layout', []),
  ])

  let orderedCats: string[]
  const catEmojis: Record<string, string> = {}
  const catImages: Record<string, string> = {}

  if (Array.isArray(layout) && layout.length > 0) {
    orderedCats = layout.filter(l => l.visible).map(l => l.name)
    layout.forEach(l => {
      catEmojis[l.name] = l.emoji || '📦'
      if (l.imageUrl) catImages[l.name] = l.imageUrl
    })
  } else {
    orderedCats = cats.map(c => c.name)
  }

  const catSubMap: Record<string, string[]> = {}
  cats.forEach(c => {
    if (c.subcategories) catSubMap[c.name] = c.subcategories.map(s => s.name)
  })

  return (
    <CatalogClient
      initialProducts={products}
      initialOrderedCats={orderedCats}
      initialCatEmojis={catEmojis}
      initialCatImages={catImages}
      initialCatSubMap={catSubMap}
    />
  )
}
