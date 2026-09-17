# Owner Access, Affiliate Settings & Admin Email Shortcut

## Goal
Make it easy for you to sign in, edit products, paste your real retailer affiliate IDs, and get sent straight to the admin panel when you type your own email into the signup box — while every other email still gets the offers.

## How it works today
- Sign in at `/auth`, then manage everything under `/admin`: products, brands, ingredients, bulk import, retailer feeds, campaigns, subscribers.
- `/auth` currently only offers Google sign-in.
- Affiliate IDs live in server settings with demo values; there is no screen to change them.

## Changes

### 1. Admin email shortcut on the signup box
- When the email typed into the "Get retailer deals by email" box matches an address on the admin allowlist, do not subscribe it. Instead show "Admin account — opening sign-in" and send you to `/auth` (then straight to `/admin` once signed in).
- Any other email subscribes exactly as it does now.
- The check runs on the server against the allowlist, so the list of admin addresses is never exposed in the browser.

### 2. Email sign-in option on `/auth`
- Add email + password sign-in alongside the existing Google button, so you can get in either way.
- Both routes land on `/admin` when the account has the admin role.

### 3. Discreet "Admin" link in the footer
- So you can always reach sign-in without remembering the URL.

### 4. Affiliate settings screen in `/admin`
- New section listing each programme: Amazon (US/EU/UK/BR tags), Awin, Linkwise, iHerb code, Myprotein, Bulk Supplements.
- Paste your real ID, press Save. Stored in the backend settings table; redirect and cart links read saved value first, then environment variable, then demo default — so links never break.
- Each row shows "Demo" or "Configured" with a masked preview; values are never fully echoed back.

### 5. Products
- No new work needed: product/brand/ingredient editing and CSV import already exist at `/admin` and `/admin/import`. I will verify both still work end to end.

## Technical notes
- Files: `src/lib/automation.functions.ts` (`subscribeEmail` returns `adminRedirect: true` for allowlisted addresses before inserting), `NewsletterSignup.tsx`, `src/routes/auth.tsx`, `SiteFooter.tsx`, new `src/routes/_authenticated/admin.settings.tsx`, `src/lib/affiliateConfig.ts` (settings-table lookup), `src/lib/affiliate.functions.ts` (admin-checked load/save).
- Affiliate values stored in `app_settings` (client access already denied); writes go through an admin-role-checked server function.
- Verify: typecheck, admin-email signup redirect, normal email still subscribes, save an affiliate ID and confirm a redirect uses it, edit a product.
