# Compliance pass: Greek law, EU/global rules, retailer programmes

A check of the live site against Greek e-commerce and consumer law, EU rules for comparison sites, and the published terms of Amazon Associates, iHerb, Myprotein and Bulk Supplements. No Shopify is used anywhere, so nothing is needed there.

Everything you can click today stays clickable: all products, retailer buttons and the demo tracking links keep working exactly as they do now.

## Already in place (verified)

Affiliate disclosure at the top of every page and in the footer, the FDA/EFSA health disclaimer, the cookie banner with accept/reject/customise, privacy, terms, about, contact and affiliate-disclosure pages, "As an Amazon Associate, we earn from qualifying purchases", price "last synced" timestamps, named retailer buttons with no hidden redirects, no payment handling, and Greek governing law in the terms.

## 1. Affiliate identifiers become editable settings

The Amazon tracking tags, the Awin merchant/publisher IDs, the Linkwise ID and the iHerb referral code are currently written into the code as made-up demo values. They move into configurable settings with the same demo values as defaults, so nothing changes visually and every button keeps working, but you can swap in your real approved codes the moment each programme accepts you, without touching code.

An admin screen lists each retailer programme, its current identifier, and a plain note saying whether the value is still a placeholder. A small "demo tracking" note appears only in the admin area, never to visitors.

## 2. Legal identity block (Greek/EU requirement)

Greek e-commerce law requires a visitor to be able to identify who runs the site. Since you prefer not to publish a street address, the site will show: trading name, operator country (Greece), a working support email, and a clear line that this is an independent comparison service, not a shop, with no payment taken.

A short note on the contact page explains that full registration details, VAT number and a postal address are supplied on request — and the plan flags that once you register a business, Greek law does require the legal name, address, VAT (AFM) and GEMI number to be published. A consumer ADR/complaints line is added to the terms.

## 3. Comparison-site transparency (EU Omnibus directive)

Comparison and ranking sites in the EU must state how results are ordered and whether payment affects it. A short, permanently visible "How results are ranked" note is added to the catalogue and comparison pages: ranking is driven by elemental yield, chemical form, certification and price; commission never affects position; and the listing covers only retailers we have links with, not the whole market.

## 4. Retailer programme rules

- The affiliate disclosure page currently names CVS, which is not in the catalogue. It is rewritten to name the retailers actually listed: Amazon, iHerb, Myprotein and Bulk Supplements.
- Amazon's programme requires prices to carry their capture time and not be presented as current — the existing timestamp wording is aligned to that and applied everywhere a price appears, including the cart drawer.
- A line is added to the disclosure explaining that stated prices may differ at the retailer's checkout and that the retailer's own page is authoritative.
- Each retailer programme's requirement (disclosure wording, no coupon invention, no trademark misuse in titles/meta, no email affiliate links) is checked against the current pages, and the two email templates are checked to confirm they carry no affiliate links.

## 5. Health-claim wording (EU Reg. 1924/2006)

Benefit and mechanism text is reviewed and softened where it states or implies a health effect that is not on the EU authorised-claims list. Practically: wording moves from promising an outcome to describing the nutrient's established role, keeps the authorised EFSA phrasing where one exists, and drops any disease-related implication. Product ingredient data, dosing and co-factor explanations stay; only the claim phrasing changes. The standard disclaimer stays alongside.

## 6. Cookie consent tightening

The region/currency preference is currently stored before any consent choice is made. It becomes: stored for the session only until the visitor chooses, then persisted if preferences are accepted. Rejecting non-essential keeps the site fully usable. The banner gains a version stamp so future wording changes can re-ask.

## Technical notes

- New `src/lib/affiliateConfig.ts` reading `process.env` values (`AMAZON_TAG_US`, `AMAZON_TAG_EU`, `AWIN_MERCHANT_ID`, `AWIN_PUBLISHER_ID`, `LINKWISE_ID`, `IHERB_RCODE`) with the current demo strings as fallbacks; consumed by `src/routes/api/affiliate/redirect.$offerId.ts` and `src/routes/api/affiliate/cart.ts`. `src/lib/market.tsx` keeps `amazonTag` but sources it from the server config via the redirect route rather than hardcoding.
- Admin settings row in `src/routes/_authenticated/admin.index.tsx` listing configured vs placeholder identifiers (read-only display; values set as secrets).
- New shared `OPERATOR_IDENTITY` block in `src/lib/suppcheck.ts`, rendered in `SiteFooter`, `/contact`, `/terms`, `/about`, `/privacy`.
- New `RankingDisclosure` component rendered on `/` and `/compare`.
- `affiliate-disclosure.tsx`: replace CVS, add retailer list and price-authority paragraph.
- Claim wording: data edit via migration updating `products.primary_benefit`, `verified_advantages`, `trade_offs` and `ingredients.target_benefits` phrasing; no schema change.
- `src/lib/region.tsx` / `market.tsx`: defer localStorage/cookie writes until consent resolves; bump `CONSENT_STORAGE_KEY` handling with a version field.
- Verification: typecheck, public routes 200, Playwright pass over banner, footer identity, ranking note, retailer buttons and cart handoff.
