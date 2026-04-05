'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Product, ProductUnit } from '@/types/product'
import { addProduct, updateProduct } from '@/lib/supabase/products'
import ImageUploader from './ImageUploader'

const UNITS: ProductUnit[] = ['kg', 'litre', 'piece', 'dozen', 'box']

interface ProductFormProps {
  product?: Product
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product

  const [name, setName] = useState(product?.name || '')
  const [description, setDescription] = useState(product?.description || '')
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '')
  const [unit, setUnit] = useState<ProductUnit>(product?.unit || 'kg')
  const [pricePerUnit, setPricePerUnit] = useState(product?.pricePerUnit?.toString() || '')
  const [minOrderQty, setMinOrderQty] = useState(product?.minOrderQty?.toString() || '1')
  const [category, setCategory] = useState(product?.category || '')
  const [displayOrder, setDisplayOrder] = useState(product?.displayOrder?.toString() || '0')
  const [inStock, setInStock] = useState(product?.inStock ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const data = {
        name,
        description,
        imageUrl,
        unit,
        pricePerUnit: parseFloat(pricePerUnit),
        minOrderQty: parseInt(minOrderQty),
        category,
        displayOrder: parseInt(displayOrder),
        inStock,
      }
      if (isEdit) {
        await updateProduct(product.id, data)
      } else {
        await addProduct(data)
      }
      router.push('/admin')
    } catch (err: any) {
      setError(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <ImageUploader currentUrl={imageUrl} onUpload={setImageUrl} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400"
          placeholder="e.g. Basmati Rice"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 resize-none"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as ProductUnit)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 bg-white"
          >
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400"
            placeholder="e.g. Grains"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setInStock(!inStock)}
          className={`relative w-12 h-6 rounded-full transition-colors ${inStock ? 'bg-orange-500' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${inStock ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
        <span className="text-sm text-gray-700">{inStock ? 'In Stock' : 'Out of Stock'}</span>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
