# Front page rewrite + disclosure at the top

The three hero directions never reached you — the design step was cut off before it rendered. Rather than re-run it, here is the concrete direction I'd build, and the disclosure move you asked for.

## 1. Affiliate disclosure moves to the top

- A slim, always-visible disclosure strip sits directly under the site header, on every page: "We might earn a commission when you buy through our links. Prices and stock come from the retailers."
- It links to the full disclosure page.
- It stays quiet visually (small text, subtle background) so it doesn't fight the headline, but it is above the fold on both phone and desktop.
- The footer keeps a short version too, which is normal practice.

## 2. New hero copy and feel

Current headline reads like a comparison tool. New version ends on supplements and sells the outcome:

- Eyebrow: "Lab-verified. Every batch, every claim."
- Headline: "Find and buy the best lab-tested supplements."
- Sub-line: "One place for what actually works, at the best price we can find — real elemental doses, real third-party testing, no marketing claims."
- Two clear actions: "Browse supplements" (scrolls to the catalogue) and "How we verify" (explains the testing standard).
- The search bar stays, but reads as the main way in, with a wider field and a friendlier placeholder ("Search magnesium, vitamin D, omega-3…").

## 3. Trust strip instead of a wall of text

Under the hero, a single row of four short proof points with icons, no paragraphs:

- Third-party tested
- Elemental dose shown
- Live retailer prices
- One basket, any retailer

## 4. Visual treatment

- Warmer, health-forward accent alongside the existing clinical dark base — so it reads "get on top of your health", not "spreadsheet".
- Larger headline scale, more breathing room, product photos pulled slightly higher so images appear immediately on scroll.
- Category chips stay, but sit below the trust strip so the hero stays clean.

## Technical notes

- New `AffiliateNotice` component rendered in `src/routes/__root.tsx` under `SiteHeader`, sourcing the existing `AFFILIATE_DISCLOSURE` text from `src/lib/suppcheck.ts`.
- Hero and trust strip edited in `src/routes/index.tsx` (lines ~237-298); category chips and drilldown logic unchanged.
- Page `head()` title and description updated to match the new positioning.
- No data, basket, or pricing logic changes.