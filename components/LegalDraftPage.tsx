// Hukuki onay bekleyen yasal metin taslakları için ortak sayfa iskeleti.
// Taslaklar arama motorlarına kapalıdır (sayfalarda robots: noindex) ve üstte uyarı bandı taşır.
export type LegalSection = { baslik: string; paragraflar: string[] }

export default function LegalDraftPage({ baslik, guncelleme, bolumler }: {
  baslik: string
  guncelleme: string
  bolumler: LegalSection[]
}) {
  return (
    <main className="min-h-screen bg-white">
      <div role="note" className="bg-amber-100 border-b border-amber-300 text-amber-900 text-sm font-semibold text-center px-6 py-3">
        TASLAK – hukuki onay bekliyor. Bu metin yürürlükte değildir.
      </div>
      <article className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-zinc-900">{baslik}</h1>
        <p className="text-xs text-zinc-400 mt-2">Son güncelleme: {guncelleme}</p>
        {bolumler.map(b => (
          <section key={b.baslik} className="mt-8">
            <h2 className="text-lg font-semibold text-zinc-900">{b.baslik}</h2>
            {b.paragraflar.map((p, i) => (
              <p key={i} className="mt-3 text-sm text-zinc-700 leading-relaxed">{p}</p>
            ))}
          </section>
        ))}
      </article>
    </main>
  )
}
