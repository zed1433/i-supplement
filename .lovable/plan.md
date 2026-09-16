# Dynamic value, retailer clarity, and catalog polish

## Goal
Refactor catalog cards, product details, quick view, and comparison so value is calculated from real package data, retailer choices are immediately understandable, and co-factor recommendations feel visual and purchasable without overstating testing evidence.

## 1. Add accurate package and catalog data

- Extend each product with admin-editable structured fields:
  - pricing basis: `per serving` or `bulk powder`
  - total servings
  - net weight in grams
  - serving weight in grams
  - one of the four catalog groups: `Vitamins & Minerals`, `Performance & Protein`, `Nootropics & Focus`, or `Longevity`
- Keep these fields publicly readable under the existing product catalog access rules and editable only through the existing secured admin flow.
- Add the fields to product reads, types, the admin product editor, save validation, and bulk import handling.
- Backfill values only where the existing product name and serving text make the value unambiguous. Leave uncertain values empty for admin completion rather than inventing data.
- Assign every existing product to one filter group so nothing disappears. Vitamins, minerals, and multivitamins go to Vitamins & Minerals; sports and structural protein products go to Performance & Protein; explicitly cognition/focus products go to Nootropics & Focus; omega-3, botanicals, probiotics, and other healthy-aging products go to Longevity.

## 2. Replace the fixed 30-serving value calculation

- Remove the current assumption that every container has 30 servings and retire “price per 100 mg” as the universal metric.
- Add one shared value calculator used everywhere:
  - standard products: retailer price ÷ total servings = `Cost per serving` or `Cost per daily dose`
  - bulk powders: retailer price ÷ net grams × 100 = `Cost per 100 g`
  - bulk powders: retailer price ÷ net grams × 5 = `Cost per 5 g scoop`
- Base calculations on the lowest verified, in-stock offer that serves the visitor’s selected region.
- Never compare unlike currencies as if they were equivalent, and hide the metric when required package data is missing.
- Replace the old value helper, sorting behavior, explanatory copy, product-detail values, alternative cards, comparison rows, and SEO descriptions that currently reference cost per 100 mg or a 30-serving assumption.
- Keep elemental-dose information as a clinical fact, separate from the commercial value metric.

## 3. Rebuild catalog product cards for fast scanning

- Keep the existing light clinical design tokens: white cards, slate typography and borders, and emerald savings accents.
- Replace descriptive card copy with up to three compact facts:
  - form or bioavailability
  - total servings when known
  - `Lab tested` only when a published third-party certification exists; otherwise omit this badge as requested
- Present up to three verified, in-stock regional retailer prices side by side. Mark the cheapest comparable offer with a prominent emerald `Best Deal` label.
- Place the dynamic value metric in a subtle gray badge directly beneath the best price.
- Rename the primary action to `Add to Universal Cart`; after adding, show a clear saved state.
- Add concise nearby copy explaining that the Universal Cart groups selected offers by retailer and continues to retailer checkouts through affiliate links.
- Preserve quick view, compare selection, product links, price freshness notes, and mobile 44px touch targets.

## 4. Upgrade co-factor and synergy recommendations

- Keep one reusable module shared by product detail and quick view.
- Rename `Required Co-factor` to `Obligate Co-factor`; retain `Absorption Booster` and `Transporter Balance`.
- Add the matched partner product thumbnail using the existing product-image/fallback system.
- Keep the existing biochemical rationale and timing caution, limited to one or two recommendations.
- For a matched partner with an eligible offer, show `+ Add [Item] to Basket — [lowest price]` and add that exact offer safely.
- If the partner exists but has no eligible offer, keep the existing view-product path instead of implying it is purchasable.
- Preserve the healthcare disclaimer and regional offer filtering.

## 5. Add sticky catalog navigation

- Replace the current utility quick-filter row with the requested sticky horizontal group control:
  - `All`
  - `Vitamins & Minerals`
  - `Performance & Protein`
  - `Nootropics & Focus`
  - `Longevity`
- Make selection update the catalog instantly with the existing animated layout behavior and no page reload or scroll jump.
- Keep the detailed category → nutrient → chemical-form sidebar as the next filtering layer, scoped to the selected group.
- Retain search, certifications, price filters, sorting, reset behavior, mobile filter sheet, and region selection.

## 6. Validate the full shopping flow

- Verify desktop and mobile catalog layouts, sticky filtering, animated product movement, long product names, and missing-data states.
- Test standard-product and bulk-powder formulas against known sample values.
- Verify multi-store cards choose the correct best deal, respect region/stock/verification, and never compare different currencies incorrectly.
- Test Universal Cart additions from catalog cards and co-factor recommendations through the retailer-grouped basket and outbound affiliate checkout links.
- Check product detail, quick view, comparison, admin editing, and bulk import for the new fields.
- Run focused type checks/tests and browser checks with no console, hydration, or route errors.

## Technical notes

- Schema changes apply to the existing `products` table; no new public table is required.
- The dynamic pricing helper will return a typed label/value pair so every surface renders identical wording and arithmetic.
- Existing retailer prices remain offer-level data. Package size and serving count remain product-level because each catalog product represents one SKU/container.
- Unknown structured values remain nullable and produce no misleading value or servings badge.
