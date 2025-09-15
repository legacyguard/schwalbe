import { createHmac } from 'crypto'

let cachedSalt: string | undefined

export function getSearchSalt(envName = 'SEARCH_INDEX_SALT'): string {
  if (cachedSalt) return cachedSalt
  const salt = process.env[envName]
  if (!salt) {
    throw new Error('SEARCH_INDEX_SALT is not set. This module must run on the server with a configured salt.')
  }
  cachedSalt = salt
  return salt
}

export function hmacSha256Hex(input: string, salt?: string): string {
  const key = salt ?? getSearchSalt()
  return createHmac('sha256', key).update(input, 'utf8').digest('hex')
}

export function hashTokens(tokens: string[], salt?: string): string[] {
  return tokens.map((t) => hmacSha256Hex(t, salt))
}
