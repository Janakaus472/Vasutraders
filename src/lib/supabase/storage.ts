import { supabase } from './client'

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, file, { upsert: false })

  if (error) throw error

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filename)

  return data.publicUrl
}
