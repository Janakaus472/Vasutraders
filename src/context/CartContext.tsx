'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CartItem } from '@/types/cart'
import { CART_STORAGE_KEY } from '@/lib/constants'

/** Two cart items are the same when both productId and variantId match */
function sameItem(item: CartItem, productId: string, variantId?: string) {
  return item.productId === productId && item.variantId === variantId
}

interface CartContextValue {
  items: CartItem[]
  addItem: (productId: string, variantId?: string) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, qty: number, variantId?: string) => void
  clearCart: () => void
  itemCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (productId: string, variantId?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => sameItem(i, productId, variantId))
      if (existing) {
        return prev.map((i) =>
          sameItem(i, productId, variantId) ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      const newItem: CartItem = { productId, quantity: 1 }
      if (variantId) newItem.variantId = variantId
      return [...prev, newItem]
    })
  }

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => sameItem(i, productId, variantId))
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          sameItem(i, productId, variantId) ? { ...i, quantity: i.quantity - 1 } : i
        )
      }
      return prev.filter((i) => !sameItem(i, productId, variantId))
    })
  }

  const updateQuantity = (productId: string, qty: number, variantId?: string) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => !sameItem(i, productId, variantId)))
    } else {
      setItems((prev) => {
        const existing = prev.find((i) => sameItem(i, productId, variantId))
        if (existing) {
          return prev.map((i) => sameItem(i, productId, variantId) ? { ...i, quantity: qty } : i)
        }
        const newItem: CartItem = { productId, quantity: qty }
        if (variantId) newItem.variantId = variantId
        return [...prev, newItem]
      })
    }
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
