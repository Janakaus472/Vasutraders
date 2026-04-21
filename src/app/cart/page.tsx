'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useProducts } from '@/hooks/useProducts'
import { useLanguage } from '@/context/LanguageContext'

type Step = 'cart' | 'details' | 'review' | 'success'

interface CustomerDetails {
  shopName: string
  contactName: string
  phone: string
  locality: string
}

const FIELD_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  fontSize: '16px',
  borderRadius: '16px',
  border: '2.5px solid #FFD4A0',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 600,
  color: '#1a1a1a',
  background: '#FFFAF5',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 800,
  fontSize: '15px',
  color: '#5C2D0F',
  marginBottom: '8px',
}

export default function CartPage() {
  const { items, addItem, removeItem, clearCart } = useCart()
  const { products } = useProducts()
  const { lang } = useLanguage()
  const [step, setStep] = useState<Step>('cart')
  const [details, setDetails] = useState<CustomerDetails>({
    shopName: '',
    contactName: '',
    phone: '',
    locality: '',
  })
  const [orderNumber, setOrderNumber] = useState('')
  const [successItems, setSuccessItems] = useState<{ name: string; quantity: number; unit: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cartProducts = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product ? { ...item, product } : null
    })
    .filter(Boolean) as { productId: string; quantity: number; product: (typeof products)[0] }[]

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_name: details.shopName,
          contact_name: details.contactName,
          phone: details.phone,
          locality: details.locality,
          items: cartProducts.map(({ quantity, product }) => ({
            name: product.name,
            quantity,
            unit: product.unit,
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const { order } = await res.json()
      setOrderNumber(order.order_number)
      setSuccessItems(order.items)

      // Build WhatsApp message and open immediately
      const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
      const orderItems = (order.items as { name: string; quantity: number; unit: string }[])
        .map((item: { name: string; quantity: number; unit: string }) => `• ${item.name} × ${item.quantity} ${item.unit}`)
        .join('\n')
      const waMessage = [
        `🛒 *New Order — ${order.order_number}*`,
        '',
        `🏪 Shop: ${details.shopName}`,
        details.contactName ? `👤 Name: ${details.contactName}` : '',
        `📱 Phone: ${details.phone}`,
        `📍 Area: ${details.locality}`,
        '',
        `*Items:*`,
        orderItems,
        '',
        `Please confirm this order. Thank you!`,
      ].filter(Boolean).join('\n')
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`, '_blank')

      // Send email to owner (fire and forget)
      fetch('/api/orders/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: order.order_number,
          shop_name: details.shopName,
          contact_name: details.contactName,
          phone: details.phone,
          locality: details.locality,
          items: order.items,
        }),
      }).catch(() => {})

      clearCart()
      setStep('success')
    } catch {
      setError('कुछ गलत हुआ। दोबारा कोशिश करें।')
    } finally {
      setLoading(false)
    }
  }

  // Indian mobile: starts with 6,7,8,9 — 10 digits
  const validPhone = /^[6-9]\d{9}$/.test(details.phone)
  const isDetailsValid =
    details.shopName.trim() &&
    validPhone &&
    details.locality.trim()

  // ─── EMPTY CART ────────────────────────────────────────────────
  if (items.length === 0 && step !== 'success') {
    return (
      <div style={{
        maxWidth: '600px', margin: '0 auto', padding: '48px 16px',
        textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🛒</div>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem',
          color: '#5C2D0F', letterSpacing: '1px', marginBottom: '12px',
        }}>
          {lang === 'hi' ? 'ऑर्डर खाली है' : 'Your order is empty'}
        </h2>
        <p style={{ color: '#8B4513', fontSize: '16px', marginBottom: '32px' }}>
          {lang === 'hi' ? 'कैटलॉग से सामान जोड़ें' : 'Add products from the catalog'}
        </p>
        <Link href="/catalog" style={{
          background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)', color: '#fff',
          fontWeight: 700, padding: '16px 40px', borderRadius: '14px',
          fontSize: '18px', textDecoration: 'none', display: 'inline-block',
          boxShadow: '0 8px 24px rgba(255,107,0,0.4)',
        }}>
          {lang === 'hi' ? '📦 उत्पाद देखें' : '📦 Browse Products'}
        </Link>
      </div>
    )
  }

  // ─── SUCCESS ────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div style={{
        maxWidth: '560px', margin: '0 auto', padding: '40px 16px',
        textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ fontSize: '6rem', marginBottom: '16px' }}>✅</div>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          color: '#15803d', letterSpacing: '1px', marginBottom: '8px',
        }}>
          Order Placed!
        </h1>
        <div style={{
          background: 'rgba(255,240,230,0.95)', border: '2px solid #FFD4A0',
          borderRadius: '20px', padding: '28px 24px', margin: '24px 0',
        }}>
          <p style={{ fontSize: '15px', color: '#8B4513', marginBottom: '8px', fontWeight: 600 }}>
            Order Number
          </p>
          <p style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem',
            color: '#C2410C', letterSpacing: '3px', margin: '0 0 16px',
          }}>
            {orderNumber}
          </p>
          <p style={{ fontSize: '18px', color: '#5C2D0F', fontWeight: 700, lineHeight: 1.6 }}>
            Thank you for placing an order with us!<br />
            We will confirm it shortly on WhatsApp.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={`tel:${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''}`} style={{
            background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)', color: '#fff',
            fontWeight: 800, padding: '16px 32px', borderRadius: '14px',
            fontSize: '18px', textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(255,107,0,0.4)',
          }}>
            📞 Call Us
          </a>
          <Link href="/" style={{
            background: 'rgba(92,45,15,0.1)', color: '#5C2D0F',
            fontWeight: 700, padding: '16px 32px', borderRadius: '14px',
            fontSize: '18px', textDecoration: 'none', border: '2px solid #FFD4A0',
          }}>
            🏠 Home
          </Link>
        </div>
      </div>
    )
  }

  // ─── STEP: CART ─────────────────────────────────────────────────
  if (step === 'cart') {
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const hasPrice = cartProducts.some(i => i.product.pricePerUnit > 0)
    const total = cartProducts.reduce((s, i) => s + i.product.pricePerUnit * i.quantity, 0)

    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 14px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{`
          .notepad-line { border-bottom: 1.5px solid #d4e4f7; padding: 10px 0 10px 12px; display: flex; justify-content: space-between; align-items: center; }
          .cart-grid { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; }
          @media (min-width: 1024px) { .cart-grid { grid-template-columns: 1fr 340px; gap: 32px; } }
          .cart-table-header { display: none; }
          @media (min-width: 640px) { .cart-table-header { display: grid; } }
          .cart-row { display: flex; flex-direction: column; gap: 10px; padding: 14px 16px; }
          @media (min-width: 640px) { .cart-row { display: grid; grid-template-columns: 1fr auto auto auto; gap: 16px; align-items: center; padding: 16px 24px; } }
          .cart-product-name { font-weight: 700; color: #1a1a1a; font-size: 15px; margin: 0 0 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .cart-mobile-row-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: nowrap; width: 100%; }
          @media (min-width: 640px) { .cart-mobile-row-meta { display: contents; } }
        `}</style>

        <div className="cart-grid">

          {/* ── LEFT: Editable cart ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#5C2D0F', letterSpacing: '1px', margin: 0 }}>
                🛒 {lang === 'hi' ? 'मेरा ऑर्डर' : 'My Order'}
              </h1>
              <button onClick={clearCart} style={{ background: 'none', border: '1.5px solid #fca5a5', color: '#ef4444', padding: '7px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                {lang === 'hi' ? 'सब हटाएं' : 'Clear all'}
              </button>
            </div>

            <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(92,45,15,0.10)', marginBottom: '24px' }}>
              <div className="cart-table-header" style={{ gridTemplateColumns: '1fr auto auto auto', gap: '16px', padding: '14px 24px', background: '#5C2D0F', color: '#FFD4A0', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                <div>{lang === 'hi' ? 'उत्पाद' : 'Product'}</div>
                <div style={{ textAlign: 'center' }}>{lang === 'hi' ? 'कीमत' : 'Price'}</div>
                <div style={{ textAlign: 'center' }}>{lang === 'hi' ? 'मात्रा' : 'Qty'}</div>
                <div style={{ textAlign: 'right' }}>{lang === 'hi' ? 'कुल' : 'Total'}</div>
              </div>

              {cartProducts.map(({ productId, quantity, product }, idx) => (
                <div key={productId} className="cart-row" style={{ borderBottom: idx < cartProducts.length - 1 ? '1px solid #FFF0E0' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: '#FFF8F0', flexShrink: 0, border: '1px solid #FFE0C0' }}>
                      <Image src={product.imageUrl || '/placeholder-product.png'} alt={product.name} fill style={{ objectFit: 'contain', padding: '4px' }} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p className="cart-product-name">{product.name}</p>
                      <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>per {product.unit}</p>
                    </div>
                  </div>
                  <div className="cart-mobile-row-meta">
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      {product.pricePerUnit > 0
                        ? <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: '#374151' }}>₹{product.pricePerUnit.toFixed(0)}</span>
                        : <span style={{ color: '#FF6B00', fontSize: '11px', fontWeight: 700 }}>On Request</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#FF6B00', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(255,107,0,0.3)' }}>
                        <button onClick={() => removeItem(productId)} style={{ width: '32px', height: '32px', color: '#fff', fontSize: '16px', fontWeight: 700, border: 'none', cursor: 'pointer', background: 'transparent' }}>−</button>
                        <span style={{ color: '#fff', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
                        <button onClick={() => addItem(productId)} style={{ width: '32px', height: '32px', color: '#fff', fontSize: '16px', fontWeight: 700, border: 'none', cursor: 'pointer', background: 'transparent' }}>+</button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {product.pricePerUnit > 0
                        ? <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: '#15803d' }}>₹{(product.pricePerUnit * quantity).toFixed(0)}</span>
                        : <span style={{ color: '#9ca3af' }}>—</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setStep('details')} style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)', color: '#fff', border: 'none', cursor: 'pointer', padding: '16px 32px', borderRadius: '16px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 'clamp(16px, 4vw, 20px)', boxShadow: '0 8px 32px rgba(255,107,0,0.45)', display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'center' }}>
                {lang === 'hi' ? 'ऑर्डर पक्का करें →' : 'Confirm Order →'}
              </button>
            </div>
          </div>

          {/* ── RIGHT: Notepad ── */}
          <div className="cart-notepad" style={{ position: 'sticky', top: '80px' }}>
            {/* Spiral holes */}
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 24px', marginBottom: '-8px', position: 'relative', zIndex: 2 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(92,45,15,0.15)', border: '2.5px solid rgba(92,45,15,0.25)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)' }} />
              ))}
            </div>

            {/* Paper */}
            <div style={{
              background: '#FEFCE8',
              borderRadius: '4px',
              boxShadow: '2px 4px 16px rgba(0,0,0,0.18), 4px 8px 32px rgba(0,0,0,0.10)',
              overflow: 'hidden',
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #d4e4f7 31px, #d4e4f7 32px)',
              backgroundSize: '100% 32px',
              position: 'relative',
            }}>
              {/* Red margin line */}
              <div style={{ position: 'absolute', left: '44px', top: 0, bottom: 0, width: '2px', background: 'rgba(220,60,60,0.35)', zIndex: 1 }} />

              {/* Header block */}
              <div style={{ background: '#5C2D0F', padding: '16px 20px 14px 52px', position: 'relative', zIndex: 2 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: '#FFD4A0', letterSpacing: '2px' }}>VASU TRADERS</div>
                <div style={{ fontSize: '10px', color: '#FFB880', fontWeight: 600, marginTop: '2px' }}>ORDER SLIP · {today}</div>
              </div>

              {/* Items */}
              <div style={{ padding: '8px 20px 8px 52px', position: 'relative', zIndex: 2 }}>
                {cartProducts.map(({ productId, quantity, product }) => (
                  <div key={productId} className="notepad-line">
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#1a1a1a', flex: 1, paddingRight: '8px', lineHeight: 1.3 }}>{product.name}</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: '#C2410C', whiteSpace: 'nowrap' }}>× {quantity}</span>
                  </div>
                ))}

                {/* Total */}
                {hasPrice && (
                  <div style={{ borderTop: '2px solid #C2410C', marginTop: '8px', paddingTop: '12px', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '13px', color: '#5C2D0F' }}>TOTAL</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#15803d' }}>₹{total.toFixed(0)}</span>
                  </div>
                )}

                {/* Footer note */}
                <div style={{ paddingTop: hasPrice ? '4px' : '16px', paddingBottom: '16px' }}>
                  <p style={{ fontSize: '10px', color: '#92400e', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                    * Prices confirmed on order. Wholesale rates apply.
                  </p>
                </div>
              </div>
            </div>

            {/* Paper shadow/fold */}
            <div style={{ height: '6px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), transparent)', marginTop: '-2px', borderRadius: '0 0 4px 4px' }} />
          </div>

        </div>
      </div>
    )
  }

  // ─── STEP: DETAILS ──────────────────────────────────────────────
  if (step === 'details') {
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const hasPrice = cartProducts.some(i => i.product.pricePerUnit > 0)
    const total = cartProducts.reduce((s, i) => s + i.product.pricePerUnit * i.quantity, 0)

    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 14px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{`.notepad-line { border-bottom: 1.5px solid #d4e4f7; padding: 10px 0 10px 12px; display: flex; justify-content: space-between; align-items: center; } .cart-notepad-d { display: none; } @media (min-width: 1024px) { .cart-notepad-d { display: block; } } .details-grid { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; } @media (min-width: 1024px) { .details-grid { grid-template-columns: 1fr 340px; gap: 32px; } }`}</style>

        <div className="details-grid">

          {/* ── LEFT: Form ── */}
          <div>
            <button onClick={() => setStep('cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B4513', fontSize: '16px', fontWeight: 700, marginBottom: '24px', padding: 0 }}>
              ← Back
            </button>

            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 7vw, 3rem)', color: '#5C2D0F', letterSpacing: '1px', marginBottom: '8px' }}>
              Your Details
            </h1>
            <p style={{ color: '#8B4513', fontSize: '16px', marginBottom: '36px' }}>
              Fill in below to place your order
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={LABEL_STYLE}>🏪 Shop Name *</label>
                <input type="text" value={details.shopName} onChange={e => setDetails(d => ({ ...d, shopName: e.target.value }))} placeholder="e.g. Sharma General Store" style={FIELD_STYLE} onFocus={e => (e.target.style.borderColor = '#FF6B00')} onBlur={e => (e.target.style.borderColor = '#FFD4A0')} />
              </div>
              <div>
                <label style={LABEL_STYLE}>👤 Your Name</label>
                <input type="text" value={details.contactName} onChange={e => setDetails(d => ({ ...d, contactName: e.target.value }))} placeholder="e.g. Ram Sharma" style={FIELD_STYLE} onFocus={e => (e.target.style.borderColor = '#FF6B00')} onBlur={e => (e.target.style.borderColor = '#FFD4A0')} />
              </div>
              <div>
                <label style={LABEL_STYLE}>📱 Mobile Number *</label>
                <input type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={10} value={details.phone} onChange={e => setDetails(d => ({ ...d, phone: e.target.value.replace(/\D/g, '') }))} placeholder="10-digit number" style={FIELD_STYLE} onFocus={e => (e.target.style.borderColor = '#FF6B00')} onBlur={e => (e.target.style.borderColor = '#FFD4A0')} />
                {details.phone && !validPhone && (
                  <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '6px', fontWeight: 600 }}>Enter a valid Indian mobile number (starts with 6-9)</p>
                )}
              </div>
              <div>
                <label style={LABEL_STYLE}>📍 Area / Locality *</label>
                <input type="text" value={details.locality} onChange={e => setDetails(d => ({ ...d, locality: e.target.value }))} placeholder="e.g. Rajwada, Indore" style={FIELD_STYLE} onFocus={e => (e.target.style.borderColor = '#FF6B00')} onBlur={e => (e.target.style.borderColor = '#FFD4A0')} />
              </div>
            </div>

            <button onClick={() => setStep('review')} disabled={!isDetailsValid} style={{ marginTop: '24px', width: '100%', background: isDetailsValid ? 'linear-gradient(135deg, #FF6B00, #FF9A3C)' : '#e5e7eb', color: isDetailsValid ? '#fff' : '#9ca3af', border: 'none', cursor: isDetailsValid ? 'pointer' : 'not-allowed', padding: '18px', borderRadius: '16px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 'clamp(16px, 4vw, 20px)', boxShadow: isDetailsValid ? '0 8px 32px rgba(255,107,0,0.4)' : 'none', transition: 'all 0.2s' }}>
              Next →
            </button>
          </div>

          {/* ── RIGHT: Notepad ── */}
          <div className="cart-notepad-d" style={{ position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 24px', marginBottom: '-8px', position: 'relative', zIndex: 2 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(92,45,15,0.15)', border: '2.5px solid rgba(92,45,15,0.25)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)' }} />
              ))}
            </div>
            <div style={{ background: '#FEFCE8', borderRadius: '4px', boxShadow: '2px 4px 16px rgba(0,0,0,0.18), 4px 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden', backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #d4e4f7 31px, #d4e4f7 32px)', backgroundSize: '100% 32px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '44px', top: 0, bottom: 0, width: '2px', background: 'rgba(220,60,60,0.35)', zIndex: 1 }} />
              <div style={{ background: '#5C2D0F', padding: '16px 20px 14px 52px', position: 'relative', zIndex: 2 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: '#FFD4A0', letterSpacing: '2px' }}>VASU TRADERS</div>
                <div style={{ fontSize: '10px', color: '#FFB880', fontWeight: 600, marginTop: '2px' }}>ORDER SLIP · {today}</div>
              </div>
              <div style={{ padding: '8px 20px 8px 52px', position: 'relative', zIndex: 2 }}>
                {cartProducts.map(({ productId, quantity, product }) => (
                  <div key={productId} className="notepad-line">
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#1a1a1a', flex: 1, paddingRight: '8px', lineHeight: 1.3 }}>{product.name}</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: '#C2410C', whiteSpace: 'nowrap' }}>× {quantity}</span>
                  </div>
                ))}
                {hasPrice && (
                  <div style={{ borderTop: '2px solid #C2410C', marginTop: '8px', paddingTop: '12px', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '13px', color: '#5C2D0F' }}>TOTAL</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#15803d' }}>₹{total.toFixed(0)}</span>
                  </div>
                )}
                <div style={{ paddingTop: hasPrice ? '4px' : '16px', paddingBottom: '16px' }}>
                  <p style={{ fontSize: '10px', color: '#92400e', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>* Prices confirmed on order. Wholesale rates apply.</p>
                </div>
              </div>
            </div>
            <div style={{ height: '6px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), transparent)', marginTop: '-2px', borderRadius: '0 0 4px 4px' }} />
          </div>

        </div>
      </div>
    )
  }

  // ─── STEP: REVIEW ───────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 14px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <button onClick={() => setStep('details')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B4513', fontSize: '16px', fontWeight: 700, marginBottom: '24px', padding: 0 }}>
        ← Back
      </button>

      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 7vw, 3rem)', color: '#5C2D0F', letterSpacing: '1px', marginBottom: '8px' }}>
        Review Order
      </h1>
      <p style={{ color: '#8B4513', fontSize: '16px', marginBottom: '28px' }}>
        Check once before placing
      </p>

      {/* Order items */}
      <div style={{ background: 'rgba(255,240,230,0.95)', border: '2px solid #FFD4A0', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
        <p style={{ fontWeight: 800, fontSize: '16px', color: '#5C2D0F', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          🛒 Items
        </p>
        {cartProducts.map(({ productId, quantity, product }) => (
          <div key={productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #FFE0C0', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: '#FF6B00', flexShrink: 0 }}>× {quantity} {product.unit}</span>
          </div>
        ))}
      </div>

      {/* Customer details */}
      <div style={{ background: 'rgba(255,240,230,0.95)', border: '2px solid #FFD4A0', borderRadius: '20px', padding: '24px', marginBottom: '28px' }}>
        <p style={{ fontWeight: 800, fontSize: '16px', color: '#5C2D0F', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          👤 Your Details
        </p>
        {[
          { label: '🏪 Shop', value: details.shopName },
          { label: '👤 Name', value: details.contactName || '—' },
          { label: '📱 Mobile', value: details.phone },
          { label: '📍 Area', value: details.locality },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #FFE0C0' }}>
            <span style={{ fontWeight: 600, fontSize: '16px', color: '#8B4513' }}>{label}</span>
            <span style={{ fontWeight: 700, fontSize: '17px', color: '#1a1a1a', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
          </div>
        ))}
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '16px', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
          {error}
        </p>
      )}

      <button
        onClick={handleConfirm}
        disabled={loading}
        style={{
          width: '100%',
          background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #15803d, #16a34a)',
          color: loading ? '#9ca3af' : '#fff',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          padding: '18px',
          borderRadius: '16px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(16px, 4vw, 20px)',
          boxShadow: loading ? 'none' : '0 8px 32px rgba(21,128,61,0.4)',
          transition: 'all 0.2s',
        }}
      >
        {loading ? '⏳ Placing order...' : '✅ Place Order'}
      </button>
    </div>
  )
}
