import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getEmbedding(text: string): Promise<number[] | null> {
  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) return null
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: text, model: 'text-embedding-ada-002' }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data[0].embedding
  } catch {
    return null
  }
}

export async function searchFaq(text: string): Promise<string | null> {
  const embedding = await getEmbedding(text)
  if (!embedding) return null
  try {
    const { data } = await getSupabase().rpc('match_faq', {
      query_embedding: embedding,
      match_threshold: 0.85,
      match_count: 1,
    })
    if (data && data.length > 0) return data[0].answer as string
  } catch (e) {
    console.warn('[faq-search]', e)
  }
  return null
}
