import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Use test@resend.dev until checkrezerve.com domain is verified in Resend
const FROM_ADDRESS = "info@checkrezerve.com";
const FROM_NAME = "CheckRezerve";

Deno.serve(async (req) => {
  // Allow cron or manual POST trigger
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch pending emails (batch of 50)
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
