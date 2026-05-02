export function getDescription(description: string | undefined, lang: 'en' | 'hi'): string {
  if (!description) return ''

  try {
    const parsed = JSON.parse(description)
    if (parsed && (parsed.en || parsed.hi)) {
      if (lang === 'hi') return parsed.hi || parsed.en || ''
      return parsed.en || parsed.hi || ''
    }
  } catch {
    // Not JSON, return as-is
  }

  return description
}

export function isBilingualDescription(description: string | undefined): boolean {
  if (!description) return false
  try {
    const parsed = JSON.parse(description)
    return !!(parsed.en && parsed.hi)
  } catch {
    return false
  }
}