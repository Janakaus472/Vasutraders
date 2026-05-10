'use client'

import { useState } from 'react'
import { Product } from '@/types/product'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import ProductGrid from './ProductGrid'
import ProductModal from './ProductModal'

interface Props {
  products: Product[]
  hideCategory?: boolean
}

export default function CategoryProductGrid({ products, hideCategory = true }: Props) {
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const { t } = useLanguage()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const selectedCartItem = selectedProduct
    ? items.find(i => i.productId === selectedProduct.id && !('variantId' in i && (i as { variantId?: string }).variantId))
    : null

  return (
    <>
      <ProductGrid
        products={products}
        cartItems={items}
        onAdd={addItem}
        onRemove={removeItem}
        onSetQuantity={updateQuantity}
        onOpen={setSelectedProduct}
        noProductsLabel={t.noProducts}
        hideCategory={hideCategory}
      />
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          cartQuantity={selectedCartItem?.quantity || 0}
          onAdd={() => addItem(selectedProduct.id)}
          onRemove={() => removeItem(selectedProduct.id)}
          onSetQuantity={(qty) => updateQuantity(selectedProduct.id, qty)}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  )
}
