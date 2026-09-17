# Regional fallback, retailer carts, price freshness, and legal contact

## Goal
Keep the catalogue useful in markets without local stock, make retailer selection explicit, let compatible retailers receive grouped baskets, show truthful UTC price freshness, and publish the requested operator details.

## Implementation

### 1. Resolve local and international inventory consistently
- Extend the delivery-region model so Brazil, South Africa, and Nigeria are real destinations rather than aliases for “show every shop.”
- Add one shared offer resolver used by the catalogue, quick view, product detail, comparison, similar alternatives, and synergy recommendations.
- Prefer verified, in-stock offers explicitly serving the selected region.
- If a product has no such local offer, fall back only to verified, in-stock `GLOBAL` offers and label the result clearly as international inventory.
- Show a restrained catalogue-level notice such as “Showing global inventory for this region,” plus merchant-specific copy such as “Ships internationally via iHerb.”
- Preserve “Unavailable” only when neither local nor eligible global stock exists. Never expose unverified or out-of-stock links.

### 2. Replace generic card actions with retailer rows
- Remove the single “Add to Universal Cart” action and the non-interactive merchant price strip from product cards.
- Render every resolved retailer offer as a full-width, minimum-44px action row with cart icon, retailer name, localized price, and a “Best Deal” badge on the lowest comparable offer.
- Clicking a row adds that exact offer, briefly displays “Added to {Retailer} Cart!”, and opens the Universal Cart drawer.
- Keep the quick-view and product-detail icon actions compact beneath the retailer rows.
- Reuse the same retailer-row component in quick-view sheets and relevant product-detail purchase areas so offer ordering, fallback labels, converted-price notices, and add states stay consistent.

### 3. Add an app-wide Universal Cart drawer
- Make drawer state part of the existing basket provider so any retailer action can open it without duplicating basket state.
- Mount one responsive cart sheet globally and group items by normalized retailer.
- Each group will show “{Retailer} Cart ({count} items),” product quantities, localized totals, removal controls, and the affiliate disclosure.
- Keep the full `/basket` page and mobile basket trigger; both will use the same grouping and checkout-link helpers.

### 4. Generate verified multi-item retailer carts
- Use the existing `retailer_product_id` as the ASIN, product ID, SKU, or variant ID and normalize provider detection for Amazon, iHerb, Myprotein, and Bulk.
- Generate these retailer-specific URLs only when every selected item has the identifier required by that retailer:
  - Amazon Multi-ASIN cart, using the selected market’s Amazon domain and configured associate tag.
  - iHerb shared basket using product IDs, quantities, and the configured rewards code.
  - Myprotein basket query using SKU and quantity pairs.
  - Bulk multi-variant cart permalink.
- Validate offer IDs, quantities, retailer compatibility, active stock, and verified-link status in a server function before returning a grouped destination; never trust basket data from browser storage.
- Route Amazon/iHerb grouped links through the same geo and consent rules as individual affiliate links.
- Do not invent missing affiliate codes. If a retailer lacks a valid code, supported URL format, or complete item identifiers, show individual “Open on {Retailer}” links instead.
- Current data has active Amazon.de and iHerb inventory with only some retailer IDs; Myprotein and Bulk have no current offers, so their generators will be ready but dormant until valid offers are imported.

### 5. Show truthful UTC price freshness
- Replace the current short catalogue wording with: “Prices last synced: {date, time UTC}. Prices and availability are subject to change.”
- Derive the displayed time from the actual latest `merchant_offers.updated_at` value for the offers shown; do not fabricate the current time when data was not synced today.
- Show the note beside retailer rows on catalogue cards and beside the comparison strip/table on product details and quick views.
- Keep formatting deterministic during server rendering and hydration by using stored timestamps only; remove render-time clock checks from the formatted label.
- Retain a clear “timestamp unavailable” fallback when no valid sync value exists.

### 6. Publish operator and support details
- Add a shared operator-contact constant: “Operated by i-Supplement (Athens, Greece). Support: isupplementsofficial@gmail.com”.
- Display it visibly in the footer with a working email link.
- Update the Terms contact section and About contact section with the same wording.
- Add a dedicated `/contact` page using the same operator details and link the footer’s Contact item to it, while keeping the email clickable.
- Give the new public page unique title, description, Open Graph metadata, canonical URL, and sitemap inclusion.

## Technical details
- Centralize offer resolution and retailer-cart URL generation to avoid different results between cards, sheets, comparisons, and basket views.
- Preserve currency conversion and selected-language behavior; add translations for new shopper-facing fallback, cart, and freshness labels.
- Use existing semantic colors and button/sheet components; no raw retailer URL is rendered unless it was verified.
- No new product or retailer claims will be invented, and no checkout/payment handling moves onto i-Supplement.

## Validation
- Verify Nigeria first shows explicit global iHerb inventory rather than dead cards, while US/EU/UK continue to prefer their eligible offers.
- Verify retailer rows add the exact offer and immediately open the grouped cart drawer on desktop and mobile.
- Test Amazon/iHerb grouped URLs with complete IDs, and confirm incomplete/Myprotein/Bulk groups use individual safe links.
- Check catalogue, quick view, product detail, comparison, basket, Terms, About, Contact, and footer at desktop and mobile widths.
- Confirm UTC freshness wording matches stored offer timestamps, no hydration/runtime errors occur, and all public routes have required metadata.
