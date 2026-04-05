import { ReactNode } from 'react'

export const CATEGORY_BG: Record<string, string> = {
  'Playing Cards':        'linear-gradient(135deg, #fef3e2, #fde68a)',
  'Party Balloons':       'linear-gradient(135deg, #fce7f3, #fbcfe8)',
  'Kanche & Glass Balls': 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
  'Sports & Games':       'linear-gradient(135deg, #dcfce7, #bbf7d0)',
  'Rubber Bands':         'linear-gradient(135deg, #fef9c3, #fde047)',
  'Spurs':                'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
  'Poker Chips':          'linear-gradient(135deg, #fee2e2, #fecaca)',
  'Toothbrushes':         'linear-gradient(135deg, #d1fae5, #a7f3d0)',
  'Burnt Balls':          'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
}

export const LOGOS: Record<string, ReactNode> = {
  Amazon: (
    <svg viewBox="0 0 108 32" width="72" height="19" aria-label="Amazon">
      <text x="2" y="23" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="23" fill="#232F3E">amazon</text>
      <path d="M8 28 Q32 37 52 28" stroke="#FF9900" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      <path d="M50 25 L54 29.5 L47 29.5 Z" fill="#FF9900"/>
    </svg>
  ),
  Flipkart: (
    <svg viewBox="0 0 108 32" width="72" height="19" aria-label="Flipkart">
      <rect x="1" y="4" width="24" height="24" rx="4" fill="#FFE500"/>
      <text x="6" y="23" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="17" fill="#2874F0">F</text>
      <text x="30" y="23" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="16" fill="#2874F0">flipkart</text>
    </svg>
  ),
  IndiaMART: (
    <svg viewBox="0 0 120 32" width="80" height="19" aria-label="IndiaMART">
      <text x="2" y="22" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="14" fill="#53A318">india</text>
      <text x="44" y="22" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="14" fill="#F26522">MART</text>
      <rect x="2" y="25" width="40" height="2.5" rx="1" fill="#53A318"/>
      <rect x="44" y="25" width="38" height="2.5" rx="1" fill="#F26522"/>
    </svg>
  ),
}

export const MARKETPLACE_LINKS = [
  {
    name: 'Amazon' as const,
    color: '#FF9900',
    bg: '#fffbf2',
    border: '#FFE0A0',
    url: (name: string) => `https://www.amazon.in/s?k=${encodeURIComponent(name)}`,
  },
  {
    name: 'Flipkart' as const,
    color: '#2874F0',
    bg: '#f0f6ff',
    border: '#b3d0ff',
    url: (name: string) => `https://www.flipkart.com/search?q=${encodeURIComponent(name)}`,
  },
  {
    name: 'IndiaMART' as const,
    color: '#53A318',
    bg: '#f2fbea',
    border: '#b8e699',
    url: (name: string) => `https://www.indiamart.com/search.mp?ss=${encodeURIComponent(name)}`,
  },
]
