import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProduct, getProducts } from '@/lib/supabase/products'
import { getDescription, getProductSeo } from '@/lib/i18n'
import { CATEGORY_BG } from '@/components/catalog/marketplaceConfig'
import { toSlug } from '@/lib/categorySlug'
import ProductPageInteractive from './ProductPageInteractive'
import { Product } from '@/types/product'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Product Not Found | Vasu Traders' }

  const seo = getProductSeo(product.description)
  const descEn = getDescription(product.description, 'en').replace(/\n/g, ' ').trim()
  const title = seo.metaTitle || `${product.name} — Wholesale ${product.category} | Vasu Traders`
  const description = seo.metaDescription || descEn ||
    `Buy ${product.name} wholesale from Vasu Traders, Indore. ${product.category} supplier with bulk order options. Minimum order: ${product.minOrderQty} ${product.unit}.`
  const canonicalSlug = product.slug
  const canonicalUrl = `https://www.vasutraders.com/catalog/${canonicalSlug}`

  return {
    title,
    description,
    ...(seo.keywords?.length ? { keywords: seo.keywords } : {}),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'Vasu Traders',
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

export const revalidate = 3600

function RelatedProductCard({ product }: { product: Product }) {
  const imgBg = CATEGORY_BG[product.category] || 'linear-gradient(135deg,#f8f7f4,#efefed)'
  const descEn = getDescription(product.description, 'en')

  return (
    <Link
      href={`/catalog/${product.slug}`}
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
  const { slug } = await params

  const allProducts = await getProducts()

  // Try slug match first, then UUID match
  let product = allProducts.find(p => p.slug === slug)
  const foundBySlug = !!product
  if (!product) product = allProducts.find(p => p.id === slug)
  if (!product) notFound()

  // Redirect legacy UUID URLs to canonical slug URL (301)
  if (!foundBySlug && product.slug && product.slug !== slug) {
    redirect(`/catalog/${product.slug}`)
  }

  const descEn = getDescription(product.description, 'en')
  const lowestPrice = product.bulkVariants?.length
    ? Math.min(
        ...[product.pricePerUnit, ...product.bulkVariants.map(v => v.price ?? product.pricePerUnit)].filter(p => p > 0)
      )
    : product.pricePerUnit

  // Related products: same subcategory → same category → any other product, fill up to 6
  const seen = new Set<string>()
  const related: typeof allProducts = []
  for (const p of [
    ...allProducts.filter(p => p.id !== product!.id && p.subcategory && p.subcategory === product!.subcategory),
    ...allProducts.filter(p => p.id !== product!.id && p.category === product!.category && (!p.subcategory || p.subcategory !== product!.subcategory)),
    ...allProducts.filter(p => p.id !== product!.id && p.category !== product!.category),
  ]) {
    if (!seen.has(p.id)) { seen.add(p.id); related.push(p) }
    if (related.length === 6) break
  }

  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const allImages = [product.imageUrl, ...(product.galleryImages ?? [])].filter(Boolean) as string[]
  const variantPrices = (product.bulkVariants ?? []).map(v => v.price).filter((p): p is number => p !== null && p > 0)
  const allPrices = [product.pricePerUnit, ...variantPrices].filter(p => p > 0)
  const highPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0
  const canonicalUrl = `https://www.vasutraders.com/catalog/${product.slug}`

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: descEn || `${product.name} — wholesale supplier Indore`,
    image: allImages.length > 0 ? allImages : ['https://www.vasutraders.com/logo.png'],
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Vasu Traders' },
    category: product.category,
    url: canonicalUrl,
    offers: variantPrices.length > 0
      ? {
          '@type': 'AggregateOffer',
          url: canonicalUrl,
          priceCurrency: 'INR',
          lowPrice: lowestPrice > 0 ? lowestPrice : undefined,
          highPrice: highPrice > 0 ? highPrice : undefined,
          offerCount: 1 + variantPrices.length,
          availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          priceValidUntil,
          seller: { '@type': 'Organization', name: 'Vasu Traders' },
        }
      : {
          '@type': 'Offer',
          url: canonicalUrl,
          priceCurrency: 'INR',
          ...(lowestPrice > 0 ? { price: lowestPrice, priceValidUntil } : {}),
          availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@type': 'Organization', name: 'Vasu Traders' },
        },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vasutraders.com' },
      { '@type': 'ListItem', position: 2, name: 'Catalog', item: 'https://www.vasutraders.com/catalog' },
      ...(product.category ? [{ '@type': 'ListItem', position: 3, name: product.category, item: `https://www.vasutraders.com/catalog/c/${toSlug(product.category)}` }] : []),
      { '@type': 'ListItem', position: product.category ? 4 : 3, name: product.name, item: canonicalUrl },
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
              <Link href={`/catalog/c/${toSlug(product.category)}`} style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>
                {product.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: '#374151' }}>{product.name}</span>
        </nav>

        {/* Product main section */}
        <ProductPageInteractive product={product} />

        {/* Related products */}
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
                href={`/catalog/c/${toSlug(product.category)}`}
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
          <Link
            href={
              product.subcategory && product.category
                ? `/catalog/c/${toSlug(product.category)}/${toSlug(product.subcategory)}`
                : product.category
                  ? `/catalog/c/${toSlug(product.category)}`
                  : '/catalog'
            }
            style={{ color: '#B91C1C', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}
          >
            ← Back to {product.subcategory || product.category || 'Catalog'}
          </Link>
        </div>

      </div>
    </>
  )
}
