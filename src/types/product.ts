export type ProductUnit = 'kg' | 'litre' | 'piece' | 'dozen' | 'box'

export interface Product {
  id: string
  name: string
  description: string
  imageUrl: string
  unit: ProductUnit
  pricePerUnit: number
  minOrderQty: number
  inStock: boolean
  category: string
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}
