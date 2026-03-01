# Technical Troubleshooting & Maintenance — FinTrack

This document logs critical technical issues encountered during development and their resolutions. Use this as a first reference if common service connectivity or asset issues recur.

---

## 1. Network Connectivity (Supabase "Failed to fetch")

### Issue
The application fails to connect to Supabase (e.g., `eocagbloalvidegyxvpv.supabase.co`), resulting in a "Failed to fetch" error during login or data retrieval.

### Root Cause
- **DNS Poisoning/Stale Records**: Some mobile carriers (e.g., Jio) or local campus firewalls return incorrect or stale IP addresses for Supabase domains.
- **Firewall Blocking**: Certain network configurations block the Cloudflare IPs used by Supabase.

### Resolution (Manual Fix)
If DNS is returning the wrong IP (verified via `Resolve-DnsName`), update the local `hosts` file:

1. Open **Notepad** as Administrator.
2. Open `C:\Windows\System32\drivers\etc\hosts`.
3. Add the following line to map the domain directly to the correct Cloudflare IP:
   ```
   172.64.149.246 eocagbloalvidegyxvpv.supabase.co
   ```
4. Save the file and flush DNS:
   ```powershell
   ipconfig /flushdns
   ```

### Future Prevention
- Use **Vercel Edge Proxies** if the issue is widespread (though direct connection is preferred for security).
- Switch to a global DNS like Google (`8.8.8.8`) or Cloudflare (`1.1.1.1`) at the router/adapter level.

---

## 2. Background Video Playback Issues

### Issue
Background videos (Hero, 3D Showcase, Reviews) show a black screen or fail to load on the deployed Vercel site, despite working locally.

### Root Cause
- **Asset Processing**: React build tools (Webpack/Vite) try to process and hash large `.mp4` files.
- **Range Request Failures**: Vercel's static engine sometimes struggles to serve large binary files (30MB+) from the `src/assets` folder due to "206 Partial Content" requirements.
- **Size Limits**: Files exceeding 30MB may trigger throttling or deployment warnings.

### Resolution
**Move assets to the `public/` folder.**
1. Location: `public/videos/*.mp4`
2. Reference: Use absolute paths in the code:
   ```javascript
   export const VIDEO_URLS = {
     heroBg: '/videos/hero_bg_new.mp4',
   };
   ```
3. **Why?** Files in `public/` bypass the build pipeline and are served directly by the web server, which correctly handles the range requests needed for video streaming.

---

## 3. Database Search Path Security

### Issue
Supabase Security Advisor warns that functions should have an explicit `search_path`.

### Resolution
Always set the `search_path` to `public` when creating or altering functions to prevent schema injection attacks:
```sql
ALTER FUNCTION public.your_function_name() 
SET search_path = public;
```

---

## 4. RLS for Log Tables

### Issue
`password_reset_log` or similar audit tables may show "Allow all" policies or no policies, leaking sensitive reset history.

### Resolution
Replace open policies with scoped ones:
```sql
CREATE POLICY "Users can view their own reset log"
ON public.password_reset_log
FOR SELECT
USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
```

---

## 5. RLS Policy Always True on `newsletter_subscribers`

### Issue
Supabase Security Advisor reports: **"RLS Policy Always True"** on `public.newsletter_subscribers`.

The existing `Allow anon insert` policy used `WITH CHECK (true)`, which allows any anonymous user to insert arbitrary rows — bypassing row-level security entirely.

### Root Cause
The original policy was created with an unconditional check, meaning spam, garbage data, or injection attempts could be inserted without restriction.

### Resolution
Replace the permissive policy with a validated one:

```sql
-- Drop the old permissive policy
DROP POLICY IF EXISTS "Allow anon insert" ON public.newsletter_subscribers;

-- Create a restrictive insert policy
CREATE POLICY "Allow anon insert with valid email"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
    AND length(email) <= 254
    AND source IN ('footer', 'hero', 'cta', 'blog')
  );

-- Restrict SELECT to authenticated users viewing their own row
DROP POLICY IF EXISTS "Allow anon select" ON public.newsletter_subscribers;

CREATE POLICY "Allow authenticated select own row"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (email = auth.email());
```

Migration file: `landing-page/supabase/migrations/20260301_fix_newsletter_rls_policy.sql`

Run in **Supabase Dashboard → SQL Editor** or via `supabase db push`.

### Verification
After applying, go to **Database → Policies → newsletter_subscribers** and confirm:
- Policy name is `Allow anon insert with valid email` (not `Allow anon insert`)
- Then refresh the **Security Advisor** — the warning should clear.

**Status (March 2, 2026):** ✅ Migration applied and verified. Security Advisor no longer shows this warning.

---

## 6. CSP `script-src 'unsafe-inline'` Causing Weaker XSS Protection

### Issue
`vercel.json` CSP had `script-src 'self' 'unsafe-inline'` — `'unsafe-inline'` weakens XSS protection by allowing inline `<script>` execution.

### Root Cause
`'unsafe-inline'` was mistakenly added to `script-src` during the media-src video fix (March 1, 2026). CRA's production build outputs only external `.js` files — no inline scripts are ever injected.

### Resolution
Removed `'unsafe-inline'` from `script-src` in `vercel.json`:
```json
"script-src 'self'"
```
`style-src 'unsafe-inline'` is intentionally kept — CSS frameworks (Tailwind, Radix, Framer Motion) inject styles at runtime and require it.

Commit: `8b15006` — *"security: remove unsafe-inline from script-src CSP"*

---

## 7. `updateProfile()` and `changePassword()` Not Saving Data

### Issue
Users could go to their Profile/Settings page, change their name or password, see a success message — but nothing was actually saved. Both functions were stubs.

### Root Cause
Both functions in `AuthContext.jsx` returned `{success: true}` immediately without calling Supabase.

### Resolution
**`updateProfile()`** — now calls:
```js
supabase.from('profiles').update({ full_name, avatar_url, updated_at }).eq('id', user.id)
```

**`changePassword()`** — now calls:
```js
supabase.auth.updateUser({ password: newPassword })
```

Both return real `{success: true}` or `{success: false, error: message}`.
