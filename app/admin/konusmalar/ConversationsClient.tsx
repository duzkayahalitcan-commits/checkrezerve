'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Volume2, Check } from 'lucide-react'

interface Conversation {
  id: string
  restaurant_id: string
  session_id: string
  turn_number: number
  channel: string
  user_message: string
  assistant_response: string
  response_source: string
  voice_id: string | null
  created_at: string
  restaurants: { name: string } | null
}

interface Props {
  initialConversations: Conversation[]
  restaurants: { id: string; name: string }[]
}

export default function ConversationsClient({ initialConversations, restaurants }: Props) {
  const [filterRestaurant, setFilterRestaurant] = useState<string>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [cachingId, setCachingId] = useState<string | null>(null)
  const [cachedIds, setCachedIds] = useState<Set<string>>(new Set())

  const filtered = initialConversations.filter(c => {
    if (filterRestaurant !== 'all' && c.restaurant_id !== filterRestaurant) return false
    if (filterSource === 'ai' && c.response_source !== 'ai') return false
    if (filterSource === 'cache_concat' && c.response_source !== 'cache' && c.response_source !== 'concat') return false
    return true
  })

  const toggleExpand = (id: string) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpanded(next)
  }

  const handleCache = async (conv: Conversation) => {
    setCachingId(conv.id)
    try {
      const res = await fetch('/api/admin/cache-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conv.id,
          text: conv.assistant_response,
        }),
      })
      if (res.ok) {
        setCachedIds(prev => new Set(prev).add(conv.id))
      }
    } catch (e) {
      console.error('Cache failed:', e)
    } finally {
      setCachingId(null)
    }
  }

  const sourceBadge = (source: string) => {
    switch (source) {
      case 'ai':
        return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/15 text-purple-400 border border-purple-500/20">AI</span>
      case 'concat':
        return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/15 text-green-400 border border-green-500/20">Concat</span>
      case 'cache':
        return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">Cache</span>
      default:
        return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-500/15 text-stone-400 border border-stone-500/20">{source}</span>
    }
  }

  const channelIcon = (ch: string) => {
    switch (ch) {
      case 'web_voice': return '🎤'
      case 'app_voice': return '🎤'
      case 'web_chat': return '💬'
      case 'app_chat': return '💬'
      default: return '💬'
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={filterRestaurant}
          onChange={e => setFilterRestaurant(e.target.value)}
          className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-300"
        >
          <option value="all">Tüm İşletmeler</option>
          {restaurants.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <div className="flex gap-1 bg-stone-800 rounded-lg p-1">
          <button
            onClick={() => setFilterSource('all')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              filterSource === 'all' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilterSource('ai')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              filterSource === 'ai' ? 'bg-purple-600 text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            AI Cevaplananlar
          </button>
          <button
            onClick={() => setFilterSource('cache_concat')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              filterSource === 'cache_concat' ? 'bg-green-600 text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            Cache/Concat
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-stone-500 text-center py-8">Henüz konuşma kaydı bulunamadı.</p>
        )}

        {filtered.map(conv => (
          <div
            key={conv.id}
            className="rounded-xl border border-white/5 bg-white/3 overflow-hidden"
          >
            {/* Summary row */}
            <button
              onClick={() => toggleExpand(conv.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
            >
              <span className="text-stone-500 shrink-0">
                {expanded.has(conv.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
              <span className="text-xs text-stone-400 font-mono shrink-0">
                #{conv.id.slice(0, 4)}
              </span>
              <span className="text-sm text-white truncate">
                {conv.restaurants?.name ?? '—'}
              </span>
              <span className="text-xs text-stone-500 shrink-0">
                {channelIcon(conv.channel)}
              </span>
              <span className="text-xs text-stone-500 shrink-0">
                {new Date(conv.created_at).toLocaleString('tr-TR', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </span>
              <span className="ml-auto shrink-0">{sourceBadge(conv.response_source)}</span>
            </button>

            {/* Expanded details */}
            {expanded.has(conv.id) && (
              <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3">
                <div>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Kullanıcı</p>
                  <p className="text-sm text-white bg-stone-800/50 rounded-lg px-3 py-2">{conv.user_message}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Asistan</p>
                  <p className="text-sm text-emerald-300 bg-stone-800/50 rounded-lg px-3 py-2">{conv.assistant_response}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-stone-500">
                    <span>Oturum: <span className="font-mono text-stone-400">{conv.session_id.slice(0, 8)}...</span></span>
                    <span>Tur: {conv.turn_number}</span>
                    <span>Kanal: {conv.channel}</span>
                  </div>

                  {/* Cache button for AI responses */}
                  {conv.response_source === 'ai' && !cachedIds.has(conv.id) && (
                    <button
                      onClick={() => handleCache(conv)}
                      disabled={cachingId === conv.id}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
                    >
                      <Volume2 size={10} />
                      {cachingId === conv.id ? 'Kaydediliyor...' : "Cache'e Ekle"}
                    </button>
                  )}

                  {cachedIds.has(conv.id) && (
                    <span className="flex items-center gap-1 text-[10px] text-green-400">
                      <Check size={10} /> Cache'e kaydedildi
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-stone-600 text-center mt-6">
        {filtered.length} kayıt gösteriliyor
        {filterRestaurant !== 'all' && ' (filtreli)'}
      </p>
    </div>
  )
}
