# Five staple supplement comparison pages

## Goal

Add five dedicated, search-friendly comparison pages — creatine, whey protein isolate, magnesium, vitamin D3 + K2, and omega-3 — each with a short buying guide, a value comparison table on desktop, cards on phones, and retailer buttons that carry the correct referral codes.

## 1. The five pages

New pages at clean addresses, each with its own title, description and social preview text:

- `/compare/creatine-monohydrate` — Compare Creatine Monohydrate & Creapure Prices in Europe | i-Supplement
- `/compare/whey-protein-isolate`
- `/compare/magnesium-glycinate-malate`
- `/compare/vitamin-d3-k2`
- `/compare/omega-3-fish-oil`

Each page: one H1 naming the supplement, a two-sentence buying guide above the table explaining what actually matters for that formulation (Creapure purity and grams per scoop; isolate protein percentage and cost per 30 g serving; elemental magnesium per serving and glycinate vs malate; D3 IU paired with K2 MK-7 mcg; combined EPA + DHA per serving, not total fish oil), a search box and filter bar, then the comparison table.

Which products land on each page is decided by matching the existing product category and name — no data migration. Magnesium picks up glycinate/bisglycinate and malate products, vitamin D3 + K2 lists D3 and K2 products side by side and flags which ones already combine both.

Whey protein isolate has no products in the catalogue yet, so that page ships with a clear "we're verifying offers for this category" state plus a link to the rest of the catalogue. Once you add whey products through the admin tools they appear automatically.

## 2. Comparison table

Desktop shows a scannable table, one row per product:

- image, product name, brand, and form (capsules, powder, softgels, liquid)
- active dose per serving — elemental magnesium, EPA/DHA split, D3 IU + K2 mcg, creatine grams, protein grams
- price per serving and price per 100 g, whichever the product's package data supports
- retailer offers with current price, in-stock status, and a "Check price" button per retailer

On phones the same rows render as the existing product cards so nothing gets squeezed. Missing package data hides the affected number rather than guessing it. A sticky top row keeps the column headings visible while scrolling.

## 3. Retailer links

The referral handling already exists and stays: iHerb keeps your saved rewards code, Amazon routes to the shopper's regional storefront with your Associates tag, Myprotein and Bulk carry their referral parameters, and Awin-network shops go through the Awin redirect. All codes remain editable without touching code at **Admin → Settings**.

Two fixes in this work: every merchant button on the new pages opens in a new tab and is marked as a paid link for search engines, and an Amazon offer saved with only a product ID gets a correct `amazon.de/dp/...` destination built for it.

## 4. Navigation and SEO

- The five pages get a row of links in the site header/browse page so people and crawlers can reach them.
- All five are added to the sitemap.
- Each page carries structured data describing it as a product comparison list, plus breadcrumbs.
- Existing affiliate disclosure, price-freshness note, and medical disclaimer appear on each page.

## Technical notes

- One route file per category under `src/routes/compare.*.tsx` plus a shared `StapleComparison` component and a `src/lib/staples.ts` definition holding slug, H1, meta text, buying guide, matcher predicate, and the dose column renderer.
- Reuses `productsQuery`, `offersForRegion`, `valueMetric`, `ProductCard`, `RetailerOfferRows`, and the market/currency context — no new data fetching layer and no schema change.
- `RetailerOfferRows` currently adds offers to the basket; the table's "Check price" button uses the existing `/api/affiliate/redirect/$offerId` handoff with `rel="sponsored nofollow"` and `target="_blank"`.
- `redirect.$offerId.ts` gains an Amazon fallback that builds `https://www.amazon.<tld>/dp/<ASIN>` from `retailer_product_id` when no target URL is stored.
- Each route sets `staticData: { sitemap: true }` so it enters `/sitemap.xml` automatically.
- Head metadata changes only reach i-supplement.com after the next publish.
