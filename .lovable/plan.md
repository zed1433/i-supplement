# Owner Access, Affiliate Settings & Product Editing

## Goal
Give the owner a simple way to sign in (email or Google), manage products, and paste real retailer affiliate IDs from an admin settings screen — replacing the demo values without touching code.

## How it works today (no change needed)
- Sign in at `/auth`, then manage everything under `/admin`: products, brands, ingredients, bulk import, retailer feeds, campaigns, subscribers.
- Admin rights come from your account's admin role in the backend — your existing account already has it.

## Changes

### 1. Email sign-in option on `/auth`
- Add email + password sign-in/sign-up alongside the existing Google button.
- Keep Google sign-in untouched. Both lead to `/admin` if the account has the admin role.

### 2. "Admin" entry point
- Add a discreet "Admin" link in the site footer (goes to `/auth`, then `/admin`).

### 3. Affiliate settings screen (new `/admin` section)
- Form listing each programme: Amazon (US/EU/UK/BR tags), Awin, Linkwise, iHerb rewards code, Myprotein, Bulk Supplements.
- Values stored in the backend `app_settings` table; the redirect/cart routes read settings first, then environment variables, then demo defaults — so links keep working at every stage.
- Each field shows its current status: "Demo" or "Configured" (masked preview, never the full value echoed back).
- Saving requires admin role (enforced server-side).

### 4. Product editing reminder
- No new work: product/brand/ingredient editing and CSV import already exist at `/admin` and `/admin/import`; the plan only verifies they still work end-to-end.

## Technical notes
- Files: `src/routes/auth.tsx`, `SiteFooter.tsx`, new `src/routes/_authenticated/admin.settings.tsx`, `src/lib/affiliateConfig.ts` (add settings-table lookup), `src/lib/affiliate.functions.ts` (add save/load mutations).
- Email auth uses the existing Lovable Cloud auth — no new providers.
- RLS: `app_settings` writes go through an admin-checked server function (table already denies client access).
- Verify: typecheck, sign-in flow, save an affiliate ID, confirm a redirect uses it, edit a product.
