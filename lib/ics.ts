// CU-06: "Takvime ekle" için .ics (iCalendar) üretimi — bağımlılıksız.
// Rezervasyon saatleri Türkiye saatidir (UTC+3, yaz saati yok) → UTC'ye çevrilip yazılır.

function toUtcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, m => `\\${m}`)
}

export function buildReservationIcs(opts: {
  uid: string
  title: string
  date: string          // YYYY-MM-DD
  time: string          // HH:MM (Türkiye saati)
  durationMinutes: number
  location?: string | null
  description?: string | null
}): string | null {
  const start = new Date(`${opts.date}T${opts.time.slice(0, 5)}:00+03:00`)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + Math.max(15, opts.durationMinutes) * 60_000)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CheckRezerve//Rezervasyon//TR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${opts.uid}@checkrezerve.com`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${escapeText(opts.title)}`,
    opts.location ? `LOCATION:${escapeText(opts.location)}` : null,
    opts.description ? `DESCRIPTION:${escapeText(opts.description)}` : null,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(opts.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)
  return lines.join('\r\n') + '\r\n'
}
