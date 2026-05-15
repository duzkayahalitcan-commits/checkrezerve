'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6 text-center gap-5">
      <div className="w-16 h-16 rounded-2xl bg-stone-800 flex items-center justify-center text-3xl">
        📡
      </div>
      <div>
        <h1 className="text-xl font-bold text-white">İnternet Bağlantısı Yok</h1>
        <p className="mt-1 text-sm text-stone-400">
          Bağlantınız geri geldiğinde otomatik olarak yenilenecektir.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm active:scale-95 transition-transform"
      >
        Tekrar Dene
      </button>
    </div>
  )
}
