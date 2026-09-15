# Affiliate compliance pass

The site currently shows retailer prices with no affiliate disclosure, no price timestamps, and no "you are going to X" labelling. Those are the things that get comparison sites removed from Amazon, iHerb and eBay programmes. This pass makes the site compliant without changing how it looks or works for visitors.

## 1. Affiliate disclosure (required by FTC / EU rules)

- A site footer on every page with a plain line: "We may earn a commission when you buy through links on this site. Prices and availability are subject to change."
- A short one-line disclosure directly above the retailer buttons on product pages and in the basket, so it is visible where money is involved.
- A dedicated "Affiliate disclosure" page linked from the footer, with the fuller explanation.

## 2. Price honesty

- Every displayed price gets a "Price as of <date/time>" note, taken from when we last refreshed that offer. On cards it is compact ("checked 15 Sep"); on product and compare pages it is the full timestamp.
- Prices that have not been refreshed in more than 24 hours are marked "may be out of date" rather than presented as live.
- Out-of-stock offers are never shown as buyable — this is already the behaviour and stays enforced.
- For Amazon offers specifically, we always show the lowest price the feed gives us for that product, and never a hand-typed price.

## 3. Clear outbound links

- The basket keeps working exactly as now: add anything from anywhere, then decide per retailer. In the basket, items stay grouped by retailer and each group gets a clearly named button — "View on iHerb", "View on Amazon" — that sends you to that retailer with those items ready to check out, so you can take everything from one shop or split across several.
- Links stay visible and honest — no hidden redirects, no tabs opened without the visitor clicking, no automatic background opening from the basket.
- The basket stays an aggregator: it hands the visitor over to each retailer's own checkout, and never takes payment.
- Buy links keep `rel="nofollow sponsored"` and are applied consistently everywhere (cards, product page, compare, basket).

## 4. Email rules

- Offer emails must not contain retailer affiliate links. The email already ends with a link back to the site; we harden it so any retailer link found in a rewritten email is stripped and replaced with a link to our own comparison page.
- The AI rewriting instructions are updated to forbid retailer links and forbid inventing coupon codes.
- Only real offers taken from retailer emails get sent — no invented discount codes anywhere on the site or in mail.

## 5. Brand safety

- The site keeps its own identity: no retailer logos, colours or wording that could make someone think they are on iHerb or Amazon. Retailers are named in plain text only.

## Technical notes

- New `SiteFooter` component rendered in `src/routes/__root.tsx`; new `/affiliate-disclosure` route with its own head metadata.
- Price freshness derives from the existing `merchant_offers.updated_at`; helper `priceAsOf(offer)` in `src/lib/suppcheck.ts`, rendered in `ProductCard`, `products.$slug`, `compare`, `basket`.
- `RetailerActions` button labels become "View on {merchant}" / add-to-basket keeps its own wording; `rel="nofollow sponsored"` audited across all outbound anchors.
- `src/lib/newsletter.server.ts`: tighten the rewrite prompt and add a sanitiser that rewrites any external `<a href>` in generated `body_html` to `SITE_URL`.
- No schema changes.
