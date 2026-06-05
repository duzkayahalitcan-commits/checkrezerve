'use server'

export async function sendTelegramNotification(businessName: string, email: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `🆕 Yeni İşletme Kaydı!\n\n🏢 İşletme: ${businessName}\n📧 Email: ${email}\n⏰ ${new Date().toLocaleString('tr-TR')}`,
      parse_mode: 'HTML',
    }),
  })
}
