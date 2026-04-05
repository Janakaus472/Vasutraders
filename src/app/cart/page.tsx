'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useProducts } from '@/hooks/useProducts'
import { useLanguage } from '@/context/LanguageContext'
import WhatsAppOrderButton from '@/components/cart/WhatsAppOrderButton'

const CART_T = {
  en: {
    empty: 'Your order is empty',
    emptyDesc: 'Add products from the catalog to place an order',
    browse: 'Browse Products',
    myOrder: 'My Order',
    clearAll: 'Clear all',
    product: 'Product',
    price: 'Price',
    qty: 'Qty',
    subtotal: 'Subtotal',
    onRequest: 'On Request',
    items: 'Items',
    estTotal: 'Estimated Total',
    note: 'Items will be confirmed with Vasu Traders after sending your order on WhatsApp.',
    per: 'per',
  },
  hi: {
    empty: 'आपका ऑर्डर खाली है',
    emptyDesc: 'ऑर्डर देने के लिए कैटलॉग से सामान जोड़ें',
    browse: 'उत्पाद देखें',
    myOrder: 'मेरा ऑर्डर',
    clearAll: 'सब हटाएं',
    product: 'उत्पाद',
    price: 'कीमत',
    qty: 'मात्रा',
    subtotal: 'कुल',
    onRequest: 'पूछताछ पर',
    items: 'सामान',
    estTotal: 'अनुमानित कुल',
    note: 'व्हाट्सएप पर ऑर्डर भेजने के बाद वासु ट्रेडर्स पुष्टि करेंगे।',
    per: 'प्रति',
  },
}

export default function CartPage() {
  const { items, addItem, removeItem, clearCart } = useCart()
  const { products } = useProducts()
  const { lang } = useLanguage()
  const tx = CART_T[lang]

  const cartProducts = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product ? { ...item, product } : null
    })
    .filter(Boolean) as { productId: string; quantity: number; product: (typeof products)[0] }[]

  if (items.length === 0) {
    return (
      <div style={{
        maxWidth: '600px', margin: '0 auto', padding: '80px 24px', textAlign: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🛒</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#0f2744', letterSpacing: '1px', marginBottom: '12px' }}>
          {tx.empty}
        </h2>
        <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '32px' }}>{tx.emptyDesc}</p>
        <Link href="/catalog" style={{
          background: '#FF6B00', color: '#fff',
          fontWeight: 700, padding: '14px 36px',
          borderRadius: '14px', fontSize: '16px',
          textDecoration: 'none', display: 'inline-block',
          boxShadow: '0 4px 16px rgba(255,107,0,0.35)',
        }}>
          {tx.browse}
        </Link>
      </div>
    )
  }

  const total = cartProducts.reduce((sum, item) => sum + item.product.pricePerUnit * item.quantity, 0)
  const hasPrice = cartProducts.some((i) => i.product.pricePerUnit > 0)

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#0f2744', letterSpacing: '1px', margin: 0 }}>
          🛒 {tx.myOrder}
        </h1>
        <button
          onClick={clearCart}
          style={{
            background: 'none', border: '1.5px solid #fca5a5', color: '#ef4444',
            padding: '7px 16px', borderRadius: '10px', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444' }}
        >
          {tx.clearAll}
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15,39,68,0.08)', marginBottom: '24px' }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto auto auto',
          gap: '16px', padding: '14px 24px',
          background: '#0f2744', color: '#7bafd4',
          fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
        }}>
          <div>{tx.product}</div>
          <div style={{ textAlign: 'center', minWidth: '80px' }}>{tx.price}</div>
          <div style={{ textAlign: 'center', minWidth: '100px' }}>{tx.qty}</div>
          <div style={{ textAlign: 'right', minWidth: '80px' }}>{tx.subtotal}</div>
        </div>

        {cartProducts.map(({ productId, quantity, product }, idx) => (
          <div
            key={productId}
            style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto auto',
              gap: '16px', alignItems: 'center',
              padding: '16px 24px',
              borderBottom: idx < cartProducts.length - 1 ? '1px solid #f3f4f6' : 'none',
            }}
          >
            {/* Product */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', background: '#f8f7f4', flexShrink: 0, border: '1px solid #f0f0f0' }}>
                <Image src={product.imageUrl || '/placeholder-product.png'} alt={product.name} fill style={{ objectFit: 'contain', padding: '6px' }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#111827', fontSize: '15px', margin: '0 0 3px' }}>{product.name}</p>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>{tx.per} {product.unit}</p>
              </div>
            </div>

            {/* Price */}
            <div style={{ textAlign: 'center', minWidth: '80px' }}>
              {product.pricePerUnit > 0 ? (
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: '#374151' }}>₹{product.pricePerUnit.toFixed(0)}</span>
              ) : (
                <span style={{ color: '#FF6B00', fontSize: '12px', fontWeight: 700 }}>{tx.onRequest}</span>
              )}
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '100px' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#FF6B00', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(255,107,0,0.3)' }}>
                <button onClick={() => removeItem(productId)} style={{ width: '32px', height: '34px', color: '#fff', fontSize: '18px', fontWeight: 700, border: 'none', cursor: 'pointer', background: 'transparent' }}>−</button>
                <span style={{ color: '#fff', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
                <button onClick={() => addItem(productId)} style={{ width: '32px', height: '34px', color: '#fff', fontSize: '18px', fontWeight: 700, border: 'none', cursor: 'pointer', background: 'transparent' }}>+</button>
              </div>
            </div>

            {/* Subtotal */}
            <div style={{ textAlign: 'right', minWidth: '80px' }}>
              {product.pricePerUnit > 0 ? (
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#15803d' }}>₹{(product.pricePerUnit * quantity).toFixed(0)}</span>
              ) : (
                <span style={{ color: '#9ca3af' }}>—</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary + order */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
        <p style={{ color: '#6b7280', fontSize: '14px', flex: 1, lineHeight: 1.6 }}>{tx.note}</p>
        <div style={{ minWidth: '280px' }}>
          {hasPrice && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '18px 20px', marginBottom: '14px', boxShadow: '0 2px 12px rgba(15,39,68,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                <span>{tx.items} ({cartProducts.length})</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                <span style={{ color: '#0f2744' }}>{tx.estTotal}</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#15803d' }}>₹{total.toFixed(0)}</span>
              </div>
            </div>
          )}
          <WhatsAppOrderButton cart={items} products={products} />
        </div>
      </div>
    </div>
  )
}
