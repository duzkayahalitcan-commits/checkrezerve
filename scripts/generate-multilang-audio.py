#!/usr/bin/env python3
"""
Multilang ses dosyası üretici — CheckRezerve
Kullanım: python3 scripts/generate-multilang-audio.py [dil1 dil2 ...]
Örnek:    python3 scripts/generate-multilang-audio.py en de
          python3 scripts/generate-multilang-audio.py en de ar da es ru
"""

import os, sys, re, time, pathlib, json, ssl, urllib.request, urllib.error
from typing import Optional

# macOS Python SSL fix
SSL_CTX = ssl.create_default_context()
try:
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    # Fall back to macOS system certs
    cafile = '/etc/ssl/cert.pem'
    if os.path.exists(cafile):
        SSL_CTX = ssl.create_default_context(cafile=cafile)
    else:
        SSL_CTX.check_hostname = False
        SSL_CTX.verify_mode = ssl.CERT_NONE

# ── Proje kök dizini ──────────────────────────────────────────────────────────
PROJECT_ROOT = pathlib.Path(__file__).parent.parent
ENV_FILE     = PROJECT_ROOT / '.env'
AUDIO_DIR    = PROJECT_ROOT / 'public' / 'audio'
TS_FILE      = PROJECT_ROOT / 'lib' / 'audio-sentences.ts'

# ── .env'den API key ──────────────────────────────────────────────────────────
def load_env(path: pathlib.Path) -> dict:
    env = {}
    if path.exists():
        for line in path.read_text().splitlines():
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip()
    return env

ENV = load_env(ENV_FILE)
API_KEY = ENV.get('ELEVENLABS_API_KEY', '')

if not API_KEY:
    print('HATA: ELEVENLABS_API_KEY .env dosyasında bulunamadı.')
    sys.exit(1)

# ── Voice ID'leri ─────────────────────────────────────────────────────────────
VOICE_IDS = {
    'en': 'q5GI4RAWrMYEY5xaGcma',   # Lisa — English
    'de': 'jbJMQWv1eS4YjQ6PCcn6',   # Gülsu — eleven_multilingual_v2
    'es': 'j41pQugxGaKleSQLIyG2',   # MARCIANO RAJOY
    'ru': 't6lBrEl93uCiLR1Lgm8v',   # Alisa Natural Russian Female
    'ar': 'RL04FaPrUG6vS8aWd9NZ',  # Faris
    'da': 'BIWC0507fYMfhPcAEIRP',  # Mads
}
# AR ve DA voice ID'lerini bulmak için:
#   1. https://elevenlabs.io/voice-library adresine git, "Faris" ara → voice ID kopyala
#   2. Yukarıdaki '' yerine yapıştır
#   3. Aynısını "Mads" için yap

MODEL_ID = 'eleven_multilingual_v2'

# ── TS dosyasından cümleleri çek ──────────────────────────────────────────────
def parse_sentences_from_ts(lang: str) -> dict:
    """audio-sentences.ts'den belirtilen dil için {kategori: [(key, text)]} döndürür."""
    content = TS_FILE.read_text(encoding='utf-8')
    pair_re = re.compile(r"\['([\w_]+)',\s*[\"']([^\"']+)[\"']\]")

    # MULTILANG_SENTENCES bloğunu bul
    ml_start = content.index('const MULTILANG_SENTENCES')
    ml_block = content[ml_start:]

    # Dil bloğunu bul
    lang_marker = f"  {lang}: {{"
    lang_start = ml_block.find(lang_marker)
    if lang_start == -1:
        return {}

    # Bloğun sonunu brace sayarak bul
    depth = 0
    i = lang_start
    while i < len(ml_block):
        if ml_block[i] == '{':
            depth += 1
        elif ml_block[i] == '}':
            depth -= 1
            if depth == 0:
                lang_block = ml_block[lang_start:i+1]
                break
        i += 1

    # Kategorileri ayrıştır
    cats = ['universal', 'restoran', 'guzellik', 'saglik', 'kuafor', 'pilates']
    result = {}
    for cat in cats:
        cat_marker = f"    {cat}: ["
        cat_start = lang_block.find(cat_marker)
        if cat_start == -1:
            result[cat] = []
            continue
        bracket_start = lang_block.index('[', cat_start + len(cat_marker) - 1)
        depth2 = 0
        j = bracket_start
        while j < len(lang_block):
            if lang_block[j] == '[':
                depth2 += 1
            elif lang_block[j] == ']':
                depth2 -= 1
                if depth2 == 0:
                    cat_block = lang_block[bracket_start:j+1]
                    result[cat] = pair_re.findall(cat_block)
                    break
            j += 1
        if cat not in result:
            result[cat] = []

    return result

# ── İstatistik ve kredi tahmini ───────────────────────────────────────────────
def compute_stats(langs: list[str]) -> dict:
    stats = {}
    for lang in langs:
        sentences = parse_sentences_from_ts(lang)
        total_count = sum(len(v) for v in sentences.values())
        total_chars = sum(len(text) for pairs in sentences.values() for _, text in pairs)
        stats[lang] = {
            'count': total_count,
            'chars': total_chars,
            'cats': {cat: len(pairs) for cat, pairs in sentences.items()},
        }
    return stats

# ── ElevenLabs TTS çağrısı ────────────────────────────────────────────────────
def tts(text: str, voice_id: str, retries: int = 3) -> Optional[bytes]:
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}'
    payload = json.dumps({
        'text': text,
        'model_id': MODEL_ID,
        'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75},
    }).encode('utf-8')
    headers = {'xi-api-key': API_KEY, 'Content-Type': 'application/json'}
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, data=payload, headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=30, context=SSL_CTX) as resp:
                return resp.read()
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf-8', errors='replace')[:200]
            if e.code == 429:
                wait = 60 if attempt == 0 else 120
                print(f'  Rate limit, {wait}s bekleniyor…')
                time.sleep(wait)
            else:
                print(f'  HTTP {e.code}: {body}')
                return None
        except Exception as e:
            print(f'  İstek hatası: {e}')
            if attempt < retries - 1:
                time.sleep(10)
    return None

# ── Tek dil için üretim ────────────────────────────────────────────────────────
def generate_lang(lang: str, dry_run: bool = False):
    voice_id = VOICE_IDS.get(lang, '')
    if not voice_id:
        print(f'\n[{lang.upper()}] voice_id boş — atlanıyor. Lütfen VOICE_IDS sözlüğüne ID ekleyin.')
        return 0, 0

    sentences = parse_sentences_from_ts(lang)
    total_pairs = [(cat, key, text)
                   for cat, pairs in sentences.items()
                   for key, text in pairs]

    print(f'\n[{lang.upper()}] {len(total_pairs)} cümle — voice: {voice_id}')
    generated = 0
    skipped = 0

    for cat, key, text in total_pairs:
        out_dir = AUDIO_DIR / lang / 'default' / cat
        out_file = out_dir / f'{key}.mp3'

        if out_file.exists():
            skipped += 1
            continue

        if dry_run:
            print(f'  [DRY] {cat}/{key}: {text[:50]}')
            generated += 1
            continue

        out_dir.mkdir(parents=True, exist_ok=True)
        print(f'  ▶ {cat}/{key}', end=' ', flush=True)
        audio = tts(text, voice_id)
        if audio:
            out_file.write_bytes(audio)
            generated += 1
            print('✓')
        else:
            print('✗')
        time.sleep(0.4)  # rate limit koruması

    return generated, skipped

# ── Ana akış ──────────────────────────────────────────────────────────────────
def main():
    requested = sys.argv[1:] if len(sys.argv) > 1 else ['en', 'de']
    valid_langs = [l for l in requested if l in VOICE_IDS]
    invalid = [l for l in requested if l not in VOICE_IDS]

    if invalid:
        print(f'Bilinmeyen dil(ler): {invalid}')
        print(f'Geçerli diller: {list(VOICE_IDS.keys())}')
        sys.exit(1)

    print('=' * 60)
    print('CheckRezerve — Multilang Ses Üretici')
    print('=' * 60)

    # İstatistik
    stats = compute_stats(valid_langs)
    total_chars = 0
    print(f'\n{"Dil":<5} {"Cümle":>6} {"Karakter":>10} {"Tahmini Kredi":>14}')
    print('-' * 45)
    for lang in valid_langs:
        s = stats[lang]
        vid = VOICE_IDS.get(lang, '')
        status = '' if vid else ' ⚠️  voice_id EKSİK'
        print(f'{lang.upper():<5} {s["count"]:>6} {s["chars"]:>10,} {s["chars"]:>14,}{status}')
        if vid:
            total_chars += s['chars']
    print('-' * 45)
    print(f'{"TOPLAM":<5} {sum(s["count"] for s in stats.values()):>6} {sum(s["chars"] for s in stats.values()):>10,} {total_chars:>14,}')
    print(f'\nNot: ElevenLabs eleven_multilingual_v2 = 1 kredi/karakter')
    print(f'Tahmini kullanım: {total_chars:,} kredi')

    # Uyarı: voice_id eksik diller
    missing = [l for l in valid_langs if not VOICE_IDS.get(l)]
    if missing:
        print(f'\n⚠️  voice_id EKSİK: {[l.upper() for l in missing]}')
        print('   generate-multilang-audio.py dosyasındaki VOICE_IDS sözlüğüne ekleyin.')

    print('\nÜretilecek diller:', [l.upper() for l in valid_langs if VOICE_IDS.get(l)])
    print('Atlanacak diller (voice_id yok):', [l.upper() for l in valid_langs if not VOICE_IDS.get(l)])

    # Onay
    answer = input('\nÜretime başlamak istiyor musunuz? [e/E=evet, h/H=hayır]: ').strip().lower()
    if answer not in ('e', 'evet', 'y', 'yes'):
        print('İptal edildi.')
        return

    # Üret
    total_gen = 0
    total_skip = 0
    for lang in valid_langs:
        gen, skip = generate_lang(lang)
        total_gen += gen
        total_skip += skip

    print(f'\n{"=" * 60}')
    print(f'Tamamlandı: {total_gen} üretildi, {total_skip} zaten vardı.')
    print(f'Çıktı dizini: {AUDIO_DIR}')

if __name__ == '__main__':
    main()
