'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, X, Phone, Calendar, ChevronDown, Tag, Star, Save } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

type Guest = {
  id?: string
  name: string
  phone: string | null
  email?: string | null
  notes?: string | null
  total_visits?: number
  total_spent?: number
  last_visit_date?: string | null
  visits?: number
  lastVisit?: string
}

type Tag = {
  id: string
  name: string
  color: string
}

const TAG_COLORS: Record<string, string> = {
  vip: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  'big spender': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'black list': 'bg-red-500/15 text-red-400 border-red-500/25',
  'lost customer': 'bg-stone-500/15 text-stone-400 border-stone-500/25',
  regular: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'new customer': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
}

function getTagStyle(name: string) {
  const key = name.toLowerCase()
  return TAG_COLORS[key] ?? 'bg-stone-700/50 text-stone-400 border-stone-600'
}

// S4-T2: Misafir aktivitesini sunucu endpoint'i üzerinden logla (service-role)
async function logActivity(guestId: string, activity_type: string, description: string) {
  try {
    await fetch('/api/panel/guest-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest_id: guestId, activity_type, description }),
    })
  } catch {
    // Loglama ana akışı bozmasın
  }
}

export default function MisafirList({
  guests,
  tags,
  guestTagsMap,
  locale,
  restaurantId,
}: {
  guests: Guest[]
  tags: Tag[]
  guestTagsMap: Record<string, string[]>
  locale: string
  restaurantId: string
}) {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [guestTags, setGuestTags] = useState<Record<string, string[]>>(guestTagsMap)
  const [segmentFilter, setSegmentFilter] = useState('Tümü')
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const SEGMENTS = ['Tümü', 'VIP', 'Big Spender', 'Black List', 'Regular', 'Lost Customer']

  const filtered = useMemo(() => {
    let list = guests
    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.phone?.includes(q)
      )
    }
    // Segment filter
    if (segmentFilter !== 'Tümü') {
      const tagName = segmentFilter.toLowerCase()
      list = list.filter(g => g.id && (guestTags[g.id] ?? []).map(t => t.toLowerCase()).includes(tagName))
    }
    return list
  }, [guests, search, segmentFilter, guestTags])

  async function toggleTag(guestId: string, tagName: string) {
    const tag = tags.find(t => t.name === tagName)
    if (!tag) return

    const current = guestTags[guestId] ?? []
    const hasTag = current.includes(tagName)

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      if (hasTag) {
        await client.from('guest_tag_assignments').delete().match({ guest_id: guestId, tag_id: tag.id })
        setGuestTags(prev => ({ ...prev, [guestId]: current.filter(t => t !== tagName) }))
      } else {
        await client.from('guest_tag_assignments').insert({ guest_id: guestId, tag_id: tag.id })
        setGuestTags(prev => ({ ...prev, [guestId]: [...current, tagName] }))
      }
      void logActivity(guestId, 'tag_change', `${hasTag ? 'Etiket kaldırıldı' : 'Etiket eklendi'}: ${tagName}`)
      toast.show(hasTag ? 'Etiket kaldırıldı' : 'Etiket eklendi', 'success')
    } catch {
      toast.show('Güncellenemedi', 'error')
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="İsim veya telefon ara..."
          className="w-full pl-9 pr-4 py-2 bg-stone-900 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Segment filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {SEGMENTS.map(seg => (
          <button
            key={seg}
            onClick={() => setSegmentFilter(seg)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              segmentFilter === seg
                ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-500'
            }`}
          >
            {seg}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-stone-900/50 border border-stone-800 rounded-2xl">
          <div className="text-4xl mb-3">👤</div>
          <p className="text-stone-400 font-semibold">Misafir bulunamadı</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((guest, i) => {
            const isSelected = selectedGuest?.phone === guest.phone
            return (
              <motion.div
                key={guest.phone ?? guest.name + i}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${
                  isSelected ? 'bg-amber-500/8 border-amber-500/30' : 'bg-stone-900 border-stone-800 hover:border-stone-600'
                }`}
              >
                <div onClick={() => setSelectedGuest(isSelected ? null : guest)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">{guest.name}</span>
                        {/* Tags */}
                        {guest.id && (guestTags[guest.id] ?? []).map(tagName => (
                          <span key={tagName} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getTagStyle(tagName)}`}>
                            {tagName}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-stone-500">
                        {guest.phone && (
                          <a href={`tel:${guest.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                            <Phone size={11} /> {guest.phone}
                          </a>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {guest.total_visits ?? guest.visits ?? 0} ziyaret
                        </span>
                        {(guest.last_visit_date ?? guest.lastVisit) && (
                          <span>Son: {new Date((guest.last_visit_date ?? guest.lastVisit)! + 'T12:00').toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>
                        )}
                        {(guest.total_spent ?? 0) > 0 && (
                          <span className="text-emerald-400 font-medium">{Number(guest.total_spent).toLocaleString(locale)} ₺</span>
                        )}
                      </div>
                    </div>
                    <ChevronDown size={14} className={`text-stone-500 transition-transform mt-1 ${isSelected ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded: guest detail + tags + notes */}
                <AnimatePresence>
                  {isSelected && guest.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-stone-800 space-y-4">
                        {/* Tag management */}
                        <div>
                          <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mb-2">Segmentasyon</p>
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map(tag => {
                              const hasTag = (guestTags[guest.id!] ?? []).includes(tag.name)
                              return (
                                <button
                                  key={tag.id}
                                  onClick={() => toggleTag(guest.id!, tag.name)}
                                  className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all ${
                                    hasTag
                                      ? getTagStyle(tag.name)
                                      : 'bg-stone-800 text-stone-500 border-stone-700 hover:border-stone-500'
                                  }`}
                                >
                                  {hasTag && '✓ '}{tag.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Guest notes */}
                        <div>
                          <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mb-2">Notlar</p>
                          <textarea
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            placeholder="Misafir hakkında not..."
                            rows={3}
                            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                          />
                          <button
                            onClick={async () => {
                              if (!guest.id || !noteText.trim()) return
                              setSavingNote(true)
                              try {
                                const { createClient } = await import('@supabase/supabase-js')
                                const client = createClient(
                                  process.env.NEXT_PUBLIC_SUPABASE_URL!,
                                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                                )
                                const { error } = await client.from('guests').update({ notes: noteText.trim() }).eq('id', guest.id)
                                if (error) throw error
                                void logActivity(guest.id, 'note', `Not güncellendi: ${noteText.trim().slice(0, 80)}`)
                                toast.show('Not kaydedildi', 'success')
                              } catch {
                                toast.show('Kaydedilemedi', 'error')
                              } finally {
                                setSavingNote(false)
                              }
                            }}
                            disabled={savingNote || !noteText.trim()}
                            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-semibold hover:bg-amber-500/25 transition-colors disabled:opacity-40"
                          >
                            <Save size={12} />
                            {savingNote ? 'Kaydediliyor...' : 'Kaydet'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
