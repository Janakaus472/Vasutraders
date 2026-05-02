import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProduct, getProducts } from '@/lib/supabase/products'
import { getDescription } from '@/lib/i18n'
import { WHATSAPP_NUMBER } from '@/lib/constants'
import { CATEGORY_BG } from '@/components/catalog/marketplaceConfig'
import ProductPageInteractive from './ProductPageInteractive'
import { Product } from '@/types/product'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: 'Product Not Found | Vasu Traders' }

  const desc = getDescription(product.description, 'en').replace(/\n/g, ' ').trim()
  const title = `${product.name} — Wholesale ${product.category} | Vasu Traders`
  const description = desc ||
    `Buy ${product.name} wholesale from Vasu Traders, Indore. ${product.category} supplier with bulk order options. Minimum order: ${product.minOrderQty} ${product.unit}.`

  return {
    title,
    description,
    alternates: { canonical: `https://www.vasutraders.com/catalog/${id}` },
    openGraph: {
      title,
      description,
      url: `https://www.vasutraders.com/catalog/${id}`,
      images: product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : [{ url: '/logo.png', alt: 'Vasu Traders' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.imageUrl ? [product.imageUrl] : ['/logo.png'],
    },
  }
}

export const dynamic = 'force-dynamic'

function RelatedProductCard({ product }: { product: Product }) {
  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg,#f8f7f4,#efefed)'
  const descEn = getDescription(product.description, 'en')

  return (
    <Link
      href={`/catalog/${product.id}`}
      style={{ textDecoration: 'none', display: 'block', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', background: '#fff', transition: 'box-shadow 0.15s' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1/1', background: imgBg }}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            style={{ objectFit: 'contain', padding: '12px' }}
            sizes="(max-width: 540px) 50vw, (max-width: 1024px) 33vw, 200px"
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
      {/* Info */}
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
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: '#B91C1C', margin: 0 }}>
            ₹{product.pricePerUnit.toFixed(0)} <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'sans-serif', fontWeight: 400 }}>/{product.unit}</span>
          </p>
        ) : (
          <p style={{ color: '#B91C1C', fontWeight: 700, fontSize: '12px', margin: 0 }}>Call for price</p>
        )}
      </div>
    </Link>
  )
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const [product, allProducts] = await Promise.all([
    getProduct(id),
    getProducts(),
  ])
  if (!product) notFound()

  const descEn = getDescription(product.description, 'en')
  const descHi = getDescription(product.description, 'hi')
  const lowestPrice = product.bulkVariants?.length
    ? Math.min(
        ...[product.pricePerUnit, ...product.bulkVariants.map(v => v.price ?? product.pricePerUnit)].filter(p => p > 0)
      )
    : product.pricePerUnit

  // Related products: same subcategory → same category → any other product, always fill up to 6
  const seen = new Set<string>()
  const related: typeof allProducts = []
  for (const p of [
    ...allProducts.filter(p => p.id !== product.id && p.subcategory && p.subcategory === product.subcategory),
    ...allProducts.filter(p => p.id !== product.id && p.category === product.category && (!p.subcategory || p.subcategory !== product.subcategory)),
    ...allProducts.filter(p => p.id !== product.id && p.category !== product.category),
  ]) {
    if (!seen.has(p.id)) { seen.add(p.id); related.push(p) }
    if (related.length === 6) break
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: descEn || `${product.name} — wholesale supplier Indore`,
    image: product.imageUrl || 'https://www.vasutraders.com/logo.png',
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Vasu Traders' },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: `https://www.vasutraders.com/catalog/${product.id}`,
      priceCurrency: 'INR',
      ...(lowestPrice > 0 ? { price: lowestPrice } : {}),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Vasu Traders' },
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vasutraders.com' },
      { '@type': 'ListItem', position: 2, name: 'Catalog', item: 'https://www.vasutraders.com/catalog' },
      { '@type': 'ListItem', position: 3, name: product.name, item: `https://www.vasutraders.com/catalog/${product.id}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <style>{`
        @media (min-width: 640px) {
          .product-page-grid { grid-template-columns: 1fr 1fr !important; }
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 540px) {
          .related-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }
        @media (min-width: 900px) {
          .related-grid { grid-template-columns: repeat(6, 1fr); }
        }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', color: '#9ca3af', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <span>/</span>
          <Link href="/catalog" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>Catalog</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/catalog?category=${encodeURIComponent(product.category)}`} style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>
                {product.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: '#374151' }}>{product.name}</span>
        </nav>

        {/* ── Product main section ── */}
        <div className="product-page-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '24px' }}>

          {/* Image + bulk selector (client component — image updates on variant select) */}
          <ProductPageInteractive product={product} />

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Category badges */}
            {product.category && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ background: '#FEF2F2', color: '#B91C1C', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                  {product.category}
                </span>
                {product.subcategory && (
                  <span style={{ background: '#EFF6FF', color: '#1d4ed8', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
                    {product.subcategory}
                  </span>
                )}
              </div>
            )}

            {/* Name */}
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 6vw, 42px)', color: '#1a1a1a', lineHeight: 1.1, margin: 0 }}>
              {product.name}
            </h1>

            {/* Description */}
            {descEn && (
              <div style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.7 }}>
                {descEn.split('\n').map((line, i) => (
                  <p key={i} style={{ margin: i === 0 ? 0 : '4px 0 0' }}>{line}</p>
                ))}
              </div>
            )}
            {descHi && descHi !== descEn && (
              <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.7, fontFamily: 'sans-serif' }}>
                {descHi.split('\n').map((line, i) => (
                  <p key={i} style={{ margin: i === 0 ? 0 : '4px 0 0' }}>{line}</p>
                ))}
              </div>
            )}

            {/* Price */}
            <div style={{ background: '#FFF8F0', borderRadius: '12px', padding: '16px' }}>
              {lowestPrice > 0 ? (
                <>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#B91C1C', margin: 0, lineHeight: 1 }}>
                    ₹{lowestPrice.toFixed(0)}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
                    per {product.unit} · Min order: {product.minOrderQty} {product.unit}
                  </p>
                </>
              ) : (
                <p style={{ color: '#B91C1C', fontWeight: 800, fontSize: '15px', margin: 0 }}>
                  Call for price · Min order: {product.minOrderQty} {product.unit}
                </p>
              )}
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'd like to order ${product.name} (${product.minOrderQty}+ ${product.unit}) from Vasu Traders.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: '#25D366', color: '#fff', fontWeight: 800, fontSize: '15px',
                padding: '14px', borderRadius: '12px', textDecoration: 'none',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Order on WhatsApp
            </a>

          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', color: '#1a1a1a', margin: 0, letterSpacing: '1px' }}>
                  Related Products
                </h2>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0' }}>
                  More from {product.subcategory || product.category}
                </p>
              </div>
              <Link
                href={`/catalog?category=${encodeURIComponent(product.category)}`}
                style={{ color: '#B91C1C', fontWeight: 700, fontSize: '13px', textDecoration: 'none', flexShrink: 0 }}
              >
                View all →
              </Link>
            </div>

            <div className="related-grid">
              {related.map(p => (
                <RelatedProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
          <Link href="/catalog" style={{ color: '#B91C1C', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
            ← Back to Catalog
          </Link>
        </div>

      </div>
    </>
  )
}
