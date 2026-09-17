# Global legal & compliance foundations

Most of this is already live: the footer has About, Privacy, Terms, Affiliate disclosure and Contact links, the privacy/terms/affiliate pages exist, and retailer prices already carry an "as of" timestamp. This pass adds the missing cookie consent layer, aligns the disclaimer wording, and puts the health disclaimer inside the co-factors module.

## 1. Cookie & consent banner (new)

A slim bar docked at the bottom of every page on the first visit, above the mobile basket bar so it never covers it. Short text explaining that we use essential storage (region, basket, sign-in) and would like consent for optional uses, with a link to the privacy policy and three buttons:

- **Accept all** — all categories on.
- **Reject non-essential** — only strictly necessary storage.
- **Customize** — opens a small panel listing categories with toggles: Strictly necessary (always on, locked), Preferences (region memory), Affiliate/referral measurement, Analytics — then Save choices.

The choice is stored in the browser so the banner never reappears after refresh, with a version stamp so wording changes can re-ask later. Region memory and basket keep working when consent is refused (they are essential to the site working); affiliate-attribution links are only rewritten with tracking parameters when that category is allowed. A "Cookie settings" link in the footer reopens the panel at any time.

## 2. Footer legal links

Already present and working. The privacy page gains explicit mentions of regional analytics and affiliate tracking cookies in its cookie section, and the affiliate disclosure page names Amazon, iHerb and CVS as example retailer relationships.

## 3. Medical disclaimer

Standardize on the requested sentence: "Statements regarding dietary supplements have not been evaluated by the FDA or EFSA and are not intended to diagnose, treat, cure, or prevent any disease. Always consult your physician before starting any supplementation protocol." It appears in the footer compliance block and replaces the shorter note at the bottom of the Essential Co-factors module on product pages and quick views.

## 4. Price timestamp wording

Retailer price timestamps change to the required phrasing: "Prices accurate as of {date/time} and subject to change by retailer." Used on product pages under the retailer comparison, on the compare table and on catalogue cards (shortened form there), rendered after hydration so the date always matches the visitor's clock without a mismatch.

## Technical notes

- New `src/lib/consent.tsx` (context + localStorage key `isupplement_consent_v1`, categories, `useConsent`) provided in `__root.tsx`; new `src/components/suppcheck/CookieConsent.tsx` (banner + Customize panel using existing dialog/switch primitives).
- `SiteFooter.tsx`: add "Cookie settings" trigger; keep existing link row.
- `src/lib/suppcheck.ts`: update `MEDICAL_DISCLAIMER`, `priceAsOfShort`/`priceAsOfLong` strings; consumers pick the change up automatically.
- `SynergyCard.tsx`: swap the trailing note for the shared disclaimer.
- `privacy.tsx` / `affiliate-disclosure.tsx`: content additions only. No schema changes.
