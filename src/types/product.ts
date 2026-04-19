export type ProductUnit =
  | 'Pcs' | 'Doz' | 'Pkt' | 'Kg' | 'Gm' | 'Litre' | 'Box'
  | 'Set' | 'Pair' | 'Roll' | 'Mtr' | 'Nos' | 'Bundle'
  | 'kg' | 'litre' | 'piece' | 'dozen' | 'box' // legacy

export interface Product {
  id: string
  name: string
  description: string
  imageUrl: string
  unit: ProductUnit
  pricePerUnit: number
  minOrderQty: number
  inStock: boolean   // true = Active, false = Hidden
  category: string
  subcategory: string
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}
