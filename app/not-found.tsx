'use client'

import { usePathname } from 'next/navigation'

const MSGS: Record<string, { title: string; subtitle: string; button: string }> = {
  tr: { title: 'Sayfa Bulunamadı', subtitle: 'Aradığın sayfa taşınmış veya hiç var olmamış olabilir.', button: 'Ana Sayfaya Dön' },
  en: { title: 'Page Not Found', subtitle: "The page you're looking for may have moved or never existed.", button: 'Back to Home' },
  de: { title: 'Seite Nicht Gefunden', subtitle: 'Die gesuchte Seite wurde möglicherweise verschoben oder existiert nicht.', button: 'Zur Startseite' },
  ar: { title: 'الصفحة غير موجودة', subtitle: 'الصفحة التي تبحث عنها ربما تم نقلها أو لم تكن موجودة أصلاً.', button: 'العودة إلى الصفحة الرئيسية' },
  da: { title: 'Siden Blev Ikke Fundet', subtitle: 'Siden, du leder efter, er måske flyttet eller har aldrig eksisteret.', button: 'Tilbage til forsiden' },
  es: { title: 'Página No Encontrada', subtitle: 'La página que buscas pudo haberse movido o nunca existió.', button: 'Volver al inicio' },
  ru: { title: 'Страница Не Найдена', subtitle: 'Возможно, страница была перемещена или никогда не существовала.', button: 'На главную' },
}

export default function NotFound() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] ?? 'tr'
  const msg = MSGS[locale] ?? MSGS.tr

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 text-center">
      <img
        src="/images/404-keys.png"
        alt=""
        loading="eager"
        className="max-w-[400px] w-full mb-8 select-none pointer-events-none"
      />
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">{msg.title}</h1>
      <p className="text-zinc-400 mb-8 max-w-md">{msg.subtitle}</p>
      <a
        href="/"
        className="rounded-full bg-[#E53935] hover:bg-red-700 text-white px-8 py-3 text-sm font-semibold transition-colors"
      >
        {msg.button}
      </a>
    </div>
  )
}
