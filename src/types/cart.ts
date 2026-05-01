export interface CartItem {
  productId: string
  quantity: number
  variantId?: string  // set when a bulk variant is selected
}
