# Switch the public contact address to contact@i-supplement.com

## Goal
Everywhere the site shows a contact address to visitors, show `contact@i-supplement.com` instead of the Gmail address. Your Gmail address stays exactly as it is for signing in as admin.

## What changes
- The single shared support address becomes `contact@i-supplement.com`. It is used in one place in the code, so the new address appears automatically in:
  - the footer contact line
  - the Contact page
  - the About page
  - the Privacy page
  - the Terms page
  - the operator-identity paragraph (where registration/tax details are offered on request)
- All "email us" links open the new address.

## What stays the same
- The admin allowlist keeps `isupplementsofficial@gmail.com`, so typing that address into the homepage email box still takes you to sign-in and still grants the admin panel. No database change.
- Nothing else about the legal pages, disclosures or layout changes.

## One thing to know about sending
Offer emails are currently sent through your connected Gmail account, so the "from" address on those emails is still the Gmail one — that is set by the mail account, not by the site text. To send from `contact@i-supplement.com`, that mailbox needs to exist on your domain and be connected as a sending identity. Tell me once it does and I will switch the sending side too.

## Technical note
Single edit to `SUPPORT_EMAIL` in `src/lib/suppcheck.ts`; `OPERATOR_CONTACT` and `OPERATOR_IDENTITY` derive from it. Verify with a typecheck and a quick pass over the public legal pages.
