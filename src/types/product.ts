export type ProductUnit = 'kg' | 'litre' | 'piece' | 'dozen' | 'box'

export interface Product {
  id: string
  name: string
  description: string  // Can be JSON {en: string, hi: string} or plain string
  imageUrl: string
  unit: ProductUnit
  pricePerUnit: number
  minOrderQty: number
  inStock: boolean
  category: string
  subcategory: string
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}
