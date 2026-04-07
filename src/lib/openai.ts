'use client'

interface ProductDescription {
  en: string
  hi: string
}

export async function generateProductDescription(
  productName: string,
  category: string,
  unit: string
): Promise<ProductDescription> {
  const apiKey = process.env.OPENROUTER_API_KEY
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://vasu-traders.vercel.app',
      'X-Title': 'Vasu Traders',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a marketing expert for a wholesale grocery & provisions shop in India. Generate product descriptions in both English and Hindi.',
        },
        {
          role: 'user',
          content: `Generate product descriptions for "${productName}" (${category}, sold per ${unit}). Output format:\nEN: [English description max 100 chars]\nHI: [Hindi description max 100 chars]`,
        },
      ],
      temperature: 0.7,
    }),
  })

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''
  
  const enMatch = text.match(/EN:?\s*(.+)/i)
  const hiMatch = text.match(/HI:?\s*(.+)/i)
  
  return {
    en: enMatch?.[1]?.slice(0, 100) || `${productName} - Premium ${category}`,
    hi: hiMatch?.[1]?.slice(0, 100) || `${productName} - प्रीमियम ${category}`,
  }
}

interface OrderAnalytics {
  summary: string
  priority: 'low' | 'medium' | 'high'
  suggestedStatus: string
}

export async function analyzeOrder(
  shopName: string,
  items: { name: string; quantity: number; unit: string }[],
  locality: string
): Promise<OrderAnalytics> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const itemsText = items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ')
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://vasu-traders.vercel.app',
      'X-Title': 'Vasu Traders',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are an order analyst for a wholesale shop. Analyze orders and suggest priority.',
        },
        {
          role: 'user',
          content: `Analyze: Shop: ${shopName}, Location: ${locality}, Items: ${itemsText}. Reply with: PRIORITY:low/medium/high | STATUS:pending/confirmed | SUMMARY: brief note`,
        },
      ],
      temperature: 0.3,
    }),
  })

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''
  
  const priority = text.toLowerCase().includes('high') ? 'high' : text.toLowerCase().includes('low') ? 'low' : 'medium'
  const status = text.toLowerCase().includes('confirm') ? 'confirmed' : 'pending'
  const summary = text.match(/SUMMARY:?\s*(.+)/i)?.[1] || 'Order received'
  
  return { priority, suggestedStatus: status, summary }
}

export async function generateSEOKeywords(
  products: { name: string; category: string }[]
): Promise<string[]> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const productList = products.map(p => `${p.name} (${p.category})`).join(', ')
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://vasu-traders.vercel.app',
      'X-Title': 'Vasu Traders',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Generate SEO keywords for a wholesale grocery shop in India.',
        },
        {
          role: 'user',
          content: `Generate 10 SEO keywords: ${productList}`,
        },
      ],
      temperature: 0.5,
    }),
  })

  const data = await response.json()
  const text = data.choices[0]?.message?.content || ''
  return text.split('\n').map((k: string) => k.replace(/^[0-9.] /, '').trim()).filter(Boolean).slice(0, 10)
}