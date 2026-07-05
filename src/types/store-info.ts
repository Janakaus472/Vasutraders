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
  about_text_1: 'Vasu Traders is one of India\'s top wholesale suppliers with over 20 years of experience. We serve retailers, shopkeepers, and businesses across India with a wide range of quality products at competitive wholesale prices.',
  about_text_1_hi: 'वासु ट्रेडर्स इंदौर, मध्य प्रदेश में स्थित एक भरोसेमंद थोक विक्रेता है। हम पिछले 20 से अधिक वर्षों से मध्य भारत के व्यापारियों और दुकानदारों को उच्च गुणवत्ता के उत्पाद थोक दाम पर उपलब्ध करा रहे हैं।',
  about_text_2: 'Our product range includes playing cards, poker chips, party balloons, rubber bands, sports goods, toothbrushes, and much more. We supply to retailers and wholesalers across India with pan-India delivery.',
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
