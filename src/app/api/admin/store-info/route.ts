import { NextRequest, NextResponse } from 'next/server'
import { getSetting, setSetting } from '@/lib/supabase/settings'

function isAdmin(req: NextRequest) {
  return req.cookies.get('vt_admin')?.value === '1'
}

export interface TeamMember {
  id: string
  name: string
  role: string
  imageUrl?: string
}

export interface StoreInfo {
  about_text_1: string
  about_text_1_hi: string
  about_text_2: string
  about_text_2_hi: string
  email: string
  phone: string
  address: string
  address_hi: string
  maps_url: string
  hours: string
  hours_hi: string
  gst_number: string
  established_year: string
  team: TeamMember[]
}

export const DEFAULT_STORE_INFO: StoreInfo = {
  about_text_1: 'Vasu Traders is a well-established wholesale supplier based in Indore, Madhya Pradesh, India. With over 20 years of experience, we have been serving retailers, shopkeepers, and businesses across Central India with a wide range of quality products at competitive wholesale prices.',
  about_text_1_hi: 'वासु ट्रेडर्स इंदौर, मध्य प्रदेश में स्थित एक भरोसेमंद थोक विक्रेता है। हम पिछले 20 से अधिक वर्षों से मध्य भारत के व्यापारियों और दुकानदारों को उच्च गुणवत्ता के उत्पाद थोक दाम पर उपलब्ध करा रहे हैं।',
  about_text_2: 'Our product range includes playing cards, poker chips, party balloons, rubber bands, sports goods, toothbrushes, and much more. We supply to retailers and wholesalers in Indore, Ujjain, Bhopal, and across Madhya Pradesh and Central India.',
  about_text_2_hi: 'हमारे उत्पादों में ताश के पत्ते, पोकर चिप्स, पार्टी गुब्बारे, रबर बैंड, खेल सामग्री, टूथब्रश और बहुत कुछ शामिल है।',
  email: '',
  phone: '',
  address: 'Indore, Madhya Pradesh, India',
  address_hi: 'इंदौर, मध्य प्रदेश, भारत',
  maps_url: '',
  hours: 'Mon – Sat: 10:00 AM – 7:00 PM',
  hours_hi: 'सोम – शनि: सुबह 10 बजे – शाम 7 बजे',
  gst_number: '',
  established_year: '2004',
  team: [],
}

export async function GET() {
  try {
    const info = await getSetting<StoreInfo>('store_info', DEFAULT_STORE_INFO)
    return NextResponse.json({ ...DEFAULT_STORE_INFO, ...info })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const info: StoreInfo = await req.json()
    await setSetting('store_info', info)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
