import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/supabase/products'
import { getDescription } from '@/lib/i18n'

export const revalidate = 3600 // regenerate at most once per hour

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function GET() {
  const products = await getProducts()

  const items = products
    .filter(p => p.pricePerUnit > 0 && p.imageUrl) // Google requires price + image
    .map(p => {
      const descRaw = getDescription(p.description, 'en')
      const desc = descRaw
        ? descRaw.replace(/\n/g, ' ').trim().slice(0, 5000)
        : `${p.name} — wholesale supplier, Indore, Madhya Pradesh`

      const url = `https://www.vasutraders.com/catalog/${p.slug}`

      // Use lowest price across variants
      const variantPrices = (p.bulkVariants ?? [])
        .map(v => v.price)
        .filter((pr): pr is number => pr !== null && pr > 0)
      const lowestPrice = variantPrices.length
        ? Math.min(p.pricePerUnit, ...variantPrices)
        : p.pricePerUnit

      const productType = [p.category, p.subcategory].filter(Boolean).join(' > ')

      const extraImages = (p.galleryImages ?? [])
        .filter(Boolean)
        .slice(0, 9) // Google allows up to 10 images total (1 main + 9 extra)
        .map(img => `      <g:additional_image_link>${esc(img)}</g:additional_image_link>`)
        .join('\n')

      return `  <item>
      <g:id>${esc(p.id)}</g:id>
      <title>${esc(p.name)}</title>
      <description>${esc(desc)}</description>
      <link>${esc(url)}</link>
      <g:image_link>${esc(p.imageUrl)}</g:image_link>
${extraImages ? extraImages + '\n' : ''}      <g:availability>in_stock</g:availability>
      <g:price>${lowestPrice.toFixed(2)} INR</g:price>
      <g:brand>Vasu Traders</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
${productType ? `      <g:product_type>${esc(productType)}</g:product_type>\n` : ''}      <g:return_policy_label>returnpolicy</g:return_policy_label>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Vasu Traders</title>
    <link>https://www.vasutraders.com</link>
    <description>Wholesale supplier of playing cards, poker chips, party supplies, rubber bands, sports goods and more — Indore, Madhya Pradesh, India.</description>
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
