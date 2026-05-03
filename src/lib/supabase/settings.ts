import { adminSupabase } from './client'

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const { data, error } = await adminSupabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single()
    if (error || !data) return fallback
    return data.value as T
  } catch {
    return fallback
  }
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const { error } = await adminSupabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw error
}
