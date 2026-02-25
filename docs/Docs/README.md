# FinTrack — Website

**Focus: Website first.** Secure finance tracking web application.

## Run the website

```bash
cd landing-page
npm install
npm start
```
Open http://localhost:3000

## Run security tests

```bash
cd landing-page
npx craco test --watchAll=false
```
60 tests covering input validation, sanitization, XSS detection, and data integrity.

## Deploy to Vercel

Security headers (CSP, HSTS, X-Frame-Options, etc.) are configured in `vercel.json`.

## Before release

```bash
node scripts/validate-security.js
```

## Structure

- **landing-page/** — Full web app (CRA + React): landing + dashboard + auth
- **supabase/** — Database migrations (schema, security patches, migration_002, migration_003)
- **docs/** — SECURITY.md (v4.1), TROUBLESHOOTING.md, PRD, FOLDER_STRUCTURE, test_result
- **scripts/** — Security validation scripts
- **vercel.json** — Deployment config with security headers
