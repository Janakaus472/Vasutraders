'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface CategoryWithSubs {
  id: string
  name: string
  subcategories: { id: string; name: string }[]
}

interface BulkProduct {
  name: string
  category: string
  subcategory: string
  unit: string
  price: string
  min_qty: string
  description: string
  image_url: string
  in_stock: boolean
}

const EMPTY_ROW: BulkProduct = {
  name: '', category: '', subcategory: '', unit: 'Pcs',
  price: '', min_qty: '1', description: '', image_url: '', in_stock: true,
}

const UNITS = ['Pcs', 'Doz', 'Pkt', 'Kg', 'Gm', 'Litre', 'Box', 'Set', 'Pair', 'Roll', 'Mtr', 'Nos', 'Bundle']

export default function BulkUploadPage() {
  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const [rows, setRows] = useState<BulkProduct[]>([{ ...EMPTY_ROW }])
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; inserted?: number; error?: string } | null>(null)
  const [csvParsed, setCsvParsed] = useState(false)
  const [imageUploading, setImageUploading] = useState<Record<number, boolean>>({})
  const fileRef = useRef<HTMLInputElement>(null)
  const imageRefs = useRef<Record<number, HTMLInputElement | null>>({})

  // Fetch categories on load
  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data) })
      .catch(() => {})
  }, [])

  // Get subcategories for a given category name
  const getSubcategories = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName)
    return cat?.subcategories || []
  }

  // Update a row field
  const updateRow = (index: number, field: keyof BulkProduct, value: string | boolean) => {
    setRows(prev => prev.map((r, i) => {
      if (i !== index) return r
      const updated = { ...r, [field]: value }
      // Reset subcategory when category changes
      if (field === 'category') updated.subcategory = ''
      return updated
    }))
  }

  // Add empty rows
  const addRows = (count: number) => {
    setRows(prev => [...prev, ...Array.from({ length: count }, () => ({ ...EMPTY_ROW }))])
  }

  // Remove a row
  const removeRow = (index: number) => {
    setRows(prev => prev.length === 1 ? [{ ...EMPTY_ROW }] : prev.filter((_, i) => i !== index))
  }

  // Clear all
  const clearAll = () => {
    setRows([{ ...EMPTY_ROW }])
    setResult(null)
    setCsvParsed(false)
  }

  // Parse CSV
  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      if (!text) return
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length < 2) return

      // Parse header
      const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim())
      const nameIdx = header.findIndex(h => h.includes('name') || h.includes('product'))
      const catIdx = header.findIndex(h => h.includes('category') || h.includes('cat'))
      const subIdx = header.findIndex(h => h.includes('sub'))
      const unitIdx = header.findIndex(h => h.includes('unit'))
      const priceIdx = header.findIndex(h => h.includes('price') || h.includes('rate') || h.includes('mrp'))
      const qtyIdx = header.findIndex(h => h.includes('min') || h.includes('qty') || h.includes('moq'))
      const descIdx = header.findIndex(h => h.includes('desc'))
      const imgIdx = header.findIndex(h => h.includes('image') || h.includes('img') || h.includes('photo') || h.includes('url'))

      const parsed: BulkProduct[] = []
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i])
        const name = (nameIdx >= 0 ? cols[nameIdx] : cols[0] || '').trim()
        if (!name) continue
        parsed.push({
          name,
          category: (catIdx >= 0 ? cols[catIdx] : '').trim(),
          subcategory: (subIdx >= 0 ? cols[subIdx] : '').trim(),
          unit: (unitIdx >= 0 ? cols[unitIdx] : 'Pcs').trim() || 'Pcs',
          price: (priceIdx >= 0 ? cols[priceIdx] : '').replace(/[^0-9.]/g, '').trim(),
          min_qty: (qtyIdx >= 0 ? cols[qtyIdx] : '1').replace(/[^0-9]/g, '').trim() || '1',
          description: (descIdx >= 0 ? cols[descIdx] : '').trim(),
          image_url: (imgIdx >= 0 ? cols[imgIdx] : '').trim(),
          in_stock: true,
        })
      }

      if (parsed.length > 0) {
        setRows(parsed)
        setCsvParsed(true)
        setResult(null)
      }
    }
    reader.readAsText(file)
    // Reset file input
    if (fileRef.current) fileRef.current.value = ''
  }

  // Upload image for a row
  const uploadImage = async (index: number, file: File) => {
    setImageUploading(prev => ({ ...prev, [index]: true }))
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        updateRow(index, 'image_url', data.url)
      }
    } catch (e) {
      console.error('Image upload failed:', e)
    }
    setImageUploading(prev => ({ ...prev, [index]: false }))
  }

  // Bulk submit
  const handleSubmit = async () => {
    const validRows = rows.filter(r => r.name.trim())
    if (validRows.length === 0) return

    setUploading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: validRows }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResult({ ok: false, error: data.error })
      } else {
        setResult({ ok: true, inserted: data.inserted })
      }
    } catch (e: any) {
      setResult({ ok: false, error: e.message })
    }
    setUploading(false)
  }

  const validCount = rows.filter(r => r.name.trim()).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Bulk Upload Products</h1>
          <p className="text-gray-400 text-sm">Add many products at once — paste, type, or import CSV</p>
        </div>
        <Link href="/admin/products"
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
          Back to Products
        </Link>
      </div>

      {/* CSV Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-700 text-sm mb-3 uppercase tracking-wide">Import from CSV</h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl cursor-pointer transition-colors text-sm">
            <span>Upload CSV File</span>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCSV} className="hidden" />
          </label>
          <span className="text-gray-400 text-sm">or type products manually below</span>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          CSV columns: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Name, Category, Subcategory, Unit, Price, Min Qty, Description, Image URL</code>
          <br />
          <span className="text-gray-300">Column headers are auto-detected. Only &quot;Name&quot; is required.</span>
        </div>
        {csvParsed && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-green-700 text-sm font-medium">
            Parsed {rows.length} products from CSV. Review below and click &quot;Upload All&quot;.
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-gray-700">{rows.length} rows ({validCount} valid)</span>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => addRows(1)} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg">+ 1 Row</button>
            <button onClick={() => addRows(5)} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg">+ 5 Rows</button>
            <button onClick={() => addRows(10)} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg">+ 10 Rows</button>
            <button onClick={clearAll} className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 rounded-lg">Clear All</button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-8">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 min-w-[180px]">Name *</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 min-w-[130px]">Category</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 min-w-[130px]">Subcategory</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-[90px]">Unit</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-[90px]">Price</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-[70px]">MOQ</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 min-w-[100px]">Image</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row, i) => (
                <tr key={i} className={`hover:bg-gray-50/60 ${!row.name.trim() ? 'opacity-50' : ''}`}>
                  <td className="px-3 py-1.5 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-3 py-1.5">
                    <input value={row.name} onChange={e => updateRow(i, 'name', e.target.value)}
                      placeholder="Product name"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-400"
                      style={{ fontSize: '14px' }} />
                  </td>
                  <td className="px-3 py-1.5">
                    <select value={row.category} onChange={e => updateRow(i, 'category', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-400 bg-white"
                      style={{ fontSize: '14px' }}>
                      <option value="">— Select —</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <select value={row.subcategory} onChange={e => updateRow(i, 'subcategory', e.target.value)}
                      disabled={!row.category || getSubcategories(row.category).length === 0}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-400 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                      style={{ fontSize: '14px' }}>
                      <option value="">{!row.category ? '— Pick category first —' : getSubcategories(row.category).length === 0 ? '— No subcategories —' : '— Select —'}</option>
                      {getSubcategories(row.category).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <select value={row.unit} onChange={e => updateRow(i, 'unit', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-400 bg-white">
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <input type="number" min="0" step="0.01" value={row.price}
                      onChange={e => updateRow(i, 'price', e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-400"
                      style={{ fontSize: '14px' }} />
                  </td>
                  <td className="px-3 py-1.5">
                    <input type="number" min="1" value={row.min_qty}
                      onChange={e => updateRow(i, 'min_qty', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-400"
                      style={{ fontSize: '14px' }} />
                  </td>
                  <td className="px-3 py-1.5">
                    {row.image_url ? (
                      <div className="flex items-center gap-1">
                        <img src={row.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <button onClick={() => updateRow(i, 'image_url', '')} className="text-red-400 hover:text-red-600 text-xs p-1">x</button>
                      </div>
                    ) : (
                      <label className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
                        imageUploading[i] ? 'bg-gray-100 text-gray-400' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                      }`}>
                        {imageUploading[i] ? '...' : 'Upload'}
                        <input type="file" accept="image/*" className="hidden"
                          ref={el => { imageRefs.current[i] = el }}
                          onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(i, f) }}
                          disabled={imageUploading[i]}
                        />
                      </label>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    <button onClick={() => removeRow(i)} className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg text-xs">x</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {rows.map((row, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                <button onClick={() => removeRow(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
              </div>
              <input value={row.name} onChange={e => updateRow(i, 'name', e.target.value)}
                placeholder="Product name *"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                style={{ fontSize: '16px' }} />
              <div className="grid grid-cols-2 gap-2">
                <select value={row.category} onChange={e => updateRow(i, 'category', e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white"
                  style={{ fontSize: '16px' }}>
                  <option value="">Category</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <select value={row.subcategory} onChange={e => updateRow(i, 'subcategory', e.target.value)}
                  disabled={!row.category || getSubcategories(row.category).length === 0}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  style={{ fontSize: '16px' }}>
                  <option value="">{!row.category ? 'Pick category' : getSubcategories(row.category).length === 0 ? 'No subcategories' : 'Subcategory'}</option>
                  {getSubcategories(row.category).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select value={row.unit} onChange={e => updateRow(i, 'unit', e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white"
                  style={{ fontSize: '16px' }}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <input type="number" min="0" value={row.price}
                  onChange={e => updateRow(i, 'price', e.target.value)}
                  placeholder="Price"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                  style={{ fontSize: '16px' }} />
                <input type="number" min="1" value={row.min_qty}
                  onChange={e => updateRow(i, 'min_qty', e.target.value)}
                  placeholder="MOQ"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                  style={{ fontSize: '16px' }} />
              </div>
              <div>
                {row.image_url ? (
                  <div className="flex items-center gap-2">
                    <img src={row.image_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    <span className="text-xs text-green-600 font-medium flex-1">Image uploaded</span>
                    <button onClick={() => updateRow(i, 'image_url', '')} className="text-xs text-red-400">Remove</button>
                  </div>
                ) : (
                  <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-colors text-sm font-medium ${
                    imageUploading[i] ? 'bg-gray-100 text-gray-400' : 'bg-orange-50 text-orange-600 border border-orange-200'
                  }`}>
                    {imageUploading[i] ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(i, f) }}
                      disabled={imageUploading[i]}
                    />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          result.ok
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {result.ok
            ? `Successfully uploaded ${result.inserted} products!`
            : `Error: ${result.error}`
          }
        </div>
      )}

      {/* Submit */}
      <div className="sticky bottom-4 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={uploading || validCount === 0}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold px-8 py-3 rounded-2xl shadow-lg text-sm transition-colors disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : `Upload ${validCount} Product${validCount !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-700 text-sm mb-3 uppercase tracking-wide">How to Upload Images</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 items-start">
            <span className="bg-orange-100 text-orange-700 font-bold rounded-lg w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">1</span>
            <div>
              <strong>Upload here</strong> — Click &quot;Upload&quot; next to each product to pick an image from your phone/computer. It uploads to Supabase automatically.
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="bg-orange-100 text-orange-700 font-bold rounded-lg w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">2</span>
            <div>
              <strong>CSV with image URLs</strong> — If your images are already online, add an &quot;Image URL&quot; column in your CSV with the full link (e.g. https://...).
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="bg-orange-100 text-orange-700 font-bold rounded-lg w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">3</span>
            <div>
              <strong>Add later</strong> — Upload products first without images, then go to Products page and edit each product to add an image.
            </div>
          </div>
        </div>

        <h3 className="font-semibold text-gray-700 text-sm mt-5 mb-2 uppercase tracking-wide">Sample CSV Format</h3>
        <pre className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs overflow-x-auto whitespace-pre text-gray-600">
{`Name,Category,Subcategory,Unit,Price,Min Qty,Description,Image URL
Playing Cards A1,Playing Cards,,Doz,120,1,Standard deck,
Rubber Band 100g,Rubber Bands,,Pkt,45,1,100 gm pack,
Cricket Ball,Sports & Games,,Pcs,80,6,Tennis ball,https://example.com/ball.jpg`}
        </pre>
      </div>
    </div>
  )
}

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}
