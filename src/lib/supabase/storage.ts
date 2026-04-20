import { adminSupabase } from './client'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 5

export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed')
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image must be smaller than ${MAX_SIZE_MB}MB`)
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`

  const { error } = await adminSupabase.storage
    .from('product-images')
    .upload(filename, file, { upsert: false })

  if (error) throw error

  const { data } = adminSupabase.storage
    .from('product-images')
    .getPublicUrl(filename)

  return data.publicUrl
}
