import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProducts } from '@/lib/supabase/products'
import { getCategories } from '@/lib/supabase/categories'
import { getDescription } from '@/lib/i18n'
import { CATEGORY_BG } from '@/components/catalog/marketplaceConfig'
import { toSlug } from '@/lib/categorySlug'

interface Props {
  params: Promise<{ slug: string }>
}

const CATEGORY_SEO: Record<string, { description: string; keywords: string[] }> = {
  'Playing Cards': {
    description: 'Buy playing cards in bulk at wholesale prices from Vasu Traders, Indore. We supply standard card decks, jumbo-index cards, and specialty playing cards to retailers and distributors across India. Minimum order available with competitive bulk pricing.',
    keywords: ['playing cards wholesale', 'ताश थोक', 'card decks bulk Indore', 'wholesale playing cards supplier India', 'playing cards bulk order'],
  },
  'Poker Chips': {
    description: 'Wholesale poker chips from Vasu Traders, Indore. Casino-style clay and plastic poker chips available in bulk for retailers, game shops, and event organizers. Best wholesale prices with pan India delivery.',
    keywords: ['poker chips wholesale India', 'casino chips bulk', 'poker chip set wholesale', 'poker chips supplier Indore', 'पोकर चिप्स थोक'],
  },
  'Party Balloons': {
    description: 'Wholesale party balloons from Vasu Traders, Indore. Latex balloons, metallic foil balloons, and assorted color balloon packs available in bulk for event planners, balloon decorators, and retailers across India.',
    keywords: ['party balloons wholesale India', 'गुब्बारे थोक', 'latex balloons bulk', 'wholesale balloons Indore', 'foil balloons supplier'],
  },
  'Rubber Bands': {
    description: 'Bulk rubber bands at wholesale prices from Vasu Traders, Indore. Assorted sizes and colors available. Trusted supplier for offices, stationery shops, and retailers with pan India delivery.',
    keywords: ['rubber bands wholesale India', 'रबर बैंड थोक', 'rubber bands bulk Indore', 'wholesale rubber bands supplier', 'rubber bands bulk order'],
  },
  'Sports & Games': {
    description: 'Wholesale sports and games supplies from Vasu Traders, Indore. Cricket equipment, indoor games, and sports accessories at bulk prices for retailers, sports shops, and distributors across India.',
    keywords: ['sports goods wholesale Indore', 'games wholesale India', 'sports equipment bulk supplier', 'खेल सामग्री थोक'],
  },
  'Toothbrushes': {
    description: 'Wholesale toothbrushes in bulk from Vasu Traders, Indore. Quality toothbrushes for medical stores, hotels, and retailers at competitive wholesale prices with pan India supply.',
    keywords: ['toothbrush wholesale India', 'टूथब्रश थोक', 'bulk toothbrushes supplier', 'wholesale toothbrush Indore', 'toothbrush bulk order'],
  },
  'Tapes': {
    description: 'Wholesale adhesive tapes, cello tape, and packing tapes from Vasu Traders, Indore. All types of tapes available in bulk for stationery shops, packaging businesses, and retailers.',
    keywords: ['adhesive tape wholesale Indore', 'cello tape bulk supplier', 'packing tape wholesale India', 'tape supplier Indore bulk'],
  },
  'Kanche & Glass Balls': {
    description: 'Wholesale kanche (glass marbles) and glass balls from Vasu Traders, Indore. Traditional toy marbles and glass balls in all sizes, available in bulk for toy retailers and general stores.',
    keywords: ['kanche wholesale India', 'कंचे थोक', 'glass balls bulk', 'marble toys wholesale Indore', 'kanche supplier India'],
  },
  'Boric Acid': {
    description: 'Wholesale boric acid powder from Vasu Traders, Indore. Quality boric acid in bulk for pest control, industrial, and household use. Competitive wholesale rates with pan India delivery.',
    keywords: ['boric acid wholesale India', 'boric powder bulk', 'boric acid supplier Indore', 'बोरिक एसिड थोक'],
  },
  'General Goods': {
    description: 'Wholesale general goods and everyday items from Vasu Traders, Indore. Wide variety of products available in bulk at competitive wholesale prices for retailers and general stores.',
    keywords: ['general goods wholesale Indore', 'wholesale general store items', 'bulk goods supplier India', 'सामान्य सामान थोक'],
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [categories, allProducts] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
  ])
  const category = categories.find(c => toSlug(c.name) === slug)
  const categoryName = category?.name ??
    Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)))
      .find(c => toSlug(c) === slug)
  if (!categoryName) return { title: 'Not Found' }

  const seo = CATEGORY_SEO[categoryName]
  const title = `${categoryName} Wholesale Supplier in Indore | Vasu Traders`
  const description = seo?.description ||
    `Buy ${categoryName} wholesale from Vasu Traders, Indore. Quality products at bulk prices for retailers across India.`

  return {
    title,
    description,
    keywords: seo?.keywords,
    alternates: { canonical: `https://www.vasutraders.com/catalog/c/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://www.vasutraders.com/catalog/c/${slug}`,
      images: [{ url: '/logo.png', alt: `${categoryName} Wholesale — Vasu Traders Indore` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/logo.png'],
    },
  }
}

export const revalidate = 3600

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts(),
  ])
  const category = categories.find(c => toSlug(c.name) === slug)

  // Fall back to matching by product category field if not in categories table
  const categoryName = category?.name ??
    Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)))
      .find(c => toSlug(c) === slug)
  if (!categoryName) notFound()

  const products = allProducts.filter(p => p.category === categoryName)
  if (products.length === 0) notFound()

  const activeSubs = (category?.subcategories ?? []).filter(sub =>
    products.some(p => p.subcategory === sub.name)
  )

  const seo = CATEGORY_SEO[categoryName]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vasutraders.com' },
      { '@type': 'ListItem', position: 2, name: 'Catalog', item: 'https://www.vasutraders.com/catalog' },
      { '@type': 'ListItem', position: 3, name: categoryName, item: `https://www.vasutraders.com/catalog/c/${slug}` },
    ],
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryName} Wholesale Products — Vasu Traders`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://www.vasutraders.com/catalog/${p.id}`,
      name: p.name,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <style>{`
        .cat-product-card { transition: box-shadow 0.15s; }
        .cat-product-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 20px' }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', color: '#9ca3af', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <span>/</span>
          <Link href="/catalog" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>Catalog</Link>
          <span>/</span>
          <span style={{ color: '#374151' }}>{categoryName}</span>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: '#1a1a1a', margin: '0 0 12px', letterSpacing: '1px', lineHeight: 1.1 }}>
            {categoryName} — Wholesale Supplier
          </h1>
          <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.7, maxWidth: '750px', margin: '0 0 16px' }}>
            {seo?.description ||
              `Buy ${categoryName} wholesale from Vasu Traders, Indore. Quality products at bulk prices for retailers across India.`}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: '#FEF2F2', color: '#B91C1C', fontSize: '13px', fontWeight: 700, padding: '6px 14px', borderRadius: '20px', border: '1px solid #FECACA' }}>
              {products.length} Products
            </span>
            <span style={{ background: '#f9f9f9', color: '#6b7280', fontSize: '13px', padding: '6px 14px', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
              Indore, Madhya Pradesh
            </span>
            <span style={{ background: '#f9f9f9', color: '#6b7280', fontSize: '13px', padding: '6px 14px', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
              Pan India Supply
            </span>
          </div>
        </div>

        {/* Subcategory filter pills */}
        {activeSubs.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <Link
              href={`/catalog/c/${slug}`}
              style={{ padding: '7px 16px', borderRadius: '20px', background: '#B91C1C', color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}
            >
              All
            </Link>
            {activeSubs.map(sub => (
              <Link
                key={sub.id}
                href={`/catalog/c/${slug}/${toSlug(sub.name)}`}
                style={{ padding: '7px 16px', borderRadius: '20px', background: '#f9f9f9', color: '#374151', fontSize: '13px', fontWeight: 600, textDecoration: 'none', border: '1px solid #e5e7eb' }}
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {/* Product grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 45%), 1fr))', gap: '16px', marginBottom: '48px' }}>
          {products.map(product => {
            const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg,#f8f7f4,#efefed)'
            const descEn = getDescription(product.description, 'en')
            return (
              <Link
                key={product.id}
                href={`/catalog/${product.id}`}
                className="cat-product-card"
                style={{ textDecoration: 'none', display: 'block', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f0f0f0', background: '#fff' }}
              >
                <div style={{ position: 'relative', aspectRatio: '1/1', background: imgBg }}>
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={`${product.name} wholesale`}
                      fill
                      style={{ objectFit: 'contain', padding: '12px' }}
                      sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 200px"
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '40px' }}>📦</div>
                  )}
                  {(product.bulkVariants?.length ?? 0) > 0 && (
                    <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: '#1d4ed8', fontSize: '8px', fontWeight: 800, color: '#fff', padding: '3px 7px', borderRadius: '4px', letterSpacing: '0.8px' }}>
                      BULK
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <p style={{ fontWeight: 800, fontSize: '13px', color: '#1a1a1a', margin: '0 0 3px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                  </p>
                  {descEn && (
                    <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {descEn}
                    </p>
                  )}
                  {product.pricePerUnit > 0 ? (
                    <p style={{ fontSize: '1rem', color: '#B91C1C', margin: 0, fontWeight: 800 }}>
                      ₹{product.pricePerUnit.toFixed(0)}{' '}
                      <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 400 }}>/{product.unit}</span>
                    </p>
                  ) : (
                    <p style={{ color: '#B91C1C', fontWeight: 700, fontSize: '12px', margin: 0 }}>Call for price</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{ background: '#FEF2F2', borderRadius: '12px', padding: '24px', marginBottom: '32px', border: '1px solid #FECACA', textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', margin: '0 0 8px' }}>
            Looking for bulk pricing on {categoryName}?
          </p>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 16px' }}>
            Contact Vasu Traders for wholesale rates and minimum order details.
          </p>
          <a
            href={`https://wa.me/919074000786?text=${encodeURIComponent(`Hi, I'd like to enquire about wholesale ${categoryName} from Vasu Traders.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', padding: '12px 28px', borderRadius: '6px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
            Enquire on WhatsApp
          </a>
        </div>

        <div style={{ paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
          <Link href="/catalog" style={{ color: '#B91C1C', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
            ← Browse All Products
          </Link>
        </div>

      </div>
    </>
  )
}
