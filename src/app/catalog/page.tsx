import { getProducts } from '@/lib/supabase/products'
import CatalogClient from './CatalogClient'

export const revalidate = 3600

export default async function CatalogPage() {
  const products = await getProducts(false).catch(() => [])
  return <CatalogClient initialProducts={products} />
}
