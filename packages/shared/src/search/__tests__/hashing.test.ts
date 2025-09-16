import { tokenize } from '../tokenizer'
import { buildTokenStats } from '../ingest'
import { hmacSha256Hex } from '../hash'

describe('tokenization', () => {
  test('basic english tokenization removes punctuation and lowercases', () => {
    const t = tokenize("Hello, world! It's 2025-09-15.", { locale: 'en' })
    expect(t).toEqual(expect.arrayContaining(['hello', 'world']))
    expect(t.join(' ')).not.toMatch(/[!,.'-]/)
  })

  test('min token length filters short tokens', () => {
    const t = tokenize('a an and to be', { locale: 'en', minTokenLength: 2 })
    expect(t).toEqual(expect.arrayContaining(['an', 'and', 'to', 'be']))
    expect(t).not.toContain('a')
  })
  test('token positions are recorded correctly', () => {
    const stats = buildTokenStats('Alpha beta, alpha beta beta.', 'en')
    const alpha = stats.find(s => s.token === 'alpha')
    const beta = stats.find(s => s.token === 'beta')
    expect(alpha?.positions).toEqual([0, 2])
    expect(beta?.positions).toEqual([1, 3, 4])
    expect(alpha?.freq).toBe(2)
    expect(beta?.freq).toBe(3)
  })
})

describe('hashing', () => {
  test('same salt yields deterministic hash', () => {
    const h1 = hmacSha256Hex('hello', 'test_salt')
    const h2 = hmacSha256Hex('hello', 'test_salt')
    expect(h1).toBe(h2)
  })

  test('different salts yield different hashes', () => {
    const h1 = hmacSha256Hex('hello', 'salt_one')
    const h2 = hmacSha256Hex('hello', 'salt_two')
    expect(h1).not.toBe(h2)
  })
})
