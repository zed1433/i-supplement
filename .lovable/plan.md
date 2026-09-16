# Biochemical Synergies & Essential Co-factors

## Goal
Add an evidence-oriented synergy module to every product detail experience, with useful companion products, timing cautions, and honest basket actions.

## Product experience
- Add a reusable **“⚡ Essential Co-factors & Synergistic Pairings”** card immediately beneath the main retailer purchase area on full product pages.
- Add a catalogue **Quick view** sheet for each product and place the same module beneath its compact price/purchase strip.
- Keep the presentation highly scannable: emerald-accented container, badge, partner name, one-to-two sentence explanation, optional amber/red timing note, and the clinical-advice disclaimer.
- Keep controls at least 44px tall and make the sheet usable on mobile and desktop.

## Synergy matching
- Create a typed lookup in the store data service, matched through normalized category, category path, ingredient name, and chemical-form aliases.
- Cover the supplied mappings for B1, B2, B3, B5/B7, B6, folate, B12, D3, A, E, iron, zinc, magnesium, potassium, calcium, selenium/iodine, curcumin, CoQ10, collagen, and omega-3.
- Store badge type, clinical explanation, partner search aliases, ranking priority, and timing caution separately so each recommendation remains consistent across views.
- Render at most two companion recommendations. Prefer a catalogue product with a verified in-stock offer that ships to the selected region, then another matching catalogue product, and avoid recommending the product already being viewed.
- Do not invent a biochemical claim for current categories absent from the supplied mapping, such as creatine, probiotics, and ashwagandha. Their card will state that no essential co-factor is currently mapped and retain the professional-advice disclaimer.

## Basket and availability behavior
- When a matched partner has a verified regional offer, **Add Co-factor to Basket** adds its best eligible offer and immediately updates the universal basket count.
- When the partner exists in the catalogue without an eligible verified offer, replace basket adding with **View [partner]** linking to its detail page, as requested.
- Never add an unavailable, unverified, or wrong-region retailer offer.
- If several products match a nutrient, rank exact category/ingredient matches first, then select the lowest eligible same-currency offer.

## Quick-view sheet
- Add a clear quick-view icon/action to catalogue product cards without replacing the existing full-detail link or comparison selector.
- Show the product image, name, essential facts, best regional retailer action, synergy module, and a link to the complete clinical breakdown.
- Reuse the same product and basket data already loaded for the catalogue; no second page refresh or duplicate network request.

## Safety and wording
- Preserve the user-supplied biochemical details while avoiding treatment promises or implying personalized medical advice.
- Label pairing types as **Required Co-factor**, **Absorption Booster**, or **Transporter Balance**.
- Show: “Nutrient pairings based on clinical absorption data. Consult your healthcare professional.”
- Keep timing cautions visually distinct and concise; they are informational, not dosing instructions.

## Technical details
- Build one reusable synergy resolver and one reusable presentation component so full-page and quick-view results cannot diverge.
- Keep styling token-based while matching the requested slate/emerald appearance; use the existing Button and Sheet controls.
- Correct the existing product-page hydration mismatch by formatting retailer timestamps in a fixed timezone rather than server/browser-local time.
- Preserve existing affiliate disclosure, retailer redirect, region filtering, comparison, and retailer-grouped basket behavior.

## Validation
- Test mapped aliases and ranking for representative D3, magnesium, iron, zinc, curcumin, B12, collagen, omega-3, and calcium products.
- Verify eligible quick-add, unavailable-partner detail links, no self-recommendations, region filtering, and immediate basket-count updates.
- Check the full product page and quick-view sheet at desktop and mobile sizes, including timing notes, long names, focus/close behavior, and 44px actions.
- Confirm no console, hydration, accessibility, or route errors on catalogue and product pages.
