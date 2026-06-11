import { Metadata } from 'next'
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

interface PageProps {
  searchParams: Promise<{ category?: string; subcategory?: string }>
}

export const metadata: Metadata = {
  title: { absolute: 'Wholesale Product Catalog | Vasu Traders Indore' },
  description: 'Browse the full wholesale product catalog of Vasu Traders, Indore. Playing cards, poker chips, party balloons, rubber bands, sports goods and more — bulk pricing for retailers across India.',
  alternates: { canonical: 'https://www.vasutraders.com/catalog' },
  openGraph: {
    title: 'Wholesale Product Catalog | Vasu Traders Indore',
    description: 'Browse the full wholesale product catalog of Vasu Traders, Indore. Playing cards, poker chips, party balloons, rubber bands, sports goods and more.',
    url: 'https://www.vasutraders.com/catalog',
    images: [{ url: '/logo.png', alt: 'Vasu Traders Wholesale Catalog — Indore' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wholesale Product Catalog | Vasu Traders Indore',
    description: 'Playing cards, poker chips, party balloons, rubber bands, sports goods and more — bulk pricing for retailers across India.',
    images: ['/logo.png'],
  },
}

export const dynamic = 'force-dynamic'

export default async function CatalogPage({ searchParams }: PageProps) {
  const { category: initialCategory, subcategory: initialSubcategory } = await searchParams
  const [products, cats, layout] = await Promise.all([
    getProducts(false).catch(() => []),
    getCategories().catch(() => []),
    getSetting<HomeCategoryItem[]>('home_layout', []),
  ])

  const catEmojis: Record<string, string> = {}
  const catImages: Record<string, string> = {}

  // Merge saved layout with live DB categories so newly-added categories
  // always appear even if admin hasn't re-saved the home layout yet.
  const layoutMap = new Map((layout || []).map((l: HomeCategoryItem) => [l.name, l]))
  const allDbCatNames = cats.map(c => c.name)
  const savedVisible = (layout || []).filter((l: HomeCategoryItem) => l.visible).map((l: HomeCategoryItem) => l.name)
  const newCatNames = allDbCatNames.filter(n => !layoutMap.has(n))
  const orderedCats: string[] = [...savedVisible, ...newCatNames]

  ;(layout || []).forEach((l: HomeCategoryItem) => {
    catEmojis[l.name] = l.emoji || '📦'
    if (l.imageUrl) catImages[l.name] = l.imageUrl
  })

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
      initialCategory={initialCategory || 'All'}
      initialSubcategory={initialSubcategory || null}
    />
  )
}
