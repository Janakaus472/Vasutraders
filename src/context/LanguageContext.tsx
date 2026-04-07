'use client'

import { createContext, useContext, ReactNode } from 'react'

type Lang = 'en' | 'hi'

const translations = {
  en: {
    wholesaleCatalog: 'Wholesale Catalog',
    allProducts: 'All Products',
    products: 'Products',
    categories: 'Categories',
    browseBy: 'Browse By',
    category: 'Category',
    searchPlaceholder: 'Search products...',
    add: '+ Add',
    outOfStock: 'Out of Stock',
    callForPrice: 'Call for Price',
    per: 'per',
    buyOn: 'Buy on',
    myOrder: 'My Order',
    itemsAdded: 'items ready to send',
    viewOrder: 'View & Send on WhatsApp →',
    noProducts: 'No products found',
    categoryLabel: {
      'All': 'All',
      'Playing Cards': 'Playing Cards',
      'Party Balloons': 'Party Balloons',
      'Kanche & Glass Balls': 'Kanche & Glass Balls',
      'Sports & Games': 'Sports & Games',
      'Rubber Bands': 'Rubber Bands',
      'Spurs': 'Spurs',
      'Poker Chips': 'Poker Chips',
      'Toothbrushes': 'Toothbrushes',
      'Burnt Balls': 'Burnt Balls',
    },
    tagline: 'Playing Cards · Balloons · Rubber Bands · Sports · Kanche & more',
    homeCta: 'Browse Products',
    whatsappUs: 'WhatsApp Us',
    whyUs: 'Why Choose Us',
    yearsExp: 'Years Experience',
    customers: 'Happy Customers',
    ready: 'Ready to Order?',
    readyDesc: 'Browse our catalog and send your order on WhatsApp in seconds.',
  },
  hi: {
    wholesaleCatalog: 'थोक कैटलॉग',
    allProducts: 'सभी उत्पाद',
    products: 'उत्पाद',
    categories: 'श्रेणियाँ',
    browseBy: 'खोजें',
    category: 'श्रेणी',
    searchPlaceholder: 'उत्पाद खोजें...',
    add: '+ जोड़ें',
    outOfStock: 'स्टॉक खत्म',
    callForPrice: 'कीमत जानें',
    per: 'प्रति',
    buyOn: 'खरीदें',
    myOrder: 'मेरा ऑर्डर',
    itemsAdded: 'सामान जोड़े',
    viewOrder: 'व्हाट्सएप पर भेजें →',
    noProducts: 'कोई उत्पाद नहीं मिला',
    categoryLabel: {
      'All': 'सभी',
      'Playing Cards': 'ताश के पत्ते',
      'Party Balloons': 'पार्टी गुब्बारे',
      'Kanche & Glass Balls': 'कंचे',
      'Sports & Games': 'खेल सामग्री',
      'Rubber Bands': 'रबर बैंड',
      'Spurs': 'स्पर्स',
      'Poker Chips': 'पोकर चिप्स',
      'Toothbrushes': 'टूथब्रश',
      'Burnt Balls': 'बर्न्ट बॉल्स',
    },
    tagline: 'ताश · गुब्बारे · रबर बैंड · खेल सामग्री · कंचे और अधिक',
    homeCta: 'उत्पाद देखें',
    whatsappUs: 'व्हाट्सएप करें',
    whyUs: 'हमें क्यों चुनें',
    yearsExp: 'साल का अनुभव',
    customers: 'खुश ग्राहक',
    ready: 'ऑर्डर देने के लिए तैयार?',
    readyDesc: 'कैटलॉग देखें और व्हाट्सएप पर ऑर्डर भेजें।',
  },
}

type Translations = typeof translations.en
type CategoryKey = keyof Translations['categoryLabel']

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
  catLabel: (cat: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
  catLabel: (c) => c,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang: Lang = 'en'
  const t = translations.en
  const catLabel = (cat: string) => t.categoryLabel[cat as CategoryKey] || cat

  return (
    <LanguageContext.Provider value={{ lang, setLang: () => {}, t, catLabel }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
