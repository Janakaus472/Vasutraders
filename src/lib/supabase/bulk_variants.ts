import { supabase, adminSupabase } from './client'
import { BulkVariant } from '@/types/product'

function rowToVariant(row: any): BulkVariant {
  return {
    id: row.id,
    productId: row.product_id,
    quantity: row.quantity,
    unit: row.unit,
    imageUrl: row.image_url || '',
    price: row.price !== null && row.price !== undefined ? Number(row.price) : null,
    label: row.label || '',
    displayOrder: row.display_order || 0,
    createdAt: new Date(row.created_at),
  }
}

export async function getBulkVariants(productId: string): Promise<BulkVariant[]> {
  const { data, error } = await supabase
    .from('bulk_variants')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', { ascending: true })
  if (error) throw error
  return (data || []).map(rowToVariant)
}

/** Batch-fetch variants for many products — returns a map of productId → variants */
export async function getBulkVariantsForProducts(productIds: string[]): Promise<Map<string, BulkVariant[]>> {
  if (productIds.length === 0) return new Map()
  const { data, error } = await supabase
    .from('bulk_variants')
    .select('*')
    .in('product_id', productIds)
    .order('display_order', { ascending: true })
  if (error) throw error
  const map = new Map<string, BulkVariant[]>()
  for (const row of (data || [])) {
    const v = rowToVariant(row)
    if (!map.has(v.productId)) map.set(v.productId, [])
    map.get(v.productId)!.push(v)
  }
  return map
}

export async function addBulkVariant(variant: Omit<BulkVariant, 'id' | 'createdAt'>): Promise<BulkVariant> {
  const { data, error } = await adminSupabase
    .from('bulk_variants')
    .insert({
      product_id: variant.productId,
      quantity: variant.quantity,
      unit: variant.unit,
      image_url: variant.imageUrl,
      price: variant.price,
      label: variant.label || null,
      display_order: variant.displayOrder,
    })
    .select('*')
    .single()
  if (error) throw error
  return rowToVariant(data)
}

export async function updateBulkVariant(id: string, fields: Partial<Omit<BulkVariant, 'id' | 'productId' | 'createdAt'>>): Promise<void> {
  const { error } = await adminSupabase
    .from('bulk_variants')
    .update({
      ...(fields.quantity !== undefined && { quantity: fields.quantity }),
      ...(fields.unit !== undefined && { unit: fields.unit }),
      ...(fields.imageUrl !== undefined && { image_url: fields.imageUrl }),
      ...(fields.price !== undefined && { price: fields.price }),
      ...(fields.label !== undefined && { label: fields.label || null }),
      ...(fields.displayOrder !== undefined && { display_order: fields.displayOrder }),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteBulkVariant(id: string): Promise<void> {
  const { error } = await adminSupabase.from('bulk_variants').delete().eq('id', id)
  if (error) throw error
}

export async function reorderBulkVariants(updates: { id: string; displayOrder: number }[]): Promise<void> {
  await Promise.all(
    updates.map(u =>
      adminSupabase.from('bulk_variants').update({ display_order: u.displayOrder }).eq('id', u.id)
    )
  )
}
