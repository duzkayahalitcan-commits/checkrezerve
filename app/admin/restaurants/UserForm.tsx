'use client'

import { useActionState } from 'react'
import { createRestaurantUser } from './actions'
import { getRoleLabel } from '@/lib/roles'
import type { Restaurant, RestaurantUser } from '@/types'

interface Props {
  restaurants: Restaurant[]
  users:       (RestaurantUser & { restaurant_name: string })[]
}

export default function UserForm({ restaurants, users }: Props) {
  const [state, action, pending] = useActionState(createRestaurantUser, { error: null, success: false })

  return (
    <div className="space-y-4">
      {/* ─── Yeni kullanıcı formu ─── */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-stone-200 mb-3">Yeni Panel Kullanıcısı</h3>
        <form action={action} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-stone-500 text-xs mb-1">Restoran</label>
            <select
              name="restaurant_id"
              required
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2
                         text-white text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="">Seçin…</option>
              {restaurants.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-stone-500 text-xs mb-1">Rol</label>
            <select
              name="role"
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2
                         text-white text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="business_owner">Sahip</option>
              <option value="business_manager">Yönetici</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-500 text-xs mb-1">Kullanıcı Adı</label>
            <input
              name="username"
              type="text"
              required
              placeholder="nusret_yonetici"
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2
                         text-white text-sm placeholder-stone-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-stone-500 text-xs mb-1">Şifre</label>
            <input
              name="password"
              type="password"
              required
              placeholder="En az 8 karakter"
              minLength={8}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2
                         text-white text-sm placeholder-stone-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {state.error && (
            <p className="col-span-2 text-red-400 text-xs bg-red-950/40 border border-red-900/50
                          rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="col-span-2 text-emerald-400 text-xs bg-emerald-950/40 border border-emerald-900/50
                          rounded-lg px-3 py-2">
              Kullanıcı oluşturuldu.
            </p>
          )}

          <div className="col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50
                         text-black font-semibold rounded-lg px-4 py-2 text-sm transition"
            >
              {pending ? 'Oluşturuluyor…' : 'Kullanıcı Oluştur'}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Mevcut kullanıcı listesi ─── */}
      {users.length > 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="text-left text-xs text-stone-500 font-medium px-4 py-2.5">Kullanıcı</th>
                <th className="text-left text-xs text-stone-500 font-medium px-4 py-2.5 hidden sm:table-cell">Restoran</th>
                <th className="text-left text-xs text-stone-500 font-medium px-4 py-2.5">Rol</th>
                <th className="text-left text-xs text-stone-500 font-medium px-4 py-2.5 hidden sm:table-cell">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-4 py-2.5 text-stone-200 font-mono text-xs">{u.username}</td>
                  <td className="px-4 py-2.5 text-stone-400 text-xs hidden sm:table-cell">{u.restaurant_name}</td>
                  <td className="px-4 py-2.5">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    <span className={`text-xs ${u.is_active ? 'text-green-400' : 'text-stone-600'}`}>
                      {u.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const label = getRoleLabel(role)
  const styles: Record<string, string> = {
    business_owner:   'bg-amber-500/15 text-amber-400 border-amber-500/20',
    business_manager: 'bg-blue-500/15  text-blue-400  border-blue-500/20',
    super_admin:      'bg-red-500/15   text-red-400   border-red-500/20',
    customer:         'bg-stone-700/50 text-stone-400 border-stone-600/30',
  }
  const cls = styles[role] ?? 'bg-stone-700/50 text-stone-400 border-stone-600/30'
  return (
    <span className={`inline-block border rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}
