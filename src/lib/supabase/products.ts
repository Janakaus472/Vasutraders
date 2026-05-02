import { supabase, adminSupabase } from './client'
import { Product } from '@/types/product'
import { getBulkVariantsForProducts } from './bulk_variants'

function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    imageUrl: row.image_url || '',
    galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
    unit: row.unit,
    pricePerUnit: Number(row.price_per_unit) || 0,
    minOrderQty: row.min_order_qty || 1,
    inStock: row.in_stock,
    category: row.category || '',
    subcategory: row.subcategory || '',
    displayOrder: row.display_order || 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export async function getProducts(adminMode = false): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .order('display_order', { ascending: true })

  if (!adminMode) {
    query = query.eq('in_stock', true)
  }

  const { data, error } = await query
  if (error) throw error
  const products = (data || []).map(rowToProduct)

  // Attach bulk variants in one batch query
  const variantsMap = await getBulkVariantsForProducts(products.map(p => p.id))
  return products.map(p => ({ ...p, bulkVariants: variantsMap.get(p.id) || [] }))
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  const product = rowToProduct(data)
  const variantsMap = await getBulkVariantsForProducts([id])
  return { ...product, bulkVariants: variantsMap.get(id) || [] }
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const { data, error } = await adminSupabase
    .from('products')
    .insert({
      name: product.name,
      description: product.description,
      image_url: product.imageUrl,
      gallery_images: product.galleryImages || [],
      unit: product.unit,
      price_per_unit: product.pricePerUnit,
      min_order_qty: product.minOrderQty,
      in_stock: product.inStock,
      category: product.category,
      subcategory: product.subcategory,
      display_order: product.displayOrder,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> {
  const { error } = await adminSupabase
    .from('products')
    .update({
      ...(product.name !== undefined && { name: product.name }),
      ...(product.description !== undefined && { description: product.description }),
      ...(product.imageUrl !== undefined && { image_url: product.imageUrl }),
      ...(product.galleryImages !== undefined && { gallery_images: product.galleryImages }),
      ...(product.unit !== undefined && { unit: product.unit }),
      ...(product.pricePerUnit !== undefined && { price_per_unit: product.pricePerUnit }),
      ...(product.minOrderQty !== undefined && { min_order_qty: product.minOrderQty }),
      ...(product.inStock !== undefined && { in_stock: product.inStock }),
      ...(product.category !== undefined && { category: product.category }),
      ...(product.subcategory !== undefined && { subcategory: product.subcategory }),
      ...(product.displayOrder !== undefined && { display_order: product.displayOrder }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error
}

export async function updateProductPrice(id: string, price: number): Promise<void> {
  const { error } = await adminSupabase
    .from('products')
    .update({ price_per_unit: price, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function bulkUpdatePrices(updates: { id: string; price: number }[]): Promise<void> {
  await Promise.all(updates.map(u => updateProductPrice(u.id, u.price)))
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await adminSupabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function reorderProducts(updates: { id: string; displayOrder: number }[]): Promise<void> {
  await Promise.all(
    updates.map(u =>
      adminSupabase.from('products').update({ display_order: u.displayOrder, updated_at: new Date().toISOString() }).eq('id', u.id)
    )
  )
}

export async function getProductsBySubcategory(category: string, subcategory: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('subcategory', subcategory)
    .order('display_order', { ascending: true })
  if (error) throw error
  return (data || []).map(rowToProduct)
}

export async function duplicateProduct(id: string): Promise<Product> {
  const product = await getProduct(id)
  if (!product) throw new Error('Product not found')
  const newId = await addProduct({
    ...product,
    name: `${product.name} (Copy)`,
    displayOrder: product.displayOrder + 1,
  })
  return { ...product, id: newId, name: `${product.name} (Copy)` }
}
