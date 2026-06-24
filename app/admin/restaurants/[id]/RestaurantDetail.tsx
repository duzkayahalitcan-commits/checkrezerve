'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, X, ToggleRight, ToggleLeft } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { getRoleLabel } from '@/lib/roles'

type Restaurant = {
  id: string
  name: string
  slug: string
  phone?: string | null
  address?: string | null
  capacity?: number | null
  business_type?: string | null
  is_active?: boolean
  is_verified?: boolean
  created_at?: string
}

type FeatureFlag = {
  id: string
  restaurant_id: string
  feature: string
  enabled: boolean
}

type User = {
  id: string
  username: string
  role: string
  is_active: boolean
  created_at?: string
}

type Subscription = {
  id: string
  restaurant_id: string
  plan: string
  status: string
  billing_period?: string
  current_period_end?: string
  created_at?: string
}

type Reservation = {
  id: string
  customer_name?: string
  date?: string
  time?: string
  party_size?: number
  status?: string
  created_at?: string
}

const FEATURES = [
  { key: 'floor_plan', label: 'Masa Krokisi', desc: 'Müşteri rezervasyonda masa seçebilir' },
  { key: 'crm', label: 'Misafir CRM', desc: 'Müşteri profilleri ve segmentasyon' },
  { key: 'analytics', label: 'Gelir Analizi', desc: 'Detaylı raporlar ve grafikler' },
  { key: 'whatsapp', label: 'WhatsApp Entegrasyonu', desc: 'Otomatik mesaj gönderimi' },
  { key: 'multi_branch', label: 'Çoklu Şube', desc: 'Birden fazla lokasyon yönetimi' },
]

const PLANS = ['starter', 'pro', 'enterprise']

async function apiCall(method: string, url: string, body: object) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }
  return res.json()
}

export default function RestaurantDetail({
  restaurant,
  featureFlags,
  users,
  subscription,
  recentReservations,
  stats,
}: {
  restaurant: Restaurant
  featureFlags: FeatureFlag[]
  users: User[]
  subscription: Subscription | null
  recentReservations: Reservation[]
  stats: { calisanlarCount: number; hizmetlerCount: number; totalReservations: number }
}) {
  const router = useRouter()
  const toast = useToast()

  const [isActive, setIsActive] = useState(restaurant.is_active ?? true)
  const [isVerified, setIsVerified] = useState(restaurant.is_verified ?? false)
  const [flags, setFlags] = useState<Record<string, boolean>>(
    Object.fromEntries(featureFlags.map(f => [f.feature, f.enabled]))
  )
  const [selectedPlan, setSelectedPlan] = useState(subscription?.plan ?? 'starter')
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'business_manager' })

  // ─── Toggle işletme aktif/pasif ───
  async function toggleActive() {
    const newVal = !isActive
    try {
      await apiCall('PATCH', '/api/admin/restaurant', { id: restaurant.id, is_active: newVal })
      setIsActive(newVal)
      toast.show(newVal ? 'İşletme aktif edildi' : 'İşletme pasif edildi', 'success')
    } catch {
      toast.show('Güncellenemedi', 'error')
    }
  }

  // ─── Onayla / Reddet işlemleri ───
  async function verifyRestaurant() {
    try {
      await apiCall('PATCH', '/api/admin/restaurant', { id: restaurant.id, is_verified: true, is_active: true })
      setIsVerified(true)
      setIsActive(true)
      toast.show('İşletme onaylandı', 'success')
    } catch {
      toast.show('Onaylanamadı', 'error')
    }
  }

  async function rejectRestaurant() {
    try {
      await apiCall('PATCH', '/api/admin/restaurant', { id: restaurant.id, is_active: false })
      setIsActive(false)
      toast.show('İşletme reddedildi', 'success')
    } catch {
      toast.show('İşlem başarısız', 'error')
    }
  }

  // ─── Feature flag toggle ───
  async function toggleFlag(feature: string) {
    const newVal = !(flags[feature] ?? false)
    setFlags(prev => ({ ...prev, [feature]: newVal }))
    try {
      await apiCall('POST', '/api/admin/feature-flags', { restaurant_id: restaurant.id, feature, enabled: newVal })
      toast.show(newVal ? 'Özellik aktif edildi' : 'Özellik pasif edildi', 'success')
    } catch {
      setFlags(prev => ({ ...prev, [feature]: !newVal }))
      toast.show('Güncellenemedi', 'error')
    }
  }

  // ─── Plan değiştir ───
  async function savePlan() {
    try {
      await apiCall('PATCH', '/api/admin/restaurant', { id: restaurant.id, plan: selectedPlan })
      toast.show('Plan güncellendi', 'success')
    } catch {
      toast.show('Plan güncellenemedi', 'error')
    }
  }

  // ─── Kullanıcı ekle ───
  async function addUser() {
    if (!newUser.username.trim() || newUser.password.length < 8) {
      toast.show('Kullanıcı adı ve en az 8 karakter şifre gerekli', 'error')
      return
    }
    try {
      const res = await fetch('/api/admin/restaurant-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          username: newUser.username.trim(),
          password: newUser.password,
          role: newUser.role,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Başarısız')
      }
      toast.show('Kullanıcı eklendi', 'success')
      setNewUser({ username: '', password: '', role: 'business_manager' })
      router.refresh()
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Eklenemedi', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs text-stone-500 hover:text-amber-400 transition-colors">
              ← Admin
            </Link>
            <h1 className="text-base font-bold text-white">{restaurant.name}</h1>
            <span className="text-xs text-stone-600">/{restaurant.slug}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">

        {/* ═══ Bölüm 1 — Genel Bilgiler ═══ */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Genel Bilgiler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-stone-500 text-xs">İşletme Adı</span>
              <p className="text-white font-medium">{restaurant.name}</p>
            </div>
            <div>
              <span className="text-stone-500 text-xs">Slug</span>
              <p className="text-stone-300 font-mono">/{restaurant.slug}</p>
            </div>
            <div>
              <span className="text-stone-500 text-xs">Adres</span>
              <p className="text-stone-300">{restaurant.address ?? '—'}</p>
            </div>
            <div>
              <span className="text-stone-500 text-xs">Telefon</span>
              <p className="text-stone-300">{restaurant.phone ?? '—'}</p>
            </div>
            <div>
              <span className="text-stone-500 text-xs">Tip</span>
              <p className="text-stone-300">{restaurant.business_type ?? '—'}</p>
            </div>
            <div>
              <span className="text-stone-500 text-xs">Kapasite</span>
              <p className="text-stone-300">{restaurant.capacity ?? '—'}</p>
            </div>
            <div>
              <span className="text-stone-500 text-xs">Oluşturulma</span>
              <p className="text-stone-300">{restaurant.created_at ? new Date(restaurant.created_at).toLocaleDateString('tr-TR') : '—'}</p>
            </div>
            <div>
              <span className="text-stone-500 text-xs">Durum</span>
              <button
                onClick={toggleActive}
                className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-red-400 hover:text-red-300'
                }`}
              >
                {isActive ? <><Check size={14} /> Aktif</> : <><X size={14} /> Pasif</>}
              </button>
            </div>
            <div>
              <span className="text-stone-500 text-xs">Doğrulama</span>
              <p className={`text-sm font-medium ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isVerified ? '✓ Onaylı' : 'Onay Bekliyor'}
              </p>
            </div>
          </div>
          {!isVerified && (
            <div className="flex gap-3 mt-5 pt-4 border-t border-stone-800">
              <button
                onClick={verifyRestaurant}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/30 transition-colors"
              >
                <Check size={14} /> Onayla
              </button>
              <button
                onClick={rejectRestaurant}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/15 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-colors"
              >
                <X size={14} /> Reddet
              </button>
            </div>
          )}
        </section>

        {/* ═══ Bölüm 2 — Abonelik ═══ */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Abonelik</h2>
          {subscription ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-stone-500 text-xs">Plan</span>
                  <p className="text-white font-medium capitalize">{subscription.plan}</p>
                </div>
                <div>
                  <span className="text-stone-500 text-xs">Durum</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    subscription.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' :
                    subscription.status === 'trialing' ? 'bg-blue-500/15 text-blue-400' :
                    'bg-red-500/15 text-red-400'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 text-xs">Dönem</span>
                  <p className="text-stone-300">{subscription.billing_period === 'yearly' ? 'Yıllık' : 'Aylık'}</p>
                </div>
                <div>
                  <span className="text-stone-500 text-xs">Periyot Sonu</span>
                  <p className="text-stone-300">
                    {subscription.current_period_end
                      ? new Date(subscription.current_period_end).toLocaleDateString('tr-TR')
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-stone-500 text-sm">Abonelik bulunmuyor</p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <select
              value={selectedPlan}
              onChange={e => setSelectedPlan(e.target.value)}
              className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {PLANS.map(p => (
                <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={savePlan}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors"
            >
              Planı Değiştir
            </button>
          </div>
        </section>

        {/* ═══ Bölüm 3 — Feature Flags ═══ */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Özellikler</h2>
          <div className="space-y-2">
            {FEATURES.map(f => {
              const enabled = flags[f.key] ?? false
              return (
                <div key={f.key} className="flex items-center justify-between bg-stone-800/50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{f.label}</p>
                    <p className="text-xs text-stone-500">{f.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleFlag(f.key)}
                    className={`p-2 rounded-lg transition-colors ${
                      enabled ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-stone-500 hover:text-white hover:bg-stone-800'
                    }`}
                  >
                    {enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* ═══ Bölüm 4 — Panel Kullanıcıları ═══ */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Panel Kullanıcıları</h2>

          {/* Kullanıcı listesi */}
          {users.length > 0 ? (
            <div className="space-y-2 mb-4">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between bg-stone-800/50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center text-xs font-bold text-white">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{u.username}</p>
                      <span className="inline-block text-[10px] font-medium text-stone-400 bg-stone-700/50 px-1.5 py-0.5 rounded">
                        {getRoleLabel(u.role)}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${u.is_active ? 'text-emerald-400' : 'text-stone-600'}`}>
                    {u.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-sm mb-4">Henüz kullanıcı yok</p>
          )}

          {/* Kullanıcı ekle formu */}
          <div className="bg-stone-800/30 border border-stone-700/50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Manager Ekle</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={newUser.username}
                onChange={e => setNewUser(f => ({ ...f, username: e.target.value }))}
                placeholder="Kullanıcı adı"
                className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
              <input
                value={newUser.password}
                onChange={e => setNewUser(f => ({ ...f, password: e.target.value }))}
                type="password"
                placeholder="Şifre (en az 8 karakter)"
                className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
              <select
                value={newUser.role}
                onChange={e => setNewUser(f => ({ ...f, role: e.target.value }))}
                className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="business_owner">Sahip</option>
                <option value="business_manager">Yönetici</option>
              </select>
              <button
                onClick={addUser}
                disabled={!newUser.username.trim() || newUser.password.length < 8}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Ekle
              </button>
            </div>
          </div>
        </section>

        {/* ═══ Bölüm 5 — Özet İstatistikler ═══ */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">İstatistikler</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-stone-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.totalReservations}</p>
              <p className="text-xs text-stone-500 mt-1">Toplam Rezervasyon</p>
            </div>
            <div className="bg-stone-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.calisanlarCount}</p>
              <p className="text-xs text-stone-500 mt-1">Çalışan</p>
            </div>
            <div className="bg-stone-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.hizmetlerCount}</p>
              <p className="text-xs text-stone-500 mt-1">Hizmet</p>
            </div>
          </div>

          {/* Son 10 rezervasyon */}
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Son 10 Rezervasyon</h3>
          {recentReservations.length > 0 ? (
            <div className="space-y-1.5">
              {recentReservations.map(r => (
                <div key={r.id} className="flex items-center justify-between bg-stone-800/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white font-medium">{r.customer_name ?? 'İsimsiz'}</span>
                    <span className="text-xs text-stone-500">{r.date} {r.time}</span>
                    {r.party_size && <span className="text-xs text-stone-500">{r.party_size} kişi</span>}
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    r.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400' :
                    r.status === 'cancelled' ? 'bg-red-500/15 text-red-400' :
                    r.status === 'completed' ? 'bg-blue-500/15 text-blue-400' :
                    'bg-stone-700/50 text-stone-400'
                  }`}>
                    {r.status === 'confirmed' ? 'Onaylandı' :
                     r.status === 'cancelled' ? 'İptal' :
                     r.status === 'completed' ? 'Tamamlandı' :
                     r.status === 'pending' ? 'Bekliyor' : r.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-sm">Henüz rezervasyon yok</p>
          )}
        </section>

      </div>
    </div>
  )
}
