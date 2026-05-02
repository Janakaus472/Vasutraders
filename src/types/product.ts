export type ProductUnit =
  | 'Pcs' | 'Doz' | 'Pkt' | 'Kg' | 'Gm' | 'Litre' | 'Box'
  | 'Set' | 'Pair' | 'Roll' | 'Mtr' | 'Nos' | 'Bundle'
  | 'kg' | 'litre' | 'piece' | 'dozen' | 'box' // legacy

export interface BulkVariant {
  id: string
  productId: string
  quantity: number
  unit: string
  imageUrl: string
  price: number | null  // null = no price set
  label: string         // e.g. "Bulk Pack", "Best Value"
  displayOrder: number
  createdAt: Date
}

export interface Product {
  id: string
  name: string
  description: string
  imageUrl: string
  galleryImages: string[]
  unit: ProductUnit
  pricePerUnit: number
  minOrderQty: number
  inStock: boolean   // true = Active, false = Hidden
  category: string
  subcategory: string
  displayOrder: number
  createdAt: Date
  updatedAt: Date
  bulkVariants?: BulkVariant[]
}
