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
  padding: '18px 20px',
  fontSize: '20px',
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
  fontSize: '18px',
  color: '#5C2D0F',
  marginBottom: '10px',
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
      clearCart()
      setStep('success')
    } catch {
      setError('कुछ गलत हुआ। दोबारा कोशिश करें।')
    } finally {
      setLoading(false)
    }
  }

  const isDetailsValid =
    details.shopName.trim() &&
    details.phone.trim().length === 10 &&
    /^\d{10}$/.test(details.phone) &&
    details.locality.trim()

  // ─── EMPTY CART ────────────────────────────────────────────────
  if (items.length === 0 && step !== 'success') {
    return (
      <div style={{
        maxWidth: '600px', margin: '0 auto', padding: '80px 24px',
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
        maxWidth: '560px', margin: '0 auto', padding: '60px 24px',
        textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ fontSize: '6rem', marginBottom: '16px' }}>✅</div>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          color: '#15803d', letterSpacing: '1px', marginBottom: '8px',
        }}>
          ऑर्डर मिल गया!
        </h1>
        <div style={{
          background: 'rgba(255,240,230,0.95)', border: '2px solid #FFD4A0',
          borderRadius: '20px', padding: '28px 24px', margin: '24px 0',
        }}>
          <p style={{ fontSize: '15px', color: '#8B4513', marginBottom: '8px', fontWeight: 600 }}>
            ऑर्डर नंबर
          </p>
          <p style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem',
            color: '#C2410C', letterSpacing: '3px', margin: '0 0 16px',
          }}>
            {orderNumber}
          </p>
          <p style={{ fontSize: '18px', color: '#5C2D0F', fontWeight: 700, lineHeight: 1.6 }}>
            वासु ट्रेडर्स को आपका ऑर्डर मिल गया।<br />
            हम जल्दी आपसे संपर्क करेंगे।
          </p>
        </div>
        <p style={{ color: '#8B4513', fontSize: '15px', marginBottom: '28px' }}>
          किसी भी जानकारी के लिए हमें कॉल करें।
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={`tel:${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} style={{
            background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)', color: '#fff',
            fontWeight: 800, padding: '16px 32px', borderRadius: '14px',
            fontSize: '18px', textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(255,107,0,0.4)',
          }}>
            📞 कॉल करें
          </a>
          <Link href="/" style={{
            background: 'rgba(92,45,15,0.1)', color: '#5C2D0F',
            fontWeight: 700, padding: '16px 32px', borderRadius: '14px',
            fontSize: '18px', textDecoration: 'none', border: '2px solid #FFD4A0',
          }}>
            🏠 होम
          </Link>
        </div>
      </div>
    )
  }

  // ─── STEP: CART ─────────────────────────────────────────────────
  if (step === 'cart') {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#5C2D0F', letterSpacing: '1px', margin: 0 }}>
            🛒 {lang === 'hi' ? 'मेरा ऑर्डर' : 'My Order'}
          </h1>
          <button
            onClick={clearCart}
            style={{
              background: 'none', border: '1.5px solid #fca5a5', color: '#ef4444',
              padding: '7px 16px', borderRadius: '10px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600,
            }}
          >
            {lang === 'hi' ? 'सब हटाएं' : 'Clear all'}
          </button>
        </div>

        {/* Items */}
        <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(92,45,15,0.10)', marginBottom: '24px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto auto',
            gap: '16px', padding: '14px 24px',
            background: '#5C2D0F', color: '#FFD4A0',
            fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
          }}>
            <div>{lang === 'hi' ? 'उत्पाद' : 'Product'}</div>
            <div style={{ textAlign: 'center', minWidth: '80px' }}>{lang === 'hi' ? 'कीमत' : 'Price'}</div>
            <div style={{ textAlign: 'center', minWidth: '100px' }}>{lang === 'hi' ? 'मात्रा' : 'Qty'}</div>
            <div style={{ textAlign: 'right', minWidth: '80px' }}>{lang === 'hi' ? 'कुल' : 'Total'}</div>
          </div>

          {cartProducts.map(({ productId, quantity, product }, idx) => (
            <div key={productId} style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto auto',
              gap: '16px', alignItems: 'center', padding: '16px 24px',
              borderBottom: idx < cartProducts.length - 1 ? '1px solid #FFF0E0' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', background: '#FFF8F0', flexShrink: 0, border: '1px solid #FFE0C0' }}>
                  <Image src={product.imageUrl || '/placeholder-product.png'} alt={product.name} fill style={{ objectFit: 'contain', padding: '6px' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '15px', margin: '0 0 3px' }}>{product.name}</p>
                  <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>per {product.unit}</p>
                </div>
              </div>
              <div style={{ textAlign: 'center', minWidth: '80px' }}>
                {product.pricePerUnit > 0 ? (
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: '#374151' }}>₹{product.pricePerUnit.toFixed(0)}</span>
                ) : (
                  <span style={{ color: '#FF6B00', fontSize: '12px', fontWeight: 700 }}>On Request</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '100px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#FF6B00', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(255,107,0,0.3)' }}>
                  <button onClick={() => removeItem(productId)} style={{ width: '32px', height: '34px', color: '#fff', fontSize: '18px', fontWeight: 700, border: 'none', cursor: 'pointer', background: 'transparent' }}>−</button>
                  <span style={{ color: '#fff', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => addItem(productId)} style={{ width: '32px', height: '34px', color: '#fff', fontSize: '18px', fontWeight: 700, border: 'none', cursor: 'pointer', background: 'transparent' }}>+</button>
                </div>
              </div>
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

        {/* Confirm button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setStep('details')}
            style={{
              background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
              color: '#fff', border: 'none', cursor: 'pointer',
              padding: '20px 48px', borderRadius: '16px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: '22px',
              boxShadow: '0 8px 32px rgba(255,107,0,0.45), 0 0 60px rgba(255,107,0,0.2)',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}
          >
            ऑर्डर पक्का करें →
          </button>
        </div>
      </div>
    )
  }

  // ─── STEP: DETAILS ──────────────────────────────────────────────
  if (step === 'details') {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <button onClick={() => setStep('cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B4513', fontSize: '16px', fontWeight: 700, marginBottom: '24px', padding: 0 }}>
          ← वापस जाएं
        </button>

        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 7vw, 3rem)', color: '#5C2D0F', letterSpacing: '1px', marginBottom: '8px' }}>
          आपकी जानकारी
        </h1>
        <p style={{ color: '#8B4513', fontSize: '16px', marginBottom: '36px' }}>
          ऑर्डर के लिए नीचे भरें
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={LABEL_STYLE}>🏪 दुकान का नाम *</label>
            <input
              type="text"
              value={details.shopName}
              onChange={e => setDetails(d => ({ ...d, shopName: e.target.value }))}
              placeholder="जैसे: शर्मा जनरल स्टोर"
              style={FIELD_STYLE}
              onFocus={e => (e.target.style.borderColor = '#FF6B00')}
              onBlur={e => (e.target.style.borderColor = '#FFD4A0')}
            />
          </div>

          <div>
            <label style={LABEL_STYLE}>👤 आपका नाम</label>
            <input
              type="text"
              value={details.contactName}
              onChange={e => setDetails(d => ({ ...d, contactName: e.target.value }))}
              placeholder="जैसे: राम शर्मा"
              style={FIELD_STYLE}
              onFocus={e => (e.target.style.borderColor = '#FF6B00')}
              onBlur={e => (e.target.style.borderColor = '#FFD4A0')}
            />
          </div>

          <div>
            <label style={LABEL_STYLE}>📱 मोबाइल नंबर *</label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={details.phone}
              onChange={e => setDetails(d => ({ ...d, phone: e.target.value.replace(/\D/g, '') }))}
              placeholder="10 अंक का नंबर"
              style={FIELD_STYLE}
              onFocus={e => (e.target.style.borderColor = '#FF6B00')}
              onBlur={e => (e.target.style.borderColor = '#FFD4A0')}
            />
            {details.phone && !/^\d{10}$/.test(details.phone) && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '6px', fontWeight: 600 }}>
                10 अंक का नंबर डालें
              </p>
            )}
          </div>

          <div>
            <label style={LABEL_STYLE}>📍 इलाका / मोहल्ला *</label>
            <input
              type="text"
              value={details.locality}
              onChange={e => setDetails(d => ({ ...d, locality: e.target.value }))}
              placeholder="जैसे: राजवाड़ा, इंदौर"
              style={FIELD_STYLE}
              onFocus={e => (e.target.style.borderColor = '#FF6B00')}
              onBlur={e => (e.target.style.borderColor = '#FFD4A0')}
            />
          </div>
        </div>

        <button
          onClick={() => setStep('review')}
          disabled={!isDetailsValid}
          style={{
            marginTop: '36px',
            width: '100%',
            background: isDetailsValid
              ? 'linear-gradient(135deg, #FF6B00, #FF9A3C)'
              : '#e5e7eb',
            color: isDetailsValid ? '#fff' : '#9ca3af',
            border: 'none',
            cursor: isDetailsValid ? 'pointer' : 'not-allowed',
            padding: '22px',
            borderRadius: '16px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: '22px',
            boxShadow: isDetailsValid ? '0 8px 32px rgba(255,107,0,0.4)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          आगे बढ़ो →
        </button>
      </div>
    )
  }

  // ─── STEP: REVIEW ───────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <button onClick={() => setStep('details')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B4513', fontSize: '16px', fontWeight: 700, marginBottom: '24px', padding: 0 }}>
        ← वापस जाएं
      </button>

      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 7vw, 3rem)', color: '#5C2D0F', letterSpacing: '1px', marginBottom: '8px' }}>
        ऑर्डर जांचें
      </h1>
      <p style={{ color: '#8B4513', fontSize: '16px', marginBottom: '28px' }}>
        एक बार देख लें, फिर भेजें
      </p>

      {/* Order items */}
      <div style={{ background: 'rgba(255,240,230,0.95)', border: '2px solid #FFD4A0', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
        <p style={{ fontWeight: 800, fontSize: '16px', color: '#5C2D0F', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          🛒 सामान
        </p>
        {cartProducts.map(({ productId, quantity, product }) => (
          <div key={productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #FFE0C0' }}>
            <span style={{ fontWeight: 700, fontSize: '17px', color: '#1a1a1a' }}>{product.name}</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#FF6B00' }}>× {quantity} {product.unit}</span>
          </div>
        ))}
      </div>

      {/* Customer details */}
      <div style={{ background: 'rgba(255,240,230,0.95)', border: '2px solid #FFD4A0', borderRadius: '20px', padding: '24px', marginBottom: '28px' }}>
        <p style={{ fontWeight: 800, fontSize: '16px', color: '#5C2D0F', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          👤 आपकी जानकारी
        </p>
        {[
          { label: '🏪 दुकान', value: details.shopName },
          { label: '👤 नाम', value: details.contactName || '—' },
          { label: '📱 मोबाइल', value: details.phone },
          { label: '📍 इलाका', value: details.locality },
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
          padding: '22px',
          borderRadius: '16px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: '22px',
          boxShadow: loading ? 'none' : '0 8px 32px rgba(21,128,61,0.4)',
          transition: 'all 0.2s',
        }}
      >
        {loading ? '⏳ भेज रहे हैं...' : '✅ पक्का ऑर्डर भेजो'}
      </button>
    </div>
  )
}
