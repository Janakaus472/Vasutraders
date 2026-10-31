'use client'

import { useState, useEffect } from 'react'
import type { PolicySection } from '@/components/PolicyRenderer'

type AllPolicies = Record<string, PolicySection[] | null>

const POLICIES = [
  { key: 'shipping',     label: 'Shipping Policy',           icon: '🚚' },
  { key: 'returns',      label: 'Return & Refund Policy',    icon: '↩️' },
  { key: 'refund',       label: 'Order & Delivery Policy',   icon: '📦' },
  { key: 'cancellation', label: 'Cancellation Policy',       icon: '❌' },
  { key: 'payment',      label: 'Payment Terms',             icon: '💳' },
  { key: 'terms',        label: 'Terms & Conditions',        icon: '📋' },
  { key: 'privacy',      label: 'Privacy Policy',            icon: '🔒' },
]

const DEFAULTS: Record<string, PolicySection[]> = {
  shipping: [
    { title: 'Overview', body: 'Vasu Traders is a wholesale supplier based in Indore, Madhya Pradesh. We supply to retailers, shopkeepers, and businesses across India. Shipping terms are finalised on a per-order basis after discussion.' },
    { title: 'Shipping Timelines', body: '- Orders are dispatched after payment confirmation\n- Typical dispatch: **1–3 business days** from payment date\n- Delivery timeline depends on destination and transport mode\n- We notify you once your order is dispatched' },
    { title: 'Shipping Charges', body: '- Shipping charges are **not included** in the product price unless stated\n- Charges depend on order weight, dimensions, and destination\n- The applicable charge is shared before order confirmation\n- You are welcome to arrange your own transporter if preferred' },
    { title: 'Transport Modes', body: '- **Road Transport:** For large bulk orders to nearby states\n- **Parcel Services:** For medium-sized orders to most cities\n- **Courier:** For smaller orders where speed is required\n- **Customer-Arranged Transport:** We will load goods if you send your own vehicle' },
    { title: 'Delivery Areas', body: '- We supply across **India**\n- Regular routes to Indore, Ujjain, Bhopal, and Madhya Pradesh\n- Pan-India delivery available via parcel and courier\n- International shipping is currently not available' },
    { title: 'Responsibility After Dispatch', body: '- Once goods are handed to the transporter, transport responsibility transfers to the logistics partner\n- Vasu Traders is not liable for delays or losses during transit\n- Inspect goods on arrival — transit damage must be reported to the transporter immediately\n- Report any transit damage to us within **48 hours** with photos' },
  ],
  returns: [
    { title: 'Overview', body: 'Vasu Traders is a wholesale supplier. All sales are made on a B2B basis. Please read this policy carefully before placing your order.' },
    { title: 'Non-Returnable Products', body: 'As a wholesale supplier, we generally do not accept returns once goods are dispatched and received. Products are non-returnable in the following cases:\n- Change of mind or over-ordering\n- Products that have been used, opened, or repackaged\n- Goods damaged due to mishandling after delivery' },
    { title: 'Exceptions — When Returns May Be Accepted', body: 'Returns may be considered only in the following situations:\n- **Wrong product delivered:** We sent a different product than what was ordered\n- **Manufacturing defect:** The product has a clear manufacturing fault (not damage from misuse)\n- **Damaged in transit:** Goods arrived visibly damaged (must be reported within 48 hours with photos)\nAll exceptions are subject to verification and mutual agreement.' },
    { title: 'How to Report an Issue', body: '- Report the issue within **48 hours** of delivery\n- Provide your order details, photos of the issue, and a description\n- Contact us via phone or WhatsApp — do not return goods without prior approval\n- Unauthorised returns will not be accepted' },
    { title: 'Refund Process', body: 'If a return or refund is approved:\n- Refunds are processed via the original payment method (bank transfer / UPI)\n- Processing time: **5–7 business days** after approval\n- Replacement goods can be arranged in lieu of refund where possible' },
  ],
  refund: [
    { title: 'Overview', body: 'Vasu Traders is a wholesale supplier based in Indore, Madhya Pradesh. All sales are final once payment is confirmed and goods are dispatched.' },
    { title: 'No Return Policy', body: 'All wholesale goods sold by Vasu Traders are **non-returnable** unless:\n- A wrong product was delivered\n- Goods arrived with a manufacturing defect\n- Transit damage was reported within 48 hours with photographic evidence' },
    { title: 'Order Confirmation & Dispatch', body: '- Orders are confirmed only after full payment is received (unless credit terms are agreed)\n- Goods are dispatched via the transport mode discussed at time of order\n- A dispatch notification will be sent once goods are handed to the transporter' },
    { title: 'Delivery Charges', body: '- Delivery charges are calculated based on order weight, volume, and destination\n- Charges are shared with you before order confirmation\n- Vasu Traders does not absorb freight costs unless explicitly agreed in writing' },
    { title: 'Transport Mode', body: '- Goods are dispatched via road transport, parcel service, or courier as agreed\n- For large orders, customer may send their own vehicle — we will load accordingly\n- Once goods are handed to the transporter, Vasu Traders is not responsible for transit delays or damage' },
    { title: 'Contact Us', body: 'For any issues with your order, contact us immediately with your order details and photos where applicable.' },
  ],
  cancellation: [
    { title: 'Overview', body: 'This policy outlines when and how wholesale orders placed with Vasu Traders can be cancelled.' },
    { title: 'Cancellation Window by Order Status', body: '- **Before Payment:** Orders can be cancelled at any time before payment is made — simply inform us\n- **After Payment, Before Dispatch:** Cancellation may be possible — contact us immediately. A cancellation fee may apply if packing has begun\n- **After Dispatch:** Orders cannot be cancelled once goods have been handed to the transporter' },
    { title: 'How to Cancel an Order', body: '- Call or WhatsApp us immediately\n- Provide your order details and reason for cancellation\n- Do not refuse delivery without speaking to us first — refused deliveries may incur return freight charges' },
    { title: 'Cancellation by Vasu Traders', body: 'Vasu Traders reserves the right to cancel an order in the following cases:\n- Product is out of stock and no alternative is available\n- Payment not received within the agreed timeframe\n- Incorrect or unverifiable delivery address\nYou will be notified and a full refund will be issued if payment was made.' },
    { title: 'Refunds on Cancellation', body: '- Cancellations approved before dispatch: **Full refund** processed within 5–7 business days\n- Cancellations after packing has begun: Refund minus applicable packing/handling charges\n- Refunds are processed via the original payment method (bank transfer / UPI)' },
  ],
  payment: [
    { title: 'Overview', body: 'Vasu Traders is a B2B wholesale supplier. Payment terms are agreed upon before each order is confirmed. This page outlines our standard payment practices.' },
    { title: 'Payment Methods Accepted', body: '- **Bank Transfer (NEFT/RTGS/IMPS):** Preferred for large orders\n- **UPI:** For faster payments on smaller orders\n- **Cash:** For in-person/local pickup orders\n- **Cheque:** Subject to clearance before dispatch' },
    { title: 'Payment Terms by Order Type', body: '- **New Customers:** 100% advance payment before dispatch\n- **Returning Customers:** May be eligible for partial advance + balance on delivery (by agreement)\n- **Credit Terms:** Available for established wholesale partners by prior arrangement only' },
    { title: 'When Payment is Due', body: '- Payment must be received before goods are dispatched (unless credit terms apply)\n- Order confirmation is sent after payment is verified\n- If payment is not received within the agreed timeframe, the order may be cancelled' },
    { title: 'Taxes & GST', body: '- Prices may be quoted inclusive or exclusive of GST depending on the discussion\n- GST invoices are issued upon request for registered businesses\n- Please provide your GSTIN at the time of order if you require a GST invoice' },
    { title: 'Refunds & Failed Payments', body: '- Refunds for cancelled or disputed orders are processed within **5–7 business days**\n- Failed UPI/bank transfers: Please contact us with a screenshot for resolution\n- Chargeback disputes must be raised within **48 hours** of the transaction' },
  ],
  terms: [
    { title: '1. About Vasu Traders', body: 'Vasu Traders is a wholesale supplier based in Indore, Madhya Pradesh, India. We supply playing cards, poker chips, party balloons, rubber bands, sports goods, and other wholesale products to retailers and businesses across India.' },
    { title: '2. Wholesale Business Model', body: 'We operate as a B2B wholesale supplier. By placing an order with us, you confirm that you are purchasing goods for resale or business use, not for personal/retail consumption.' },
    { title: '3. Pricing', body: '- All prices are quoted in Indian Rupees (INR)\n- Prices may change without prior notice\n- Final pricing is confirmed at the time of order\n- Bulk discounts may be available — contact us to discuss' },
    { title: '4. Ordering Process', body: '- Browse our catalog and note the products and quantities you need\n- Contact us via phone or WhatsApp with your requirements\n- We will confirm availability and share pricing\n- Orders are confirmed only after pricing and payment terms are agreed' },
    { title: '5. Order Confirmation', body: 'An order is considered confirmed only when:\n- Pricing, quantity, and delivery terms have been mutually agreed\n- Payment (or advance payment) has been received\nVerbal agreements are not binding — written/WhatsApp confirmation is required.' },
    { title: '6. Payment', body: 'Refer to our Payment Terms page for full details. Standard policy is advance payment before dispatch.' },
    { title: '7. Delivery & Shipping', body: 'Refer to our Shipping Policy for full details on timelines, charges, and transport modes.' },
    { title: '8. Returns & Refunds', body: 'All sales are generally final. Refer to our Returns & Refund Policy for the limited conditions under which returns may be accepted.' },
    { title: '9. Product Information', body: '- We make every effort to ensure product descriptions and images are accurate\n- Minor variations in colour, packaging, or specifications may occur\n- If you have specific requirements, please discuss before ordering' },
    { title: '10. Limitation of Liability', body: 'Vasu Traders liability is limited to the value of the goods supplied. We are not liable for any indirect or consequential losses arising from the use of our products.' },
    { title: '11. Governing Law', body: 'These terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of courts in Indore, Madhya Pradesh.' },
    { title: '12. Changes to Terms', body: 'Vasu Traders reserves the right to update these terms at any time. The latest version will always be available on this website.' },
    { title: '13. Contact Us', body: 'For any questions about these terms, please contact us via phone, WhatsApp, or email.' },
  ],
  privacy: [
    { title: '1. Introduction', body: 'Vasu Traders ("we", "us", "our") is committed to protecting the privacy of our business customers and website visitors. This policy explains how we collect and use your information.' },
    { title: '2. Information We Collect', body: 'We may collect the following information when you contact us or place an order:\n- Business name and owner/contact name\n- Phone number and email address\n- Delivery address\n- GSTIN (if provided)\n- Order history and product preferences' },
    { title: '3. How We Use Your Information', body: '- To process and fulfil your wholesale orders\n- To communicate about pricing, availability, and delivery\n- To send order updates and dispatch notifications\n- To maintain our business records\n- To improve our service' },
    { title: '4. Information Sharing', body: 'We do not sell, rent, or trade your personal information to third parties. We may share information with:\n- Logistics partners (name, address, phone) for delivery purposes\n- Our accountant/CA for GST and financial compliance' },
    { title: '5. Data Storage & Security', body: '- Your information is stored securely on our systems\n- We retain business records as required by law (typically 7 years for GST purposes)\n- We take reasonable steps to protect your data from unauthorised access' },
    { title: '6. Cookies', body: 'Our website may use basic cookies for functionality (e.g., cart state). We do not use cookies for advertising tracking. You can disable cookies in your browser settings.' },
    { title: '7. Your Rights', body: 'You may contact us to:\n- Request a copy of the information we hold about you\n- Correct any inaccurate information\n- Request deletion of your data (subject to legal retention requirements)' },
    { title: '8. Third-Party Links', body: 'Our website may contain links to external sites (e.g., Google Maps, WhatsApp). We are not responsible for the privacy practices of those sites.' },
    { title: '9. Contact Us', body: 'For any privacy-related queries, please contact us via phone, WhatsApp, or email.' },
  ],
}

export default function PoliciesAdminPage() {
  const [activeKey, setActiveKey] = useState('shipping')
  const [allPolicies, setAllPolicies] = useState<AllPolicies>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/policies')
      .then(r => r.json())
      .then(data => setAllPolicies(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const activeSections = (): PolicySection[] => {
    const db = allPolicies[activeKey]
    return db ?? DEFAULTS[activeKey] ?? []
  }

  const updateSections = (sections: PolicySection[]) => {
    setAllPolicies(prev => ({ ...prev, [activeKey]: sections }))
  }

  const updateSection = (i: number, field: 'title' | 'body', value: string) => {
    const sections = [...activeSections()]
    sections[i] = { ...sections[i], [field]: value }
    updateSections(sections)
  }

  const addSection = () => {
    updateSections([...activeSections(), { title: 'New Section', body: '' }])
  }

  const removeSection = (i: number) => {
    const sections = activeSections().filter((_, idx) => idx !== i)
    updateSections(sections)
  }

  const moveSection = (i: number, dir: -1 | 1) => {
    const sections = [...activeSections()]
    const j = i + dir
    if (j < 0 || j >= sections.length) return
    ;[sections[i], sections[j]] = [sections[j], sections[i]]
    updateSections(sections)
  }

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/admin/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: activeKey, sections: activeSections() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const handleReset = async () => {
    if (!confirm('Reset to default content? This will remove your custom edits.')) return
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: activeKey, sections: DEFAULTS[activeKey] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAllPolicies(prev => ({ ...prev, [activeKey]: DEFAULTS[activeKey] }))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const loadDefault = () => {
    updateSections(DEFAULTS[activeKey] ?? [])
  }

  const isUsingDefault = allPolicies[activeKey] === null || allPolicies[activeKey] === undefined

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Policy Pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Edit the content shown on each policy page</p>
        </div>
        <a href={`/${activeKey === 'shipping' ? 'shipping-policy' : activeKey === 'returns' ? 'returns-policy' : activeKey === 'refund' ? 'refund-policy' : activeKey === 'cancellation' ? 'cancellation-policy' : activeKey === 'payment' ? 'payment-terms' : activeKey === 'terms' ? 'terms-and-conditions' : 'privacy-policy'}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          View page ↗
        </a>
      </div>

      {/* Policy tabs */}
      <div className="flex flex-wrap gap-2">
        {POLICIES.map(p => (
          <button
            key={p.key}
            onClick={() => { setActiveKey(p.key); setSaved(false); setError('') }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeKey === p.key ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <span>{p.icon}</span>
            <span className="hidden sm:inline">{p.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading policies…</div>
      ) : (
        <>
          {/* Header bar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-bold text-gray-800">{POLICIES.find(p => p.key === activeKey)?.label}</div>
              {isUsingDefault && (
                <div className="text-xs text-amber-600 mt-0.5">Currently showing hardcoded defaults — save to lock in content</div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={loadDefault} className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Load Defaults
              </button>
              <button onClick={handleReset} className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-bold bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Policy'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
          )}

          {/* Sections */}
          <div className="space-y-3">
            {activeSections().map((section, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex flex-col gap-1 pt-1">
                    <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs leading-none">▲</button>
                    <button onClick={() => moveSection(i, 1)} disabled={i === activeSections().length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs leading-none">▼</button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={section.title}
                      onChange={e => updateSection(i, 'title', e.target.value)}
                      placeholder="Section title"
                      className="w-full font-bold text-gray-800 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <button
                    onClick={() => removeSection(i)}
                    className="text-red-400 hover:text-red-600 text-sm font-bold px-2 py-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={section.body}
                  onChange={e => updateSection(i, 'body', e.target.value)}
                  placeholder="Section content…&#10;Use - for bullet points&#10;Use **text** for bold"
                  rows={6}
                  className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 resize-y font-mono"
                />
              </div>
            ))}
          </div>

          <button
            onClick={addSection}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-orange-400 hover:text-orange-500 font-semibold text-sm transition-colors"
          >
            + Add Section
          </button>

          {/* Format guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <div className="font-bold mb-2">Formatting guide:</div>
            <div className="space-y-1 text-xs font-mono">
              <div><span className="font-bold">- item</span> → bullet point</div>
              <div><span className="font-bold">**text**</span> → <strong>bold text</strong></div>
              <div>Blank line → paragraph break</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
