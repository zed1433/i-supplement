# Fix "Sign in with Google" error on the admin login

## What's happening

The sign-in button currently sends you straight to Google using the plain database
sign-in call. That path expects Google credentials that this project doesn't hold,
so the login page returns `missing OAuth secret` and you never reach the admin area.

The project already has the managed Google sign-in helper installed — the login page
just isn't using it.

## The fix

1. Switch the sign-in button on `/auth` to the managed Google sign-in helper
   (`lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" })`).
2. Handle the two outcomes it returns: redirected (let the browser go), or an error
   (show it on the card). When it returns a session directly, go to `/admin`.
3. Re-confirm the Google provider is enabled with managed credentials, so no client
   ID/secret setup is needed from you.
4. Verify in the browser that `/auth` loads cleanly and the Google button starts the
   real Google flow instead of erroring.

## Technical notes

- Edit: `src/routes/auth.tsx` — replace `supabase.auth.signInWithOAuth` with
  `lovable.auth.signInWithOAuth` from `@/integrations/lovable/index`.
- Keep the existing session check and `onAuthStateChange` redirect to `/admin`.
- Re-run `supabase--configure_social_auth` with `google` to ensure managed credentials.
- No database, admin-role, or catalogue changes.

## Still yours to do afterwards

Nothing for sign-in. The first account that signs in becomes the site admin.
