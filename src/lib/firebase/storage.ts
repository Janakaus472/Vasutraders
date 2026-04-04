import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getFirebaseStorage } from './config'

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const storageRef = ref(getFirebaseStorage(), filename)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
