# Detailed catalogue and multi-store basket

## Goal
Make every offer lead to the exact matching product page, give each product a detailed classification, move filters into a left rail, and add one SuppCheck basket that groups selected products by retailer.

## User experience

### Catalogue
- Replace the horizontal filter rows with a sticky left-side filter rail on desktop.
- Keep Category, Chemical form, and Certification as separate filter groups with counts, selected states, and a clear-all action.
- On phones, show the same controls in a slide-over filter drawer.
- Keep search and result counts beside the product grid.

### Detailed product classification
- Preserve the broad category for useful filtering and similar-product matching.
- Add a visible hierarchy to every product, for example:
  `Supplements › Minerals › Magnesium › Bisglycinate › Thorne Magnesium Bisglycinate Powder`
- Ensure the final classification segment always contains the full product name.
- Derive filter choices from catalogue data so new products do not require hardcoded filter changes.

### Per-retailer add to basket
- Every product card and product page will show an “Add to basket” action for each retailer carrying that exact product.
- The action stores the exact offer, retailer, quantity, price snapshot, and destination—not only the general product.
- Prevent accidental duplicates while allowing quantity changes and removing individual offers.
- Keep the basket on the device so it survives navigation and refreshes without requiring sign-in.

### Basket page
- Add a dedicated Basket page linked from the header with an item count.
- Group offers into distinct retailer sections: iHerb products together, Amazon products together, Skroutz/pharmacy products together.
- Show product name, retailer, current listed price, quantity, stock state, and exact destination for every item.
- Provide one retailer-specific checkout action per group, plus direct exact-product actions when bulk cart loading is unavailable.
- Clearly disclose that checkout happens on the retailer’s website and that prices or availability can change there.

## Merchant-link behavior
- Audit all 18 current offers across the six products and replace any placeholder, generic, or mismatched destination with the exact live product page.
- Store a retailer product identifier where needed, such as an Amazon ASIN, separately from the destination URL.
- Continue routing outbound commerce clicks through SuppCheck tracking.
- Use Amazon’s supported Add-to-Cart flow to prepare a multi-product Amazon cart when the required product identifiers and affiliate configuration are valid.
- Do not simulate unsupported retailer behavior. iHerb’s public affiliate material exposes tracked product links but no verified public consumer multi-item cart API, while Skroutz’s documented cart APIs are merchant-facing. For those retailers, the basket will keep products grouped and provide exact product links; automatic cart preloading will only be enabled if a supported integration is verified.
- If a retailer cannot accept multiple products in one external cart, offer a safe “Open product pages” sequence rather than claiming the cart is ready.

## Data changes
- Extend offers with the exact retailer product identifier and verified-link status/date.
- Add structured classification fields needed for the hierarchy while retaining the existing broad category.
- Update all existing catalogue rows with detailed classifications and audited exact offer links.
- Keep catalogue data publicly readable and locked against public edits.

## Technical implementation
- Add a reusable basket state module with browser-safe persistence and retailer grouping.
- Add a `/basket` page with unique page metadata.
- Update catalogue cards, product detail pricing rows, the site header, comparison page purchase actions, and the affiliate redirect handler to use exact offers consistently.
- Reuse the existing drawer and button design components for mobile filters and actions.
- Keep dynamic product navigation typed and preserve the current product-detail URLs.

## Validation
- Verify every current offer opens the intended product on its named retailer.
- Verify Amazon receives all selected Amazon items when its supported cart flow is available.
- Verify unsupported retailers never promise a prefilled cart and still open each exact product page reliably.
- Test add/remove/quantity behavior, persistence after refresh, grouping, tracking redirects, empty states, out-of-stock offers, and duplicate prevention.
- Check desktop left-rail layout and phone filter drawer without overlap or clipped controls.
