import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wholesale Product Catalog — Playing Cards, Balloons, Sports Goods',
  description: 'Browse Vasu Traders wholesale catalog. Playing cards, poker chips, party balloons, rubber bands, sports goods, toothbrushes and more. Bulk orders welcome from Indore, MP.',
  keywords: [
    'wholesale catalog Indore',
    'playing cards bulk order',
    'party balloons wholesale India',
    'poker chips bulk',
    'rubber bands wholesale',
    'sports goods Indore',
    'wholesale products Madhya Pradesh',
  ],
  alternates: {
    canonical: 'https://www.vasutraders.com/catalog',
  },
  openGraph: {
    title: 'Wholesale Product Catalog | Vasu Traders Indore',
    description: 'Browse our wholesale catalog. Playing cards, poker chips, party balloons, rubber bands, sports goods and more. Bulk orders welcome.',
    url: 'https://www.vasutraders.com/catalog',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Vasu Traders Wholesale Catalog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wholesale Product Catalog | Vasu Traders Indore',
    description: 'Browse playing cards, poker chips, balloons, sports goods & more. Bulk orders welcome.',
    images: ['/logo.png'],
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.vasutraders.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Product Catalog',
      item: 'https://www.vasutraders.com/catalog',
    },
  ],
}

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  )
}
