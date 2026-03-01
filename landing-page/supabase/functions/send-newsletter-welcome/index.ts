/**
 * Edge Function: send-newsletter-welcome
 *
 * Triggered by a Supabase Database Webhook on INSERT to newsletter_subscribers.
 * Sends a branded welcome email to new subscribers via Resend (or SendGrid).
 *
 * Webhook payload shape:
 *   { type: "INSERT", table: "newsletter_subscribers", record: { email, source, ... } }
 *
 * Required env vars (set via Supabase dashboard → Project Settings → Edge Functions):
 *   RESEND_API_KEY      — from https://resend.com (preferred)
 *   SENDGRID_API_KEY    — fallback if you prefer SendGrid
 *   FROM_EMAIL          — verified sender address, e.g.  hello@fintrack.app
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY   = Deno.env.get("RESEND_API_KEY");
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const FROM_EMAIL       = Deno.env.get("FROM_EMAIL") ?? "hello@fintrack.app";
const REPLY_TO         = Deno.env.get("REPLY_TO")   ?? "support@fintrack.app";

// ── HTML email template ──────────────────────────────────────────────────────
function buildHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Welcome to FinTrack</title></head>
<body style="margin:0;padding:0;background:#0C0A07;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#111;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
    <tr><td style="background:linear-gradient(135deg,#0d9488,#06b6d4);padding:36px 40px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;">FinTrack</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Your AI-powered finance companion</p>
    </td></tr>
    <tr><td style="padding:40px;">
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#f9fafb;">You're on the list! 🎉</h2>
      <p style="margin:0 0 16px;color:#9ca3af;line-height:1.7;">
        Thanks for subscribing to FinTrack updates. We'll send you product news, financial tips, and early access to new features — no spam, ever.
      </p>
      <p style="margin:0 0 24px;color:#9ca3af;line-height:1.7;">
        In the meantime, why not try the app? FinTrack helps you track income &amp; expenses, set savings goals, and understand your spending — all with AI-powered insights.
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
        <tr><td style="background:linear-gradient(135deg,#0d9488,#06b6d4);border-radius:10px;padding:14px 28px;">
          <a href="https://ft-v1.vercel.app" style="color:#fff;font-weight:700;font-size:15px;text-decoration:none;">Open FinTrack →</a>
        </td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #1f2937;margin:0 0 24px;" />
      <p style="margin:0;font-size:12px;color:#4b5563;">
        You're receiving this because <strong>${email}</strong> subscribed at fintrack.app.<br/>
        <a href="https://ft-v1.vercel.app/unsubscribe?email=${encodeURIComponent(email)}" style="color:#0d9488;text-decoration:none;">Unsubscribe</a> at any time.
      </p>
    </td></tr>
  </table>
</body></html>`;
}

// ── Send via Resend ──────────────────────────────────────────────────────────
async function sendViaResend(to: string): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      reply_to: REPLY_TO,
      subject: "Welcome to FinTrack 🎉",
      html: buildHtml(to),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
}

// ── Send via SendGrid ────────────────────────────────────────────────────────
async function sendViaSendGrid(to: string): Promise<void> {
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL },
      reply_to: { email: REPLY_TO },
      subject: "Welcome to FinTrack 🎉",
      content: [{ type: "text/html", value: buildHtml(to) }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid error ${res.status}: ${err}`);
  }
}

// ── Handler ──────────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Parse webhook payload from Supabase database webhook
    const body = await req.json();

    // Support both database webhook format and direct call format
    const email: string | undefined =
      body?.record?.email ?? body?.email;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing email in payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (RESEND_API_KEY) {
      await sendViaResend(email);
    } else if (SENDGRID_API_KEY) {
      await sendViaSendGrid(email);
    } else {
      console.warn("[send-newsletter-welcome] No email API key configured — skipping.");
      // Return 200 so the webhook doesn't retry
      return new Response(
        JSON.stringify({ skipped: true, reason: "No email service configured" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, sent_to: email }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[send-newsletter-welcome]", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
