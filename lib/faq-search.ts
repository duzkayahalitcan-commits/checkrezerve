import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Türkçe stop words ─────────────────────────────────────────────────────────
const STOP = new Set([
  'bir', 've', 'ile', 'bu', 'da', 'de', 'ki', 'mi', 'mı', 'mu', 'mü',
  'için', 'daha', 'çok', 'en', 'nasıl', 'ne', 'neden', 'nerede', 'hangi',
  'kaç', 'var', 'yok', 'olan', 'ama', 'fakat', 'veya', 'ya', 'ben', 'sen',
  'biz', 'siz', 'onlar', 'benim', 'senin', 'bizim', 'gibi', 'kadar', 'her',
  'hiç', 'çünkü', 'ancak', 'ise', 'bile', 'ayrıca', 'hem', 'diğer',
])

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-zA-ZşçğüöıİŞÇĞÜÖ\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP.has(w))
  )
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  const intersection = [...a].filter(w => b.has(w)).length
  const union = new Set([...a, ...b]).size
  return intersection / union
}

// ── Kademe 1: Keyword match (ücretsiz) ───────────────────────────────────────
async function keywordSearch(text: string): Promise<string | null> {
  const { data, error } = await getSupabase()
    .from('faq')
    .select('question, answer')

  if (error || !data || data.length === 0) return null

  const userTokens = tokenize(text)
  let bestScore = 0
  let bestAnswer: string | null = null

  for (const row of data as { question: string; answer: string }[]) {
    const score = jaccardSimilarity(userTokens, tokenize(row.question))
    if (score > bestScore) {
      bestScore = score
      bestAnswer = row.answer
    }
  }

  if (bestScore >= 0.70) {
    console.log(`[faq] kademe-1 (keyword) hit — skor: ${bestScore.toFixed(2)}`)
    return bestAnswer
  }
  return null
}

// ── Kademe 2: Embedding search (düşük maliyet) ────────────────────────────────
async function getEmbedding(text: string): Promise<number[] | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: text, model: 'text-embedding-ada-002' }),
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data[0].embedding
  } catch {
    return null
  }
}

async function embeddingSearch(text: string): Promise<string | null> {
  const embedding = await getEmbedding(text)
  if (!embedding) return null
  try {
    const { data } = await getSupabase().rpc('match_faq', {
      query_embedding: embedding,
      match_threshold: 0.85,
      match_count: 1,
    })
    if (data && data.length > 0) {
      console.log(`[faq] kademe-2 (embedding) hit — benzerlik: ${data[0].similarity?.toFixed(3)}`)
      return data[0].answer as string
    }
  } catch (e) {
    console.warn('[faq] embedding search failed:', e)
  }
  return null
}

// ── Ana export: 3 kademe ──────────────────────────────────────────────────────
// null dönerse caller kademe-3 (Claude) uygular
export async function searchFaq(text: string): Promise<string | null> {
  const kw = await keywordSearch(text)
  if (kw) return kw

  const emb = await embeddingSearch(text)
  if (emb) return emb

  console.log('[faq] kademe-3 (Claude) devreye giriyor')
  return null
}
