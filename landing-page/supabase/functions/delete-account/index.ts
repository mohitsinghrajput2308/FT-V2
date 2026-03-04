/**
 * Edge Function: delete-account
 * Uses Deno.serve (no imports needed) + raw fetch() calls to Supabase REST API.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const callerJwt = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!callerJwt) return json({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://eocagbloalvidegyxvpv.supabase.co";
    const SERVICE_KEY =
      Deno.env.get("ADMIN_SERVICE_KEY") ??
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      "";
    if (!SERVICE_KEY) return json({ error: "Server misconfiguration: missing service key" }, 500);

    const adminHeaders = {
      "Content-Type": "application/json",
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
    };

    // Verify caller JWT and get userId
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${callerJwt}`,
      },
    });
    if (!verifyRes.ok) return json({ error: "Invalid or expired token" }, 401);

    const userInfo = await verifyRes.json();
    const userId: string = userInfo?.id;
    if (!userId) return json({ error: "Could not determine user ID" }, 401);

    // Delete from all related tables
    const userIdTables = [
      "tfa_attempts", "backup_codes", "totp_secrets", "email_verifications",
      "captcha_verifications", "password_reset_log", "audit_logs", "subscriptions",
      "goals", "bills", "categories", "investments", "budgets", "transactions", "user_settings",
    ];

    for (const table of userIdTables) {
      await fetch(`${SUPABASE_URL}/rest/v1/${table}?user_id=eq.${userId}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
    }

    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: "DELETE",
      headers: adminHeaders,
    });

    // Delete from auth.users — permanently removes user and invalidates all sessions
    const deleteRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: adminHeaders,
    });

    if (!deleteRes.ok) {
      const err = await deleteRes.json().catch(() => ({ message: "Unknown error" }));
      return json({ error: err?.message ?? "Failed to delete auth user" }, 400);
    }

    return json({ success: true });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: message }, 500);
  }
});

