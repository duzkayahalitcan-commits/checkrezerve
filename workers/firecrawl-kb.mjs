#!/usr/bin/env node
/**
 * firecrawl-kb.mjs
 *
 * PART 1: CheckRezerve destek bilgi tabanını Firecrawl (Hosted API) ile üretir.
 * Hedef sayfaları tarar, temiz markdown'a çevirir, workers/kb/*.md dosyalarına yazar.
 *
 * Bu script bağımsızdır — ana Next.js build/deploy sürecine dahil edilmez.
 * Manuel çalıştırılır: `node workers/firecrawl-kb.mjs` (veya npm script).
 *
 * Gereksinimler:
 *   - FIRECRAWL_API_KEY ortam değişkeni (firecrawl.dev üzerinden alınır)
 *   - Node 18+ (global fetch)
 *
 * Kullanım:
 *   FIRECRAWL_API_KEY=fc-xxx node workers/firecrawl-kb.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KB_DIR = path.join(__dirname, 'kb')

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY
if (!FIRECRAWL_API_KEY) {
  console.error('HATA: FIRECRAWL_API_KEY ortam değişkeni gerekli.')
  process.exit(1)
}

// Hedef sayfalar: her biri ayrı bir markdown dosyasına yazılır.
const TARGETS = [
  { url: 'https://checkrezerve.com/tr/sss', out: 'tr-sss.md', label: 'SSS' },
  { url: 'https://checkrezerve.com/tr/pricing', out: 'tr-pricing.md', label: 'Fiyatlandırma' },
  { url: 'https://checkrezerve.com/tr/ozellikler', out: 'tr-ozellikler.md', label: 'Özellikler' },
]

// Firecrawl Hosted API — /scrape endpoint'i, markdown formatı
async function scrapeToMarkdown(url) {
  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      // Gezinme/footer gürültüsünü elemek için ana içerik seçici (opsiyonel)
      onlyMainContent: true,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Firecrawl ${res.status}: ${body.slice(0, 300)}`)
  }

  const json = await res.json()
  const md = json?.data?.markdown ?? ''
  if (!md) throw new Error('Firecrawl markdown döndürmedi')
  return md
}

mkdirSync(KB_DIR, { recursive: true })

console.log('=== Firecrawl KB Üretimi ===\n')

let succeeded = 0
for (const t of TARGETS) {
  try {
    console.log(`[${t.label}] ${t.url} ...`)
    const md = await scrapeToMarkdown(t.url)
    const out = path.join(KB_DIR, t.out)
    writeFileSync(out, `# ${t.label}\n\nKaynak: ${t.url}\n\n${md}`, 'utf-8')
    console.log(`  ✓ ${t.out} (${md.length} karakter)`)
    succeeded++
    // Firecrawl rate limit'e takılmamak için kısa bekleme
    await new Promise(r => setTimeout(r, 1500))
  } catch (e) {
    console.error(`  ✗ ${t.out} hatası: ${e.message}`)
  }
}

console.log(`\n=== Tamam: ${succeeded}/${TARGETS.length} dosya üretildi. ${KB_DIR} ===`)
if (succeeded === 0) process.exit(1)
