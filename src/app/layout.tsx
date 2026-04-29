import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ChatWidget from "@/components/ChatWidget";
import PageViewTracker from "@/components/PageViewTracker";
import BackgroundEffect from "@/components/BackgroundEffect";
import CursorGlow from "@/components/CursorGlow";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': ['LocalBusiness', 'Store'],
                  '@id': 'https://www.vasutraders.com/#business',
                  name: 'Vasu Traders',
                  description: 'Wholesale supplier of playing cards, poker chips, party balloons, rubber bands, sports goods and more in Indore, Madhya Pradesh. 20+ years of trusted wholesale trade.',
                  url: 'https://www.vasutraders.com',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://www.vasutraders.com/logo.png',
                    width: 512,
                    height: 512,
                  },
                  image: 'https://www.vasutraders.com/logo.png',
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Indore',
                    addressRegion: 'Madhya Pradesh',
                    postalCode: '452001',
                    addressCountry: 'IN',
                  },
                  geo: {
                    '@type': 'GeoCoordinates',
                    latitude: '22.7196',
                    longitude: '75.8577',
                  },
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
                    contactType: 'sales',
                    availableLanguage: ['English', 'Hindi'],
                  },
                  hasMap: 'https://maps.google.com/?q=Indore,Madhya+Pradesh,India',
                  founder: {
                    '@type': 'Person',
                    name: 'Vasu Traders Owner',
                  },
                },
                {
                  '@type': 'Organization',
                  '@id': 'https://www.vasutraders.com/#organization',
                  name: 'Vasu Traders',
                  url: 'https://www.vasutraders.com',
                  logo: 'https://www.vasutraders.com/logo.png',
                  description: 'Trusted wholesale supplier in Indore, MP with 20+ years of experience.',
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Indore',
                    addressRegion: 'Madhya Pradesh',
                    addressCountry: 'IN',
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://www.vasutraders.com/#website',
                  url: 'https://www.vasutraders.com',
                  name: 'Vasu Traders',
                  description: 'Wholesale supplier in Indore — playing cards, poker chips, balloons, sports goods & more',
                  publisher: {
                    '@id': 'https://www.vasutraders.com/#organization',
                  },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: 'https://www.vasutraders.com/catalog?search={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${geist.className} min-h-screen`} style={{ background: 'transparent' }}>
        <LanguageProvider>
          <CartProvider>
            <BackgroundEffect />
            <CursorGlow />
            <Header />
            <main className="min-h-[calc(100vh-4rem)]" style={{ position: 'relative', zIndex: 1 }}>{children}</main>
            <BottomNav />
            <footer style={{ textAlign: 'center', padding: '24px 0 32px', fontSize: '11px', color: 'rgba(139,69,19,0.25)', fontFamily: 'sans-serif', position: 'relative', zIndex: 1 }}>
              <a href="https://aussieai.shop" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>powered by AussieAI</a>
            </footer>
            <ChatWidget />
            <PageViewTracker />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
