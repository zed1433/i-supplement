# Autonomous catalogue updates, locked admin, and offer newsletters

Three systems, all controlled by you from the admin area, no code changes needed afterwards.

## 1. Daily price and availability sync

- New "Feeds" screen in admin: add one entry per retailer with a name and the CSV/XLSX feed link they give you, plus which columns hold product id, price, stock and URL (saved per retailer, so you set it once).
- A job runs once every 24 hours: downloads each active feed, matches rows to your offers by retailer product id (fallback: product URL), and updates price, currency, stock and "last checked" time. Products that disappear from a feed are marked out of stock.
- Matching never invents links: it only updates offers that already exist. Unmatched rows are listed as "new products found" so you can import them with one click using the existing bulk import.
- Upload fallback: same screen accepts a manual CSV/XLSX drop for retailers that only email files.
- Safety: each run has a size cap, a lock so two runs never overlap, a run history with row counts and errors, and a pause switch. You can also hit "Run now" for one feed.

## 2. Admin locked to one address, everyone else is a subscriber

- Admin rights come from an allowlist, seeded with **isupplementsofficial@gmail.com** only. The current "first person to sign in becomes admin" rule is removed.
- Anyone else can still sign in with Google — they get a normal account and a newsletter subscription, with no access to any admin screen or edit action. Blocked both in the page and on the server.
- An "Admins" screen lets you add or remove admin emails yourself later.

## 3. Retailer offers turned into newsletters

Because sending from a Gmail address needs that account's permission, the site will connect to **isupplementsofficial@gmail.com** through a secure Google connection (you approve it once, in-app, and can swap to another account or a real domain later).

- Once a day the system reads recent messages in that inbox that look like retailer promos (filtered by sender and keywords you control in a settings list, e.g. iHerb, Amazon).
- Each one is rewritten by AI into your own short promo: subject, body, the discount and expiry, and a link into your catalogue.
- The draft lands in a "Campaigns" screen: you edit, preview, and press Send. Nothing goes out without you.
- Sending goes to your subscriber list in small batches, skips anyone unsubscribed, and every email carries an unsubscribe link. Send results (sent/failed) are logged per campaign.

### Testing it without waiting for a real offer

- "Paste a sample offer" box: paste any retailer email text, the system runs the full rewrite and shows the draft — same path as the real thing.
- "Send test to me": sends the campaign to one address only.
- "Scan inbox now" button so you don't wait for the daily run.
- A dry-run mode showing exactly who would receive the campaign and the final rendered email, without sending.

## Notes and limits

- Gmail sending is capped by Google at roughly 500 recipients per day. Fine to start; when your list grows or you buy a domain, the same Campaigns screen can switch to proper bulk sending.
- Feed formats differ per retailer; the column mapping step handles that, but the first feed from each retailer may need one adjustment from you.
- Prices only stay accurate if the feed link stays valid — the Feeds screen shows the last successful run per retailer so a broken feed is visible.

## Technical outline

- Tables: `retailer_feeds` (url, mapping, active, last_run), `feed_runs` (status, counts, errors, lock lease), `admin_allowlist`, `subscribers` (email, status, unsubscribe token), `campaigns` (source message id, draft subject/body, status), `campaign_sends`.
- All new tables: GRANTs, RLS, admin-only writes via `has_role`; subscribers readable only by admins.
- Jobs as `/api/public/cron/*` routes guarded by the cron secret, scheduled with pg_cron; bounded batch, single-flight lease, idempotent progress, pause on repeated failures.
- Gmail read/send via the Google Mail connector through the connector gateway; AI rewrite via Lovable AI (`google/gemini-3.8-flash`).
- Admin gate switches from `bootstrapAdmin` to allowlist-seeded `user_roles`, enforced in `assertAdmin` and the `_authenticated/admin` route.
- Public unsubscribe route; verification with typecheck plus a browser pass over Feeds, Campaigns, dry-run and non-admin lockout.
