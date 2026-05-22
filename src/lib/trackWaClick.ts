export function trackWaClick(source: string, context?: string) {
  fetch('/api/whatsapp-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, context }),
  }).catch(() => {})
}
