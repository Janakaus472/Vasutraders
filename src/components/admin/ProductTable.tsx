'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Product } from '@/types/product'
import { updateProduct, deleteProduct } from '@/lib/firebase/firestore'

interface ProductTableProps {
  products: Product[]
}

export default function ProductTable({ products }: ProductTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleToggleStock = async (product: Product) => {
    await updateProduct(product.id, { inStock: !product.inStock })
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await deleteProduct(id)
    setDeletingId(null)
    setConfirmId(null)
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-5xl mb-3">📦</div>
        <p>No products yet. Add your first product.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <p className="text-orange-600 font-medium text-sm">${product.pricePerUnit.toFixed(2)} / {product.unit}</p>
            {product.category && <p className="text-gray-400 text-xs">{product.category}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleToggleStock(product)}
              className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              {product.inStock ? 'Mark Out' : 'Mark In'}
            </button>
            <Link
              href={`/admin/products/${product.id}`}
              className="text-xs px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100"
            >
              Edit
            </Link>
            {confirmId === product.id ? (
              <button
                onClick={() => handleDelete(product.id)}
                disabled={deletingId === product.id}
                className="text-xs px-3 py-1.5 rounded-xl bg-red-500 text-white hover:bg-red-600"
              >
                {deletingId === product.id ? '…' : 'Confirm'}
              </button>
            ) : (
              <button
                onClick={() => setConfirmId(product.id)}
                className="text-xs px-3 py-1.5 rounded-xl bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
