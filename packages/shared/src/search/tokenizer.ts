/*
  Simple, locale-aware tokenizer.
  - Uses Intl.Segmenter when available; falls back to Unicode regex.
  - Lowercases using locale rules.
  - Filters out tokens shorter than 2 characters by default.
*/

export type TokenizeOptions = {
  locale?: string
  minTokenLength?: number
}

export function tokenize(text: string, options: TokenizeOptions = {}): string[] {
  const locale = options.locale || 'en'
  const minLen = options.minTokenLength ?? 2

  if (!text) return []

  const norm = text.toLocaleLowerCase(locale)

  const tokens: string[] = []

  // Prefer Intl.Segmenter when available
  const Seg: any = (globalThis as any).Intl?.Segmenter
  if (Seg) {
    const segmenter = new Seg(locale, { granularity: 'word' })
    for (const seg of segmenter.segment(norm)) {
      // Some runtimes expose isWordLike; otherwise, filter with regex
      const s = String(seg.segment || '')
      const isWordLike = typeof seg.isWordLike === 'boolean' ? seg.isWordLike : /[\p{L}\p{N}]/u.test(s)
      if (isWordLike) {
        const clean = s.match(/[\p{L}\p{N}]+/gu)?.join('') || ''
        if (clean.length >= minLen) tokens.push(clean)
      }
    }
    return tokens
  }

  // Fallback regex-based tokenization (Unicode letters and numbers)
  const matches = norm.match(/[\p{L}\p{N}]+/gu) || []
  for (const m of matches) {
    if (m.length >= minLen) tokens.push(m)
  }
  return tokens
}
