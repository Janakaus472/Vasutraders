import { supabase } from './client'
import { Product } from '@/types/product'

function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    imageUrl: row.image_url || '',
    unit: row.unit,
    pricePerUnit: Number(row.price_per_unit),
    minOrderQty: row.min_order_qty || 1,
    inStock: row.in_stock,
    category: row.category || '',
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
  return (data || []).map(rowToProduct)
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return rowToProduct(data)
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      description: product.description,
      image_url: product.imageUrl,
      unit: product.unit,
      price_per_unit: product.pricePerUnit,
      min_order_qty: product.minOrderQty,
      in_stock: product.inStock,
      category: product.category,
      display_order: product.displayOrder,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({
      ...(product.name !== undefined && { name: product.name }),
      ...(product.description !== undefined && { description: product.description }),
      ...(product.imageUrl !== undefined && { image_url: product.imageUrl }),
      ...(product.unit !== undefined && { unit: product.unit }),
      ...(product.pricePerUnit !== undefined && { price_per_unit: product.pricePerUnit }),
      ...(product.minOrderQty !== undefined && { min_order_qty: product.minOrderQty }),
      ...(product.inStock !== undefined && { in_stock: product.inStock }),
      ...(product.category !== undefined && { category: product.category }),
      ...(product.displayOrder !== undefined && { display_order: product.displayOrder }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}
