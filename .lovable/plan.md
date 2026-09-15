# Fix "Check inbox now", show original vs rewritten, and add a self-test panel

## 1. Why the button looks dead

The inbox check only looks at the 10 newest messages from the last 3 days and then keeps
only those whose sender or subject matches a small hard-coded retailer word list. On a busy
inbox that almost always ends with zero drafts, and the only feedback is a small toast that
disappears — so the button appears to do nothing. If the email account refuses the request,
that error is also only shown as a fleeting toast.

Fixes:

- Search the promotions/offers part of the mailbox over the last 30 days, up to 50 messages,
  instead of the newest 10 of everything.
- Keep a retailer list you can edit (names such as iHerb, Amazon, MyProtein) instead of a
  fixed hidden list; if the list is empty, every promotional-looking message is considered.
- Replace the toast with a result panel that stays on screen: how many messages were read,
  how many became drafts, how many were skipped and why, plus the exact error text if the
  mail account rejects the request.
- Show a spinner and disable the button while it runs, so a slow run does not look frozen.

## 2. Original next to the rewritten version

Each draft card gets two columns: the original retailer message on the left (sender, date,
subject, text) and your rewritten version on the right. You read both, pick the ones worth
sending, and press send — no inbox needed. Cards get a "Looks good" / "Discard" pair so the
list stays clean, and sending is one button per draft with the recipient count on it
("Send to 143 subscribers").

## 3. Testing everything without waiting for a real offer

A new "Check everything works" panel at the top of the offer-emails screen runs each piece
once and prints a pass/fail line per item:

- email account connected, and which address it is
- inbox search reachable (how many messages it can see)
- AI rewriting works (rewrites a built-in sample offer)
- subscriber list size
- test send: enter any address, receive the real email with the unsubscribe link
- price/stock update: runs one retailer file and reports rows read and updated
- nightly schedule: shows when each job last ran and its result

Every line shows the real error text when it fails, so nothing fails silently.

## Technical notes

- `scanInboxForOffers` in `src/lib/newsletter.server.ts`: query becomes
  `newer_than:30d -in:chats (category:promotions OR <retailer terms>)`, limit 50, and it
  returns a per-message outcome list (`created` / `skipped: not promotional` /
  `skipped: already imported` / `error`) instead of only counts. Store the original sender,
  date and cleaned text on the campaign row (`raw_excerpt` already exists; add
  `source_from`, `source_date` columns via migration with GRANT + RLS as existing tables).
- Retailer terms stored in a new `settings`-style row or reuse `cron_config`; edited from
  the People/Settings admin screen.
- `scanInboxNow` returns the outcome list; `admin.campaigns.tsx` renders it in a persistent
  panel, and draft cards render original vs rewritten side by side.
- New `runSelfTest` server function (admin-only) in `src/lib/automation.functions.ts`
  performing the checks above, each wrapped so one failure does not abort the rest.
- Verification: `bunx tsgo --noEmit`, then a signed-in browser pass over `/admin/campaigns`
  exercising the self-test panel, a pasted-sample draft, dry run and a test send.
