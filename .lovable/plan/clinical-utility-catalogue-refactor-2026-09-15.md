# Clinical Utility catalogue refactor

## Goal
Turn the public shopping experience into a light, fast, highly scannable supplement catalogue for US and European shoppers, while preserving the existing clinical data, comparison flow, retailer basket, affiliate disclosure, and category drill-down.

## Plan

### 1. Region detection with a one-time confirmation
- On a visitor’s first visit, infer the likely region from browser language/locale only; do not use IP lookup or track location.
- Map supported locales to United States, United Kingdom, Germany, Greece, Rest of EU, or “show every shop.”
- Show a compact first-visit region prompt with the suggested region, a confirm action, and an immediate region picker when the suggestion is wrong or unavailable.
- Save the confirmed choice in a first-party cookie so it survives future visits; retain compatibility with the current saved preference during migration.
- Keep “Deliver to” in the sticky header so visitors can change region at any time. A manual choice always overrides inference and immediately refreshes eligible offers and prices.

### 2. Light Clinical Utility design system
- Replace the current dark laboratory palette with a light slate canvas, white product surfaces, dark high-contrast text, clinical green for verified/best-price states, and restrained amber/red status colors.
- Apply the updated semantic tokens consistently across the catalogue, header, product details, comparison page, basket, footer, prompts, empty/error states, and shared controls.
- Preserve the existing type families and clinical tone while removing decorative noise and keeping borders crisp and restrained.

### 3. Sticky shopping header and quick filters
- Rework the sticky header into a compact utility bar with brand, always-accessible catalogue search, region selector, compare link, and cart icon with live item count.
- Keep the affiliate disclosure directly below the header.
- Add a horizontally scrollable quick-filter row: **Top Ranked**, **Third-Party Verified**, **Lowest Price**, and a region-aware **Under $25 / €25 / £25** label.
- Make quick filters work alongside search, category, nutrient, chemical-form, certification, and sort controls without page reloads or scroll jumps.
- Define “Top Ranked” transparently from existing verification and clinical-quality fields, rather than inventing reviews or ratings; make “Lowest Price” activate price sorting.

### 4. Catalogue layout and product cards
- Use a four-column desktop grid, responsive intermediate layouts, and a two-column mobile grid on a light canvas.
- Redesign each card around a centered product image on a subtle gray 8px tile, an uppercase category/form label, and a two-line product title.
- Add a compact retailer price strip that highlights the cheapest eligible in-stock, verified regional offer in green and lists competitor prices with currencies clearly shown.
- Show an honest unit-value metric from available data, using cost per 100 mg elemental where servings-per-container data is unavailable rather than presenting an invented per-serving price.
- Retain compare selection, certification signals, basket actions, product details, availability rules, price timestamps, and verified affiliate redirects in a denser, more scannable hierarchy.
- Ensure mixed-currency offers are never presented as directly comparable without conversion data.

### 5. Mobile shopping flow
- Give all tappable controls a minimum 44px target, including filters, quantity controls, card actions, region confirmation, and navigation.
- Keep filter chips horizontally scrollable and use the existing mobile filter sheet for deeper category and certification choices.
- Add a mobile-only sticky basket/checkout trigger showing item count and estimated total; on the basket page it takes the visitor to retailer-group checkout actions rather than implying that i-Supplement processes payment.
- Prevent the sticky basket trigger and existing compare tray from overlapping by giving them coordinated states and safe bottom spacing.

### 6. Validation and content polish
- Update catalogue metadata to reflect shopping for lab-tested supplements across US and European retailers, without making unsupported medical or testing claims.
- Verify catalogue filtering, region confirmation/override, price eligibility, basket persistence, compare selection, outbound retailer actions, and empty/error states.
- Check desktop and mobile layouts for two/four-column behavior, 44px controls, non-overlapping sticky elements, legible two-line titles, and working product images.
- Run focused type checks and browser tests with reduced-motion behavior respected.

## Technical notes
- Primary areas: global semantic tokens, region provider/prompt, site header, catalogue route, product card/image, retailer actions, basket page/provider, and affected public detail/comparison surfaces.
- No database migration or external geolocation service is required.
- Existing product and offer records remain unchanged; ranking and quick filters use current clinical, certification, price, stock, verification, and region fields.
