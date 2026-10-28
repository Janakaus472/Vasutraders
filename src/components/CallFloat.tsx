'use client'

import { BULK_ORDER_PHONE } from '@/lib/constants'

export default function CallFloat() {
  const number = BULK_ORDER_PHONE

  return (
    <>
      <style>{`
        .call-float {
          position: fixed;
          bottom: 84px;
          right: 20px;
          z-index: 999;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #1a1a2e;
          color: #fff;
          border-radius: 50px;
          padding: 12px 18px 12px 14px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          white-space: nowrap;
        }
        .call-float:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(0, 0, 0, 0.4); }
        .call-float:active { transform: scale(0.97); }
        @media (max-width: 480px) {
          .call-float { padding: 12px 14px; border-radius: 50%; }
          .call-float-label { display: none; }
        }
      `}</style>
      <a href={`tel:${number}`} className="call-float" aria-label="Call us for bulk orders">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="white" style={{ flexShrink: 0 }}>
          <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/>
        </svg>
        <span className="call-float-label">Call for Bulk Orders</span>
      </a>
    </>
  )
}
