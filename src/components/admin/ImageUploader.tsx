'use client'

import { useState, ChangeEvent } from 'react'
import Image from 'next/image'
import { uploadProductImage } from '@/lib/supabase/storage'

interface ImageUploaderProps {
  currentUrl: string
  onUpload: (url: string) => void
}

export default function ImageUploader({ currentUrl, onUpload }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl)

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      setPreview(URL.createObjectURL(file))
      const url = await uploadProductImage(file)
      onUpload(url)
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Product Image</label>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
          {preview ? (
            <Image src={preview} alt="product" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 text-3xl">📦</div>
          )}
        </div>
        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          {uploading ? 'Uploading…' : 'Choose Image'}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
      </div>
    </div>
  )
}
