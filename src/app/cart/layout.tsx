import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Order',
  description: 'Review your wholesale order from Vasu Traders.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
