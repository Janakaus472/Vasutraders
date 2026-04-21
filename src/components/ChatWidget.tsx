'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '61410706812'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Namaste! 🙏 I'm your Vasu Traders assistant. Ask me about our products, ordering, or anything else!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [messages, open])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Sorry, something went wrong.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! Please try again or WhatsApp us directly.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating button — smaller on mobile */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Chat with us"
        className="chat-fab"
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '12px',
          zIndex: 1000,
          borderRadius: '50%',
          background: '#B91C1C',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(185,28,28,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(185,28,28,0.5)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(185,28,28,0.4)'
        }}
      >
        {open ? (
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '72px',
            right: '12px',
            zIndex: 999,
            width: 'min(320px, calc(100vw - 24px))',
            maxWidth: 'calc(100vw - 24px)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            border: '1px solid #e5e7eb',
            animation: 'chatSlideIn 0.25s ease',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #7f1d1d, #B91C1C)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(250,196,26,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
            }}>🛍️</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', lineHeight: 1.2 }}>Vasu Traders</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>Usually replies in seconds</div>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginLeft: 'auto',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '6px',
                padding: '5px 10px',
                color: '#FAC41A',
                fontSize: '11px',
                textDecoration: 'none',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.116 1.527 5.845L.057 23.18a.75.75 0 00.914.914l5.335-1.47A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.986 0-3.842-.549-5.424-1.504l-.388-.232-4.028 1.11 1.11-4.028-.232-.388A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              WhatsApp
            </a>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 14px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxHeight: 'min(320px, 50vh)',
            background: '#f9f9f9',
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '9px 13px',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: msg.role === 'user'
                    ? '#B91C1C'
                    : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#1a1a1a',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  border: msg.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content.replace(/\[[^\]]+\]\([^)]+\)/g, '').split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={j}>{part.slice(2, -2)}</strong>
                      : part
                  )}
                  {msg.role === 'assistant' && msg.content.includes('/catalog') && (
                    <a href="/catalog" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      marginTop: '8px', padding: '8px 14px', borderRadius: '10px',
                      background: '#B91C1C', color: '#fff', fontWeight: 700,
                      fontSize: '12px', textDecoration: 'none',
                    }}>📦 Browse Catalog</a>
                  )}
                  {msg.role === 'assistant' && msg.content.includes('/cart') && !msg.content.includes('/catalog') && (
                    <a href="/cart" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      marginTop: '8px', padding: '8px 14px', borderRadius: '10px',
                      background: '#B91C1C', color: '#fff', fontWeight: 700,
                      fontSize: '12px', textDecoration: 'none',
                    }}>🛒 Go to Cart</a>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '9px 16px',
                  borderRadius: '12px 12px 12px 4px',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#DC2626',
                      animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid #e5e7eb',
            background: '#fff',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything..."
              disabled={loading}
              style={{
                flex: 1,
                border: '1.5px solid #e5e7eb',
                borderRadius: '24px',
                padding: '8px 14px',
                fontSize: '13px',
                outline: 'none',
                background: '#f9f9f9',
                color: '#1a1a1a',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#DC2626')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: input.trim() && !loading
                  ? '#B91C1C'
                  : '#e5e7eb',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s',
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .chat-fab {
          width: 44px;
          height: 44px;
        }
        .chat-fab svg {
          width: 20px;
          height: 20px;
        }
        @media (min-width: 640px) {
          .chat-fab {
            width: 52px;
            height: 52px;
          }
          .chat-fab svg {
            width: 22px;
            height: 22px;
          }
        }
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}
