# Multi-currency and multi-language support

Let shoppers pick their market once and see the whole site in their language and currency, with outbound retailer links sent to the right country store.

## 1. Market selector in the top bar

A single control in the header showing flag, currency and language, e.g. `🇺🇸 USD ($) · English`.

Markets offered:

- United States — USD ($) — English
- Europe — EUR (€) — English, German, French
- United Kingdom — GBP (£) — English
- Brazil — BRL (R$) — Portuguese
- South Africa — ZAR (R) — English
- Nigeria — NGN (₦) — English

Also keep a Spanish option for shoppers who want it. The choice is saved on the device (and in a first-party cookie) so it survives refreshes, is guessed from the browser language on the first visit, and can always be changed manually. This extends the existing "deliver to" region setting rather than adding a second competing control: picking a market also sets which retailers are shown.

## 2. Prices in the chosen currency

- A small conversion service holding rates relative to USD, refreshed from a free exchange-rate endpoint once a day and cached; if the fetch fails, built-in fallback rates are used so prices never disappear.
- Converted prices appear everywhere: catalogue cards, Best Deal strip, retailer comparison rows, cost-per-serving and cost-per-100 g badges, co-factor "add to basket" buttons, product page, compare page, and basket totals.
- Numbers are formatted the local way: `$19.99`, `€18,50`, `R$ 98,50`, `£16.99`, `R 349,00`, `₦28.500`.
- Converted figures are labelled as approximate, with the retailer's own currency shown on the retailer link, since the retailer charges in its own currency. This keeps the site compliant with retailer pricing rules.

## 3. Language switching

A translation dictionary covering English (default), Portuguese, Spanish, French and German. Translated surfaces: navigation, search placeholder, filter pills (Vitamins & Minerals, Performance & Protein, Nootropics & Focus, Longevity), card badges (Best Deal, verified, out of stock), basket actions and empty states, consent banner buttons, and footer link labels. Product names, brand names and clinical text stay in their original language; legal/medical disclaimer text stays in English with a translated heading, since the certified wording is required verbatim.

## 4. Country-aware outbound links

- iHerb links get the selected country and currency appended.
- Amazon links go to the regional domain matching the selected market (amazon.com, amazon.co.uk, amazon.de, amazon.com.br) with the matching associate tag, falling back to OneLink-style routing where no regional tag exists.
- Links still respect the cookie-consent choice: no click reference is attached when affiliate measurement was rejected.

## 5. Fix along the way

The basket context currently errors during server rendering on some entries ("useBasket must be used inside BasketProvider"); this gets fixed as part of the header work.

## Technical notes

- New `src/lib/market.tsx`: market definitions (country, currency, locale, allowed languages, Amazon domain/tag), persistence in `localStorage` + cookie, and a provider that supersedes/wraps `RegionProvider` mapping each market onto an existing `RegionCode`.
- New `src/lib/currency.ts`: rate table, daily refresh through a server function with cached fallback, `convert()` and `formatMoney(value, currency, locale)`.
- New `src/lib/i18n.tsx`: typed dictionary per language plus a `useT()` hook; no external i18n dependency.
- Update `formatPrice` and `valueMetric` consumers in `suppcheck.ts`, `ProductCard`, `ProductQuickView`, `RetailerActions`, `SynergyCard`, `MobileBasketBar`, `compare.tsx`, `products.$slug.tsx`, `basket.tsx`, `index.tsx` to run values through the active market.
- Extend `buildAffiliateUrl` in `src/routes/api/affiliate/redirect.$offerId.ts` to accept `country`/`currency` query parameters (validated against the known market list) and rewrite Amazon/iHerb destinations accordingly; `consent.tsx`'s href helper passes them.
- Header selector replaces the current region `<select>`; region prompt copy reuses market labels.
- Verify with typecheck plus browser checks of catalogue, product, basket in at least USD/English and BRL/Portuguese.
