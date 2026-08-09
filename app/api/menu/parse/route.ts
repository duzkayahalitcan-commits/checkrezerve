import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { writeFile, rm } from 'fs/promises'
import os from 'os'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { verifySession } from '@/lib/panel-auth'
import { canManageServices } from '@/lib/roles'

const execFileAsync = promisify(execFile)

export const dynamic = 'force-dynamic'

// İzin verilen dosya türleri (PDF + görseller)
const ALLOWED = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const

// MarkItDown python yolu — proje içi .venv Turbopack build'ini bozduğu için
// dışarıdaki bir venv'e (veya ortama) işaret eder. Sırasıyla:
//  1) MENU_MARKITDOWN_PYTHON env'i (önerilen)
//  2) ~/.checkrezerve-venv/bin/python (varsayılan kurulum noktası)
function venvPython(): string | null {
  const envPy = process.env.MENU_MARKITDOWN_PYTHON
  if (envPy) return envPy
  const home = process.env.HOME
  if (home) return path.join(home, '.checkrezerve-venv', 'bin', 'python')
  return null
}

async function fileExists(p: string): Promise<boolean> {
  try { const { access } = await import('fs/promises'); await access(p); return true }
  catch { return false }
}

// Görsel → metin (tesseract.js OCR). Türkçe dil paketi, yoksa İngilizce.
async function ocrImage(filePath: string): Promise<string> {
  const Tesseract = await import('tesseract.js')
  const { createWorker } = Tesseract
  let worker
  try {
    worker = await createWorker('tur+eng')
    const { data } = await worker.recognize(filePath)
    const text = (data?.text ?? '').trim()
    if (!text) throw new Error('Görselden metin çıkarılamadı')
    return text
  } finally {
    if (worker) await worker.terminate()
  }
}

// PDF → metin (MarkItDown / python venv)
async function pdfToText(filePath: string): Promise<string> {
  const py = venvPython()
  const converter = path.join(process.cwd(), 'scripts', 'menu_convert.py')
  if (!py || !(await fileExists(py))) {
    throw new Error('MarkItDown python ortamı hazır değil. MENU_MARKITDOWN_PYTHON ayarlayın veya ~/.checkrezerve-venv kurun.')
  }
  if (!(await fileExists(converter))) {
    throw new Error('scripts/menu_convert.py bulunamadı')
  }
  const { stdout, stderr } = await execFileAsync(py, [converter, filePath], { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 })
  const text = (stdout ?? '').trim()
  if (!text) throw new Error(`PDF metne çevrilemedi: ${(stderr ?? '').slice(0, 200)}`)
  return text
}

// DeepSeek: ham metinden yapılandırılmış hizmet listesi çıkar
async function extractWithDeepSeek(rawText: string): Promise<Array<{ ad: string; fiyat: number | null; sure_dakika: number | null }>> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY eksik')

  const systemPrompt = `Bir fiyat listesinden/menüden hizmet kalemlerini çıkarıyorsun.
Kullanıcı sana bir restoran/salon/kuaför/klinik menüsünün ham metnini verir.
Görevin: her hizmet için { "ad", "fiyat", "sure_dakika" } alanlarını içeren bir JSON DİZİSİ döndürmek.

KURALLAR:
- Yalnızca geçerli JSON dizisi döndür. Ek açıklama, markdown, kod bloğu YAZMA.
- "ad": hizmetin kısa adı (Türkçe orijinal haliyle).
- "fiyat": sayısal değer (TL). Metinde fiyat yoksa null yap. "ücreti", "bilgi için arayın", "fiyatı yok" gibi durumlarda null.
- "sure_dakika": metinde süre varsa dakika sayısı (örn. "45 dk", "1 saat" -> 60), yoksa null.
- Başlık/alt başlık satırlarını (örn. "MENÜ", "SICAK İÇECEKLER") hizmet olarak alma; yalnızca gerçek hizmet+fiyat çiftlerini çıkar.
- Fiyatı olmayan satırı yine de hizmet olarak al (fiyat: null) EĞER açıkça bir hizmetse; kategori başlıklarıysa atla.
- Boş veya anlamsız metin için [] döndür.`

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.1,
      max_tokens: 2000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `MENÜ METNİ:\n\n${rawText.slice(0, 8000)}` },
      ],
    }),
  })
  if (!res.ok) throw new Error(`DeepSeek hatası: ${res.status}`)
  const data = await res.json()
  const content: string = data?.choices?.[0]?.message?.content ?? ''
  // ```json ... ``` bloklarından temizle
  const cleaned = content.replace(/```(?:json)?/gi, '').trim()
  const parsed = JSON.parse(cleaned)
  if (!Array.isArray(parsed)) throw new Error('DeepSeek geçerli bir dizi döndürmedi')
  return parsed.map((it: Record<string, unknown>) => ({
    ad: String(it.ad ?? it.name ?? '').trim(),
    fiyat: it.fiyat != null ? Number(it.fiyat) || null : it.price != null ? Number(it.price) || null : null,
    sure_dakika: it.sure_dakika != null ? Number(it.sure_dakika) || null : it.duration_minutes != null ? Number(it.duration_minutes) || null : null,
  })).filter(x => x.ad)
}

export async function POST(req: NextRequest) {
  // 1) Yetki kontrolü
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canManageServices(session.role)) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
  }

  let tempPath: string | null = null
  try {
    // 2) Dosya al
    const form = await req.formData()
    const file = form.get('file')
    if (!file || typeof file === 'string' || !('arrayBuffer' in file)) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }
    const blob = file as Blob & { name?: string; type?: string }
    const mime = (blob.type ?? '').toLowerCase()
    const ext = ALLOWED[mime as keyof typeof ALLOWED]
    if (!ext) {
      return NextResponse.json({ error: 'Desteklenmeyen dosya türü. PDF, JPG veya PNG yükleyin.' }, { status: 400 })
    }

    // 3) Temp'e yaz
    const buf = Buffer.from(await blob.arrayBuffer())
    if (buf.length === 0) return NextResponse.json({ error: 'Boş dosya' }, { status: 400 })
    if (buf.length > 20 * 1024 * 1024) return NextResponse.json({ error: 'Dosya 20MB üzeri olamaz' }, { status: 400 })

    const id = crypto.randomUUID()
    tempPath = path.join(os.tmpdir(), `cr-menu-${id}.${ext}`)
    await writeFile(tempPath, buf)

    // 4) Metne çevir (PDF → MarkItDown, görsel → OCR)
    let rawText: string
    if (mime === 'application/pdf') {
      rawText = await pdfToText(tempPath)
    } else {
      rawText = await ocrImage(tempPath)
    }

    // 5) DeepSeek ile yapılandırılmış veri
    const items = await extractWithDeepSeek(rawText)
    return NextResponse.json({ items, rawText: rawText.slice(0, 3000) })
  } catch (err) {
    console.error('[menu/parse]', err)
    const message = err instanceof Error ? err.message : 'Bir hata oluştu'
    return NextResponse.json({ error: message }, { status: 422 })
  } finally {
    if (tempPath) {
      try { await rm(tempPath, { force: true }) } catch {}
    }
  }
}
