import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/supabase/products'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.vasutraders.com'

  let productEntries: MetadataRoute.Sitemap = []
  try {
    const products = await getProducts()
    productEntries = products.map(p => ({
      url: `${baseUrl}/catalog/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // If DB fetch fails, sitemap still works with static pages
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productEntries,
  ]
}
