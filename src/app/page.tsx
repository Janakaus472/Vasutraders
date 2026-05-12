import { getProducts } from '@/lib/supabase/products'
import { getCategories, CategoryWithSubs } from '@/lib/supabase/categories'
import { getSetting } from '@/lib/supabase/settings'
import HomePageClient from './HomePageClient'
import { StoreInfo, DEFAULT_STORE_INFO } from './api/admin/store-info/route'
import { ThemeConfig, DEFAULT_THEME_CONFIG } from '@/types/theme'
import FestivalTheme from '@/components/themes/FestivalTheme'
import PromotionalTheme from '@/components/themes/PromotionalTheme'

export const revalidate = 60

export default async function HomePage() {
  const [products, dbCats, layout, storeInfo, rawTheme] = await Promise.all([
    getProducts(false).catch(() => []),
    getCategories().catch((): CategoryWithSubs[] => []),
    getSetting<{ name: string; emoji: string; visible: boolean }[]>('home_layout', []).catch(() => []),
    getSetting<StoreInfo>('store_info', DEFAULT_STORE_INFO).catch(() => DEFAULT_STORE_INFO),
    getSetting<Partial<ThemeConfig>>('theme_config', {}).catch(() => ({})),
  ])

  // Merge saved config with defaults
  const savedTheme = rawTheme as Partial<ThemeConfig>
  const themeConfig: ThemeConfig = {
    ...DEFAULT_THEME_CONFIG,
    ...savedTheme,
    festival: { ...DEFAULT_THEME_CONFIG.festival, ...(savedTheme?.festival ?? {}) },
    promotional: { ...DEFAULT_THEME_CONFIG.promotional, ...(savedTheme?.promotional ?? {}) },
  }

  // Build ordered category list (same logic as before)
  const counts: Record<string, number> = {}
  products.forEach(p => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1 })
  const orderedNames = dbCats.map(c => c.name)
  const allCatNames = [
    ...orderedNames.filter(n => counts[n]),
    ...Object.keys(counts).filter(n => !orderedNames.includes(n)),
  ]
  const categories = allCatNames.map(name => ({ name, count: counts[name] || 0 }))
  const mergedStoreInfo = { ...DEFAULT_STORE_INFO, ...storeInfo }

  // Determine effective theme (festival dates auto-expire)
  let activeTheme = themeConfig.activeTheme
  if (activeTheme === 'festival') {
    const fest = themeConfig.festival
    if (fest.startDate || fest.endDate) {
      const now = new Date()
      if (fest.startDate && now < new Date(fest.startDate)) activeTheme = 'default'
      if (fest.endDate && now > new Date(fest.endDate)) activeTheme = 'default'
    }
  }

  const sharedProps = { categories, totalProducts: products.length, layout, storeInfo: mergedStoreInfo }

  if (activeTheme === 'festival') {
    return <FestivalTheme festivalConfig={themeConfig.festival} {...sharedProps} />
  }

  if (activeTheme === 'promotional') {
    return <PromotionalTheme promoConfig={themeConfig.promotional} {...sharedProps} />
  }

  return <HomePageClient {...sharedProps} />
}
