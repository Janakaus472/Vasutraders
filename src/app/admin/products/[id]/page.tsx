'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getProduct } from '@/lib/supabase/products'
import { Product } from '@/types/product'
import ProductForm from '@/components/admin/ProductForm'

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProduct(id).then((p) => {
      setProduct(p)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="text-gray-400 py-8 text-center">Loading…</div>
  if (!product) return <div className="text-red-500 py-8 text-center">Product not found</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  )
}
