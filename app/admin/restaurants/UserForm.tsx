'use client'

import { useActionState } from 'react'
import { createRestaurantUser } from './actions'
import type { Restaurant } from '@/types'

export default function UserForm({ restaurants }: { restaurants: Restaurant[] }) {
  const [state, action, pending] = useActionState(createRestaurantUser, { error: null, success: false })

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-stone-200 mb-3">Yeni Restoran Kullanıcısı</h3>
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
            <option value="manager">Yönetici</option>
            <option value="staff">Çalışan</option>
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
  )
}
