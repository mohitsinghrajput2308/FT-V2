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
