import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { getPanelApiSession } from '@/lib/panel-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { phoneKey } from '@/lib/phone';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// Input validation — to E.164 format, message sınırlı
const SmsSchema = z.object({
  to: z.string().regex(/^\+?[0-9]{10,15}$/, 'Geçersiz telefon'),
  message: z.string().min(1).max(1600),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { prefix: 'send-sms', max: 10, windowMs: 60_000 });
  if (limited) return limited;

  // Güvenlik: Yalnızca oturum açmış panel kullanıcıları SMS gönderebilir.
  // (SMS = ücretli Twilio çağrısı; anonim erişim spam/maliyet istismarına açıktır.)
  // Web (cr_panel) veya mobil (Bearer) panel oturumu; işletme oturumdan
  const session = await getPanelApiSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = SmsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Geçersiz istek.', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { to, message } = parsed.data;

    // Gece kararı #5: yalnız bu işletmenin rezervasyonlarındaki numaralara gönderilir
    // (önceden herhangi bir numaraya serbest metin gidebiliyordu → maliyet/oltalama riski)
    // guest_phone DB'de karışık biçimde (boşluklu dahil) → son 7 haneyle aday çek, anahtarla eşleştir
    const key = phoneKey(to);
    const { data: candidates } = key.length >= 10
      ? await getSupabaseAdmin().from('reservations').select('guest_phone')
          .eq('restaurant_id', session.restaurantId).ilike('guest_phone', `%${key.slice(-2)}`).limit(500)
      : { data: [] as { guest_phone: string }[] };
    if (!(candidates ?? []).some(c => phoneKey(c.guest_phone) === key)) {
      return NextResponse.json({ error: 'Bu numara işletmenizin rezervasyonlarında kayıtlı değil.' }, { status: 403 });
    }

    // Normalize Turkish phone numbers to E.164
    const phone = to.startsWith('+') ? to : `+90${to.replace(/^0/, '').replace(/\D/g, '')}`;

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('[send-sms]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'SMS gönderilemedi. Lütfen tekrar deneyin.' }, { status: 500 });
  }
}
