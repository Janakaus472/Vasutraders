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
  params: Promise<{ slug: string; subSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, subSlug } = await params
  const categories = await getCategories().catch(() => [])
  const category = categories.find(c => toSlug(c.name) === slug)
  if (!category) return { title: 'Not Found' }
  const sub = category.subcategories.find(s => toSlug(s.name) === subSlug)
  if (!sub) return { title: 'Not Found' }

  const title = `${sub.name} — ${category.name} Wholesale Supplier | Vasu Traders Indore`
  const description = `Buy ${sub.name} (${category.name}) wholesale from Vasu Traders, Indore. Bulk pricing available for retailers across India. Competitive rates, pan India delivery.`

  return {
    title,
    description,
    alternates: { canonical: `https://www.vasutraders.com/catalog/c/${slug}/${subSlug}` },
    openGraph: {
      title,
      description,
      url: `https://www.vasutraders.com/catalog/c/${slug}/${subSlug}`,
      images: [{ url: '/logo.png', alt: `${sub.name} Wholesale — Vasu Traders` }],
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

export default async function SubcategoryPage({ params }: Props) {
  const { slug, subSlug } = await params
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts(),
  ])
  const category = categories.find(c => toSlug(c.name) === slug)
  if (!category) notFound()
  const sub = category.subcategories.find(s => toSlug(s.name) === subSlug)
  if (!sub) notFound()

  const products = allProducts.filter(p => p.category === category.name && p.subcategory === sub.name)
  if (products.length === 0) notFound()

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vasutraders.com' },
      { '@type': 'ListItem', position: 2, name: 'Catalog', item: 'https://www.vasutraders.com/catalog' },
      { '@type': 'ListItem', position: 3, name: category.name, item: `https://www.vasutraders.com/catalog/c/${slug}` },
      { '@type': 'ListItem', position: 4, name: sub.name, item: `https://www.vasutraders.com/catalog/c/${slug}/${subSlug}` },
    ],
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${sub.name} (${category.name}) — Vasu Traders`,
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
        .sub-product-card { transition: box-shadow 0.15s; }
        .sub-product-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 20px' }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', color: '#9ca3af', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <span>/</span>
          <Link href="/catalog" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>Catalog</Link>
          <span>/</span>
          <Link href={`/catalog/c/${slug}`} style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>{category.name}</Link>
          <span>/</span>
          <span style={{ color: '#374151' }}>{sub.name}</span>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: '#1a1a1a', margin: '0 0 12px', letterSpacing: '1px', lineHeight: 1.1 }}>
            {sub.name} — {category.name} Wholesale
          </h1>
          <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.7, maxWidth: '750px', margin: '0 0 16px' }}>
            Buy {sub.name} wholesale from Vasu Traders, Indore. Quality {category.name.toLowerCase()} at bulk prices for retailers and distributors across India.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: '#FEF2F2', color: '#B91C1C', fontSize: '13px', fontWeight: 700, padding: '6px 14px', borderRadius: '20px', border: '1px solid #FECACA' }}>
              {products.length} Products
            </span>
            <span style={{ background: '#f9f9f9', color: '#6b7280', fontSize: '13px', padding: '6px 14px', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
              Indore, Madhya Pradesh
            </span>
          </div>
        </div>

        {/* Sibling subcategory pills */}
        {category.subcategories.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <Link
              href={`/catalog/c/${slug}`}
              style={{ padding: '7px 16px', borderRadius: '20px', background: '#f9f9f9', color: '#374151', fontSize: '13px', fontWeight: 600, textDecoration: 'none', border: '1px solid #e5e7eb' }}
            >
              All {category.name}
            </Link>
            {category.subcategories.map(s => (
              <Link
                key={s.id}
                href={`/catalog/c/${slug}/${toSlug(s.name)}`}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  background: s.name === sub.name ? '#B91C1C' : '#f9f9f9',
                  color: s.name === sub.name ? '#fff' : '#374151',
                  fontSize: '13px',
                  fontWeight: s.name === sub.name ? 700 : 600,
                  textDecoration: 'none',
                  border: s.name === sub.name ? 'none' : '1px solid #e5e7eb',
                }}
              >
                {s.name}
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
                className="sub-product-card"
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

        <div style={{ paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
          <Link href={`/catalog/c/${slug}`} style={{ color: '#B91C1C', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
            ← Back to {category.name}
          </Link>
        </div>

      </div>
    </>
  )
}
