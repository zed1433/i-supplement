# Richer alternatives, centred hero, and affiliate-application readiness

Three things: make the "Similar alternatives" strip informative, centre the hero, and add the legal pages reviewers look for before approving affiliate/API access.

## 1. Similar alternatives become real comparison cards

Each alternative card gets:

- The product photo (same image handling as the catalogue, with the branded fallback tile).
- The best verified in-stock price for the visitor's region, plus the retailer name and the value figure (cost per serving or weight-based, matching the rest of the site).
- Three short facts: form, elemental dose per serving, servings per pack.
- A two-line "versus this product" read-out generated from the real data, not written by hand: cheaper or dearer per serving, higher or lower elemental dose, more or fewer servings, and whether it carries third-party certification the current product doesn't (or the other way round). Positives read green, drawbacks read muted.
- The whole card stays a link to that product; nothing is added to the basket from here.

If an alternative has no verified regional offer, it says so plainly instead of showing a price.

## 2. Hero centred

On the home page the eyebrow line, headline, sub-line, the two buttons, the search bar and the trust row all centre on the page, with the search bar centred and capped at a comfortable reading width. Left alignment returns for the catalogue below; nothing else about the page changes.

## 3. Pages an affiliate reviewer expects

- New **Privacy Policy** page: what is collected (email for offers, region preference, basket stored in the browser), that we never take payment, cookies/local storage use, how to unsubscribe, how to request deletion.
- New **Terms of Service** page: the site is an independent comparison and referral service, prices and stock come from retailers and can change, purchases and returns are with the retailer, no medical advice.
- Both linked in the footer next to the existing affiliate disclosure, which already appears at the top of every page too.
- Each page gets its own title and description for search and link previews, and both are added to the sitemap.

Search and filtering are already live and working on the catalogue, so the "reviewer can see it in action" requirement is already met — no change needed there.

## Technical notes

- `AltCard` in `src/routes/products.$slug.tsx` rewritten: uses `ProductImage`, `productImageUrl`, region-aware offer filtering via `offerShipsTo`/`useRegion`, and the shared `valueMetric`. A small local `compareToBase(base, alt)` helper produces the difference lines.
- Hero block in `src/routes/index.tsx` (~lines 266-332) gets centred alignment classes only; state and filtering logic untouched.
- New routes `src/routes/privacy.tsx` and `src/routes/terms.tsx` with `head()` metadata; links added to `SiteFooter.tsx`; both paths added to `src/lib/sitemap.ts`.
- No schema or data changes.
