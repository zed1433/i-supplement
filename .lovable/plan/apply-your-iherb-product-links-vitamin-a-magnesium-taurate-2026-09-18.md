# Apply your iHerb product links (Vitamin A → Magnesium Taurate)

## What you gave me and what happens

Your list contains **46 unique links** across 17 sections (Vitamin A 5, B1 3, B2 3, B3 4 after removing the one duplicate, B5 4, B6 3, B7 1, B9 4, B12 4, C 2, D3 3, E 1, K2 MK-7 4, MK-4 2, Magnesium Glycinate 3, Malate 3, Taurate 1). L-Theonate had no links — it stays empty until you send that section. Nothing from earlier partial messages is applied; only this list is used, as you chose.

Every link is stored **exactly as you pasted it**, with `?rcode=NBO7379` appended when missing. The site-wide iHerb rewards code is also saved as `NBO7379`, so any future iHerb link without a code gets it added automatically — and a code you already included is never overwritten.

## How the links are placed in the catalogue

1. **Exact match to an existing product** (e.g. Doctor's Best High Absorption Magnesium, Seeking Health Magnesium Malate powder): the product's iHerb offer is updated to your exact link, verified, and ships worldwide.
2. **Everything else becomes a new catalogue product** — each pasted link is one product with its real brand (NOW Foods, Thorne, Nutricost, Solgar, Micro Ingredients, Carlson, Swanson, etc.), name, size and form taken from the link itself. New brands and nutrient/form entries (Vitamin A, B1, B2, B3, B5, B6, B7, B9, E, MK-4, Magnesium Taurate…) are created so they appear correctly in the category drilldown.
3. Each product gets an iHerb offer marked as a **direct iHerb link** (no Awin wrapping), verified and shipping worldwide, so it shows up in every region alongside Amazon.

## Prices and photos (no invented numbers)

Before saving, each iHerb page is fetched once to read its **real current price and product photo**. Those real values go into the catalogue. Any page that can't be read gets its offer held back (hidden, like unverified offers are today) rather than showing a made-up €0.00 — those few appear in your admin product list flagged "price needed", and go live as soon as a price is set.

## Cleanup

- Existing generic iHerb search-page links (`iherb.com/search?kw=…`, unverified) stay untouched — they are already hidden and will be replaced section by section as you send the rest of your list.
- Your links use `gr.iherb.com` — that exact destination is preserved, path and referral intact.

## Verification

- Redirect check: an iHerb button 302-redirects to your exact saved URL with `rcode=NBO7379` present.
- Product page: iHerb row shows with real price, "Best deal" badge where cheapest, ships-worldwide listing alongside Amazon.
- Catalogue: new products appear under the right category drilldown (e.g. Vitamins → Vitamin B9 → L-Methylfolate) with photos.
- No console errors; sitemap picks up new product pages.

## Technical notes

- One migration inserts all new brands, ingredients, products, product-ingredient links and offers, with scraped prices/images embedded as literal values.
- `app_settings` gains `IHERB_RCODE = NBO7379`; `src/lib/affiliateConfig.ts` already resolves it and the redirect route already appends `rcode` only when absent — no code change needed there beyond confirmation.
- New iHerb offers set `affiliate_network = 'direct'` so the admin editor recognises them as direct iHerb destinations.
