import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/supabase/products'
import { getCategories } from '@/lib/supabase/categories'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.vasutraders.com'
  const now = new Date()

  let productEntries: MetadataRoute.Sitemap = []
  let categoryEntries: MetadataRoute.Sitemap = []

  try {
    const [products, categories] = await Promise.all([getProducts(), getCategories()])

    productEntries = products.map(p => ({
      url: `${baseUrl}/catalog/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    for (const cat of categories) {
      const encoded = encodeURIComponent(cat.name)
      categoryEntries.push({
        url: `${baseUrl}/catalog?category=${encoded}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })
      for (const sub of cat.subcategories) {
        categoryEntries.push({
          url: `${baseUrl}/catalog?category=${encoded}&subcategory=${encodeURIComponent(sub.name)}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        })
      }
    }
  } catch {
    // If DB fetch fails, sitemap still works with static pages
  }

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categoryEntries,
    ...productEntries,
  ]
}
