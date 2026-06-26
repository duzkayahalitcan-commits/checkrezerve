import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FROM_ADDRESS = "info@checkrezerve.com";
const FROM_NAME = "CheckRezerve";

// ─── Marka renkleri ──────────────────────────────────────────────────────────
const RED   = "#E53935";
const ESPR  = "#2B1B17";
const GOLD  = "#D4A373";

// ─── HTML Template ───────────────────────────────────────────────────────────
function buildHtml(subject: string, bodyText: string): string {
  // Basit düz metin -> HTML dönüşümü (satırları <br/> yap)
  const lines = bodyText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const bodyHtml = lines
    .map((line) => {
      if (line.startsWith("—")) return `<p style="color:#9CA3AF;font-size:13px;margin:6px 0;">${line}</p>`;
      if (line.includes(":")) {
        const [key, ...rest] = line.split(":");
        return `<p style="margin:4px 0;font-size:14px;"><span style="color:#6B7280;font-weight:600;">${key}:</span> ${rest.join(":").trim()}</p>`;
      }
      return `<p style="margin:4px 0;font-size:14px;color:#374151;">${line}</p>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;padding:24px 12px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">

        <!-- Header / Logo -->
        <tr>
          <td style="padding:24px 0 8px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,${ESPR} 0%,${RED} 100%);text-align:center;vertical-align:middle;">
                  <span style="font-size:22px;font-weight:900;color:#fff;line-height:44px;">C</span>
                </td>
                <td style="padding-left:12px;">
                  <span style="font-size:15px;font-weight:800;color:${ESPR};">checkrezerve</span>
                  <br/>
                  <span style="font-size:11px;color:#9CA3AF;">Online Rezervasyon</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="height:1px;background:linear-gradient(90deg,transparent,${GOLD},transparent);margin:0;padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Body Card -->
        <tr><td style="padding:16px 0;">
          <table cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #E5E7EB;padding:24px;width:100%;">
            <tr><td style="padding:24px 24px 12px;">
              <h1 style="margin:0 0 16px;font-size:18px;font-weight:800;color:${ESPR};">${subject}</h1>
              ${bodyHtml}
            </td></tr>
            <tr><td style="padding:12px 24px 24px;">
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td style="border-radius:12px;background:${RED};padding:12px 24px;text-align:center;">
                    <a href="https://checkrezerve.com" style="color:#fff;font-size:14px;font-weight:700;text-decoration:none;">checkrezerve.com</a>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 0 24px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9CA3AF;">
            Bu e-posta otomatik olarak gönderilmiştir.<br/>
            © ${new Date().getFullYear()} CheckRezerve
          </p>
          <p style="margin:4px 0 0;font-size:11px;color:#D1D5DB;">
            ${ESPR} · ${RED} · ${GOLD}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Edge Function ───────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: pending, error: fetchError } = await supabase
    .from("email_logs")
    .select("id, recipient_email, subject, body")
    .eq("status", "pending")
    .limit(50);

  if (fetchError) {
    console.error("fetch error:", fetchError.message);
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!pending || pending.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: "no pending emails" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  let sent = 0;
  let failed = 0;

  for (const log of pending) {
    try {
      const htmlBody = buildHtml(log.subject, log.body);

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <${FROM_ADDRESS}>`,
          to: [log.recipient_email],
          subject: log.subject,
          html: htmlBody,
          text: log.body,
        }),
      });

      if (res.ok) {
        await supabase
          .from("email_logs")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", log.id);
        sent++;
      } else {
        const err = await res.text();
        console.error(`resend error for ${log.id}:`, err);
        await supabase
          .from("email_logs")
          .update({ status: "failed" })
          .eq("id", log.id);
        failed++;
      }
    } catch (e) {
      console.error(`exception for ${log.id}:`, e);
      await supabase
        .from("email_logs")
        .update({ status: "failed" })
        .eq("id", log.id);
      failed++;
    }
  }

  return new Response(JSON.stringify({ sent, failed, total: pending.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
