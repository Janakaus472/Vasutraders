import { Metadata } from 'next'
import { getSetting } from '@/lib/supabase/settings'
import { StoreInfo, DEFAULT_STORE_INFO } from '@/app/api/admin/store-info/route'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About Us | Vasu Traders',
  description: 'Learn about Vasu Traders — a trusted wholesale supplier in Indore, Madhya Pradesh with 20+ years of experience supplying playing cards, party balloons, sports goods and more.',
  alternates: { canonical: 'https://www.vasutraders.com/about' },
}

export const revalidate = 3600

export default async function AboutPage() {
  const storeInfo = await getSetting<StoreInfo>('store_info', DEFAULT_STORE_INFO).catch(() => DEFAULT_STORE_INFO)
  return <AboutClient storeInfo={{ ...DEFAULT_STORE_INFO, ...storeInfo }} />
}
