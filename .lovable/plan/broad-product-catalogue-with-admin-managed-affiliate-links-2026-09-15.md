# Broad product catalogue with admin-managed affiliate links

## Goal

Grow SuppCheck from 6 magnesium products into a broad multi-category supplement catalogue. I research and seed an initial catalogue; you extend it later through an admin panel. Affiliate links ship as placeholders you replace once your affiliate accounts (Amazon Associates, Awin/iHerb, Linkwise/Skroutz, etc.) are approved.

## What this means for affiliate links

- No real affiliate accounts exist yet, so all merchant links are stored as **unverified placeholders** pointing at the best-known product page (or a retailer search page when no exact page is known).
- The existing `link_verified` flag already hides unverified links from the basket and buy buttons — so visitors never see broken or fake "buy" actions.
- When your accounts are approved, you paste the real tracking links into the admin panel, tick "verified", and they go live instantly. No code changes needed.

## Part 1 — Expand the catalogue (I do this)

- Seed a broad catalogue across the key supplement categories, for example:
  - **Minerals:** Magnesium (keep existing 6 + more forms/brands), Zinc, Iron, Calcium, Potassium, Selenium
  - **Vitamins:** D3, K2, B12, B-Complex, C, Multivitamins
  - **Fatty acids:** Omega-3 (EPA/DHA fish oil, algae oil)
  - **Other staples:** Creatine, Collagen, Probiotics, Ashwagandha, Curcumin
- Target roughly 40–60 products to start, each with researched: ingredients, chemical forms, elemental/active amounts, certifications, excipients, advantages/trade-offs, and a detailed `category_path` ending in the full product name.
- 2–4 merchant offers per product across iHerb, Amazon, Skroutz/pharmacies — all marked unverified until you confirm them.
- All data goes in through a migration (schema + literal rows), publicly readable, locked against public edits.

## Part 2 — Admin panel (you use this)

- Sign-in with Google for the site owner, with a roles table so only admins can edit.
- Admin screens to:
  - Add/edit products, brands, and ingredients
  - Add/edit merchant offers: URL, retailer product ID (e.g. ASIN), price, stock, network
  - Mark a link "verified" once you've checked it works — this is the switch that makes a buy button appear for visitors
- Admin pages are private; the public catalogue stays read-only.
- In the admin panel add a way to easily and automatically add all the products by uploading the file catalog of each supplier (it could be a link or a file in excel , I don't really know how they share their products with the affiliate links, bottom line is give me independence from you , so that I can maintain the website without too much work)

## Part 3 — Wire your real affiliate accounts later

- The redirect system already supports per-network tracking (Amazon tag, Awin, Linkwise).
- When you have your accounts, you give me your affiliate IDs (e.g. your Amazon tag) and I wire them in — one small change, then every verified link earns commission.
- Adding new retailers/networks later is a small extension of the same system.

## Technical notes

- New migration: `user_roles` table (admin role), plus catalogue seed rows for all new products/offers. GRANTs included on every new table.
- Auth via the built-in auth page with Google sign-in; admin screens under a protected area.
- Catalogue UI (left-rail filters, product pages, comparison, basket) already scales — filter options derive from the data, so new categories appear automatically.
- Validation: typecheck, then browser check of catalogue, filters across the new categories, product pages, basket, and admin add/edit/verify flow.

## What I need from you (later, not now)

- Your affiliate account IDs when approved: Amazon Associates tag, Awin publisher ID, Linkwise ID.
- The real tracking links per product — paste them into the admin panel and mark verified.