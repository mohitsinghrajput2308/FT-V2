# FinTrack — Documentation

This folder holds key project documentation.

| File | Purpose |
|------|--------|
| **SECURITY.md** | **Project must follow this.** Run `node scripts/validate-security.js` before every release (all 17 checks pass). |
| **test_result.md** | Testing protocol and test state (for main/testing agents). |
| **PRD.md** | Product Requirements Document (FinanceFlow 3D landing page). |

**Main product guide:** The full *FinTrack Documentation Guide* (AI-first build guide) stays at the repo root: `../FinTrack Documentation Guide.md`.

**Database migrations:** All Supabase SQL files are in `../supabase/` (run in order: schema → security_patch → multitenant → auth_hardening → 2fa).
