export function ensureArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value

  if (typeof value === 'string') {
    try {
      let parsed = JSON.parse(value)
      if (typeof parsed === 'string') {
        // second parse if double-encoded
        parsed = JSON.parse(parsed)
      }
      console.log('Final parsed:', parsed)
      return Array.isArray(parsed) ? parsed : []
    } catch (err) {
      console.error('ensureArray JSON parse failed:', err)
      return []
    }
  }

  return []
}
