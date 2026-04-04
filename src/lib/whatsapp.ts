import { CartItem } from '@/types/cart'
import { Product } from '@/types/product'
import { WHATSAPP_NUMBER, BUSINESS_NAME } from './constants'

export function buildWhatsAppUrl(
  cart: CartItem[],
  products: Product[],
  customerPhone: string
): string {
  const lines = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return null
      return `- ${product.name} x ${item.quantity} ${product.unit}`
    })
    .filter(Boolean)

  const message = [
    `Hello ${BUSINESS_NAME}! I'd like to place an order:`,
    '',
    ...lines,
    '',
    `My WhatsApp number: ${customerPhone}`,
  ].join('\n')

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
