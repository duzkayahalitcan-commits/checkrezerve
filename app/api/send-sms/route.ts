import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';
import { verifyPanelToken } from '@/lib/middleware-auth';

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
  const jar = await cookies();
  const raw = jar.get('cr_panel')?.value ?? '';
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !verifyPanelToken(raw, secret)) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = SmsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Geçersiz istek.', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { to, message } = parsed.data;

    // Normalize Turkish phone numbers to E.164
    const phone = to.startsWith('+') ? to : `+90${to.replace(/^0/, '').replace(/\D/g, '')}`;

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'SMS send failed';
    console.error('[send-sms]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
