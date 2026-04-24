import { supabase, adminSupabase } from './client'

export interface Category {
  id: string
  name: string
  parent_id: string | null
  display_order: number
}

export interface CategoryWithSubs extends Category {
  subcategories: Category[]
}

export async function getCategories(): Promise<CategoryWithSubs[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw error
  const rows: Category[] = data || []
  const mains = rows.filter(r => !r.parent_id)
  return mains.map(m => ({
    ...m,
    subcategories: rows.filter(r => r.parent_id === m.id),
  }))
}

export async function addCategory(name: string, parent_id: string | null = null): Promise<Category> {
  const { data, error } = await adminSupabase
    .from('categories')
    .insert({ name: name.trim(), parent_id, display_order: 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  // Delete subcategories first
  await adminSupabase.from('categories').delete().eq('parent_id', id)
  const { error } = await adminSupabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

export async function renameCategory(id: string, name: string): Promise<void> {
  const { error } = await adminSupabase.from('categories').update({ name: name.trim() }).eq('id', id)
  if (error) throw error
}

export async function reorderCategories(updates: { id: string; display_order: number }[]): Promise<void> {
  await Promise.all(
    updates.map(u =>
      adminSupabase.from('categories').update({ display_order: u.display_order }).eq('id', u.id)
    )
  )
}
