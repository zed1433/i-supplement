# Show worldwide shops alongside local ones

## What's happening

Your new iHerb offer saved correctly: price 16.75 EUR, marked in stock, link verified, ships worldwide.

It is hidden because of how the site picks shops for a shopper's country. Right now it works in two steps:

1. Show shops that explicitly list the shopper's country/region.
2. Only if there are none, fall back to shops that ship worldwide.

For this product, Amazon.de is listed for Europe, so step 1 succeeds and the worldwide iHerb offer is never considered. That is why the page sticks to Amazon only.

## The fix

Show both: shops listed for the shopper's region **and** shops that ship worldwide, in one list sorted by price. The cheapest one keeps the "Best deal" label — here that would be iHerb at 16.75 EUR.

The "shipping internationally" note only appears when *every* shown shop is a worldwide one, so it stays meaningful.

Nothing else changes: offers that are out of stock or not marked verified stay hidden (so the unverified Pharmacy24 row remains hidden until you tick its verified box).

## Technical notes

- `offersForRegion()` in `src/lib/region.tsx`: merge region-matching offers with global-shipping offers (deduplicated), instead of the current local-first / global-fallback branch. Set `usedFallback` only when the result contains no region-specific offer.
- All surfaces (catalogue cards, quick view, product page price table, compare, synergy cards, basket) already read through this helper, so they update together.
- Verify on the live product page for Greece/Germany/EU that both Amazon.de and iHerb rows appear and iHerb carries the Best deal badge.
