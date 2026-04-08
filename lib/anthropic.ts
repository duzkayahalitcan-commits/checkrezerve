import Anthropic from '@anthropic-ai/sdk'

// Lazy singleton — API key sadece runtime'da gerekli, build'i kırmaz
let _client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (_client) return _client
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY env var is missing')
  _client = new Anthropic({ apiKey })
  return _client
}
