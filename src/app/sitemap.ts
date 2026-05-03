import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/supabase/products'
import { getCategories } from '@/lib/supabase/categories'
import { toSlug } from '@/lib/categorySlug'

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
      const catSlug = toSlug(cat.name)
      categoryEntries.push({
        url: `${baseUrl}/catalog/c/${catSlug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })
      for (const sub of cat.subcategories) {
        categoryEntries.push({
          url: `${baseUrl}/catalog/c/${catSlug}/${toSlug(sub.name)}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
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
