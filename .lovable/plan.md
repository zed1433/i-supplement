# Your calculator's Supabase connection

## What the code shows
Your calculator's code (the copy from GitHub) has never connected to Supabase. It saves meals, supplements, test results, history and settings only in the visitor's browser. The History page says this itself: "An authenticated Supabase adapter is required for cross-device private history". That online saving was planned but never built.

If you set up a Supabase project for it outside GitHub, the calculator never used it, so it holds none of your calculator data.

## Recommended: save calculator data in this site's backend
Instead of a separate Supabase account, use the backend this site already has:
1. Visitors who sign in get their meals, supplements, test results, history and settings saved online, so they appear on every device.
2. Visitors who don't sign in keep working exactly as now, with saving only in their browser.
3. The first time someone signs in, their browser data is copied to their account, so nothing is lost.
4. Each person can only see their own data.
5. The calculator's screens and formulas stay the same. The History page will say "Synced to your account" instead of "On this device".

## If you have your own Supabase project
Send me its project URL. I'll check what it contains before we decide whether to use it.

## Technical details
- New table `calculator_workspaces` (user_id uuid primary key, data jsonb, updated_at), with RLS so users can read and write only their own row, plus the required grants.
- Add a cloud repository next to `application/repository.js` with the same load/replace/reset interface. The iframe gets the session from the parent page through postMessage, and the parent does the reads and writes with the site's client.
- Merge rule on first sign-in: if the account has no saved data, upload the local data. Otherwise keep the newer copy, based on updated_at.
