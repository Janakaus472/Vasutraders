import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ChatWidget from "@/components/ChatWidget";
import PageViewTracker from "@/components/PageViewTracker";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { getSetting } from "@/lib/supabase/settings";
import { StoreInfo, DEFAULT_STORE_INFO } from "@/types/store-info";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.vasutraders.com'),
  title: {
    default: 'Vasu Traders — Wholesale Supplier in Indore, MP',
    template: '%s | Vasu Traders',
  },
  description: 'Vasu Traders is a trusted wholesale supplier in Indore, Madhya Pradesh. Browse playing cards, poker chips, party balloons, rubber bands, sports goods, and more at wholesale prices.',
  keywords: [
    'wholesale supplier Indore',
    'थोक विक्रेता इंदौर',
    'playing cards wholesale Indore',
    'poker chips wholesale',
    'party balloons wholesale India',
    'rubber bands wholesale Indore',
    'sports goods wholesale Indore',
    'toothbrush wholesale India',
    'kanche glass balls wholesale',
    'Vasu Traders Indore',
    'wholesale goods Madhya Pradesh',
    'bulk order supplier Indore',
    'wholesale market Indore',
    'ताश थोक इंदौर',
    'गुब्बारे थोक',
  ],
  authors: [{ name: 'Vasu Traders' }],
  creator: 'Vasu Traders',
  verification: {
    google: '6d8f0336690c3c79',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.vasutraders.com',
    siteName: 'Vasu Traders',
    title: 'Vasu Traders — Wholesale Supplier in Indore, MP',
    description: 'Trusted wholesale supplier in Indore, MP. Playing cards, poker chips, party balloons, rubber bands, sports goods and more at wholesale prices.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Vasu Traders — Wholesale Supplier in Indore, MP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vasu Traders — Wholesale Supplier in Indore, MP',
    description: 'Trusted wholesale supplier in Indore, MP. Playing cards, poker chips, party balloons, rubber bands, sports goods and more.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://www.vasutraders.com',
    languages: {
      'en-IN': 'https://www.vasutraders.com',
      'hi-IN': 'https://www.vasutraders.com',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storeInfo = await getSetting<StoreInfo>('store_info', DEFAULT_STORE_INFO).catch(() => DEFAULT_STORE_INFO)
  const info: StoreInfo = { ...DEFAULT_STORE_INFO, ...storeInfo }

  const phone = info.phone || ''
  const email = info.email || ''
  const address = info.address || 'Indore, Madhya Pradesh, India'
  const gst = info.gst_number || ''
  const hours = info.hours || 'Mon – Sat: 10:00 AM – 7:00 PM'
  const mapsUrl = info.maps_url || 'https://maps.google.com/?q=Indore,Madhya+Pradesh,India'

  const businessSchema: Record<string, unknown> = {
    '@type': ['LocalBusiness', 'Store'],
    '@id': 'https://www.vasutraders.com/#business',
    name: 'Vasu Traders',
    description: 'Wholesale supplier of playing cards, poker chips, party balloons, rubber bands, sports goods and more in Indore, Madhya Pradesh. 20+ years of trusted wholesale trade.',
    url: 'https://www.vasutraders.com',
    logo: { '@type': 'ImageObject', url: 'https://www.vasutraders.com/logo.png', width: 512, height: 512 },
    image: 'https://www.vasutraders.com/logo.png',
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: 'Indore',
      addressRegion: 'Madhya Pradesh',
      postalCode: '452001',
      addressCountry: 'IN',
    },
    geo: { '@type': 'GeoCoordinates', latitude: '22.7196', longitude: '75.8577' },
    areaServed: [
      { '@type': 'City', name: 'Indore' },
      { '@type': 'State', name: 'Madhya Pradesh' },
      { '@type': 'Country', name: 'India' },
    ],
    priceRange: '$$',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Bank Transfer, UPI',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi'],
      ...(phone && { telephone: phone }),
      ...(email && { email }),
    },
    hasMap: mapsUrl,
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '19:00',
    }],
    ...(phone && { telephone: phone }),
    ...(email && { email }),
    ...(gst && { taxID: gst }),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Wholesale Products — Vasu Traders',
      url: 'https://www.vasutraders.com/catalog',
    },
  }

  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                businessSchema,
                {
                  '@type': 'Organization',
                  '@id': 'https://www.vasutraders.com/#organization',
                  name: 'Vasu Traders',
                  url: 'https://www.vasutraders.com',
                  logo: 'https://www.vasutraders.com/logo.png',
                  description: 'Trusted wholesale supplier in Indore, MP with 20+ years of experience.',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: address,
                    addressLocality: 'Indore',
                    addressRegion: 'Madhya Pradesh',
                    addressCountry: 'IN',
                  },
                  ...(phone && { telephone: phone }),
                  ...(email && { email }),
                  ...(gst && { taxID: gst }),
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://www.vasutraders.com/#website',
                  url: 'https://www.vasutraders.com',
                  name: 'Vasu Traders',
                  description: 'Wholesale supplier in Indore — playing cards, poker chips, balloons, sports goods & more',
                  publisher: { '@id': 'https://www.vasutraders.com/#organization' },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: { '@type': 'EntryPoint', urlTemplate: 'https://www.vasutraders.com/catalog?search={search_term_string}' },
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${geist.className} min-h-screen`}>
        <LanguageProvider>
          <CartProvider>
            <Header />
            <main className="min-h-[calc(100vh-4rem)]" style={{ position: 'relative' }}>{children}</main>
            <BottomNav />
            <footer style={{ background: '#1a1a1a', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", position: 'relative', zIndex: 1 }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '36px' }}>
                {/* Brand */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '18px', color: '#fff', marginBottom: '8px', letterSpacing: '0.5px' }}>Vasu Traders</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '16px' }}>
                    Wholesale supplier of playing cards, poker chips, party balloons, rubber bands, sports goods &amp; more.
                    Based in Indore, MP.
                  </div>
                  <div style={{ display: 'inline-block', background: '#DC2626', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '4px', letterSpacing: '2px', textTransform: 'uppercase' as const }}>
                    Wholesale Only
                  </div>
                  {gst && (
                    <div style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                      GST: {gst}
                    </div>
                  )}
                </div>
                {/* Quick Links */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '14px' }}>Quick Links</div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                    {[
                      { href: '/', label: 'Home' },
                      { href: '/catalog', label: 'Product Catalog' },
                      { href: '/about', label: 'About Us' },
                      { href: '/contact', label: 'Contact Us' },
                    ].map(link => (
                      <a key={link.href} href={link.href} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>{link.label}</a>
                    ))}
                  </div>
                </div>
                {/* Policies */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '14px' }}>Policies</div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                    {[
                      { href: '/shipping-policy', label: 'Shipping Policy' },
                      { href: '/returns-policy', label: 'Return & Refund Policy' },
                      { href: '/cancellation-policy', label: 'Cancellation Policy' },
                      { href: '/payment-terms', label: 'Payment Terms' },
                      { href: '/terms-and-conditions', label: 'Terms & Conditions' },
                      { href: '/privacy-policy', label: 'Privacy Policy' },
                    ].map(link => (
                      <a key={link.href} href={link.href} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>{link.label}</a>
                    ))}
                  </div>
                </div>
                {/* Contact */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '14px' }}>Contact</div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                    {phone && (
                      <a href={`tel:${phone.replace(/\s/g, '')}`} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                        📞 {phone}
                      </a>
                    )}
                    {email && (
                      <a href={`mailto:${email}`} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                        ✉️ {email}
                      </a>
                    )}
                    <div>📍 {address}</div>
                    <div>🕐 {hours}</div>
                    <div style={{ marginTop: '4px' }}>
                      <a href="/contact" style={{ display: 'inline-block', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '13px', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none' }}>
                        💬 WhatsApp / Call
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '8px', maxWidth: '1100px', margin: '0 auto' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>© {new Date().getFullYear()} Vasu Traders · All Rights Reserved · Wholesale Supplier, Indore MP</span>
                <a href="https://aussieai.shop" target="_blank" rel="noopener noreferrer nofollow" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>powered by AussieAI</a>
              </div>
            </footer>
            <WhatsAppFloat />
            <ChatWidget />
            <PageViewTracker />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
