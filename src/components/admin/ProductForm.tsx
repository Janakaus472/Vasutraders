'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Product, ProductUnit } from '@/types/product'
import { addProduct, updateProduct } from '@/lib/supabase/products'
import { generateProductDescription } from '@/lib/openai'
import ImageUploader from './ImageUploader'

const UNITS: ProductUnit[] = ['kg', 'litre', 'piece', 'dozen', 'box']

interface ProductFormProps {
  product?: Product
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product

  const [name, setName] = useState(product?.name || '')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionHi, setDescriptionHi] = useState('')
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '')
  const [unit, setUnit] = useState<ProductUnit>(product?.unit || 'kg')
  const [pricePerUnit, setPricePerUnit] = useState(product?.pricePerUnit?.toString() || '')
  const [minOrderQty, setMinOrderQty] = useState(product?.minOrderQty?.toString() || '1')
  const [category, setCategory] = useState(product?.category || '')
  const [displayOrder, setDisplayOrder] = useState(product?.displayOrder?.toString() || '0')
  const [inStock, setInStock] = useState(product?.inStock ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const data = {
        name,
        description: JSON.stringify({ en: descriptionEn, hi: descriptionHi }),
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
          <div className="relative">
            <textarea
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 resize-none pr-12"
              rows={2}
              placeholder="Product description in English"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Hindi)</label>
          <div className="relative">
            <textarea
              value={descriptionHi}
              onChange={(e) => setDescriptionHi(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 resize-none pr-12"
              rows={2}
              placeholder="Product description in Hindi"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          disabled={generating || !name || !category}
          onClick={async () => {
            if (!name || !category) {
              setError('Please fill Product Name and Category first')
              return
            }
            setGenerating(true)
            setError('')
            try {
              const result = await generateProductDescription(name, category, unit)
              setDescriptionEn(result.en)
              setDescriptionHi(result.hi)
            } catch (err) {
              setError('Failed to generate. Check API key.')
            } finally {
              setGenerating(false)
            }
          }}
          className="text-sm px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 flex items-center gap-2"
        >
          {generating ? '⏳ Generating...' : '✨ Generate Descriptions (EN + HI)'}
        </button>
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
