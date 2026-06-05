'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const MSGS: Record<string, { title: string; subtitle: string; retry: string; home: string }> = {
  tr: { title: 'Bir Şeyler Ters Gitti', subtitle: 'Beklenmedik bir sorun oluştu. Lütfen tekrar deneyin.', retry: 'Tekrar Dene', home: 'Ana Sayfa' },
  en: { title: 'Something Went Wrong', subtitle: 'An unexpected error occurred. Please try again.', retry: 'Try Again', home: 'Home' },
  de: { title: 'Etwas ist schiefgelaufen', subtitle: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.', retry: 'Erneut versuchen', home: 'Startseite' },
  ar: { title: 'حدث خطأ ما', subtitle: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.', retry: 'حاول مرة أخرى', home: 'الصفحة الرئيسية' },
  da: { title: 'Noget gik galt', subtitle: 'Der opstod en uventet fejl. Prøv venligst igen.', retry: 'Prøv igen', home: 'Forside' },
  es: { title: 'Algo salió mal', subtitle: 'Ocurrió un error inesperado. Inténtalo de nuevo.', retry: 'Reintentar', home: 'Inicio' },
  ru: { title: 'Что-то пошло не так', subtitle: 'Произошла непредвиденная ошибка. Попробуйте снова.', retry: 'Повторить', home: 'На главную' },
}

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] ?? 'tr'
  const msg = MSGS[locale] ?? MSGS.tr

  useEffect(() => { console.error(error) }, [error])

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
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-[#E53935] hover:bg-red-700 text-white px-8 py-3 text-sm font-semibold transition-colors"
        >
          {msg.retry}
        </button>
        <a
          href="/"
          className="rounded-full border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-8 py-3 text-sm font-semibold transition-colors"
        >
          {msg.home}
        </a>
      </div>
    </div>
  )
}
