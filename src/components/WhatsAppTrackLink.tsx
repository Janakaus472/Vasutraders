'use client'

import { trackWaClick } from '@/lib/trackWaClick'

interface Props {
  href: string
  source: string
  context?: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export default function WhatsAppTrackLink({ href, source, context, className, style, children }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      onClick={() => trackWaClick(source, context)}
    >
      {children}
    </a>
  )
}
