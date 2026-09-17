# Fix missing iHerb offer + the "send my basket to Amazon" button

## 1. The iHerb link you added is saved but hidden

Your iHerb offer is in the database exactly as you typed it: 16.75 EUR, in stock, verified link, ships worldwide.

It is hidden because of how the site picks shops for a shopper's country:

1. Show shops explicitly listed for the shopper's region.
2. Only if there are none, fall back to shops that ship worldwide.

Amazon.de is listed for Europe, so step 1 succeeds and the worldwide iHerb offer is never reached.

**Fix:** show both — region shops and worldwide shops together, in one list sorted by price. iHerb at 16.75 EUR would then appear and take the "Best deal" badge over Amazon's 19.49 EUR. The "ships internationally" note only shows when every listed shop is a worldwide one.

Offers that are out of stock or not ticked as verified stay hidden (so the Pharmacy24 row stays hidden until you verify it).

## 2. Why Amazon opens a product page instead of a full cart

Short answer to your question: **no, this has nothing to do with affiliate approval.** A pre-filled Amazon cart needs the product's Amazon item number (ASIN) on each offer. The code that builds the Amazon cart link already exists — it just refuses to run when any item in the group is missing that number.

Right now 27 of 33 Amazon offers have no ASIN saved, and 25 of 31 iHerb offers have no product ID. So almost every basket falls back to "open the single product page".

**Fix:**
- Build the Amazon cart link from the items that *do* have an ASIN instead of refusing the whole group, and list the remaining items underneath as individual links with a short note saying why.
- In the admin offer editor, mark the retailer product ID as the field that enables the one-click cart, with a plain hint ("Amazon: the B0… code in the product URL"), and flag Amazon offers that are missing it so you can see what to fill in.
- iHerb, Myprotein and Bulk publish no supported multi-item cart URL, so those groups stay one-product-at-a-time. The basket will say that plainly instead of looking broken.

Result: once an Amazon offer has its ASIN, the basket button really does drop every one of those products into your Amazon cart ready for checkout.

## Technical notes

- `offersForRegion()` in `src/lib/region.tsx`: union region-matching offers with global-shipping offers (deduplicated) instead of local-first/global-fallback; `usedFallback` true only when no region-specific offer is present.
- `multiCartUrl()` in `src/lib/retailerCart.ts`: return `{ url, includedItems, excludedItems }` for Amazon groups, dropping only the items lacking `retailer_product_id` rather than returning null for the whole group; keep the existing null result for non-Amazon retailers.
- `src/routes/basket.tsx` and `UniversalCartDrawer.tsx`: render the transfer button for included items plus an explicit list/notice for excluded ones.
- `src/routes/api/affiliate/cart.ts` already validates ASIN, stock, verified link and Amazon network server-side — unchanged.
- `src/routes/_authenticated/admin.product.$slug.tsx`: retailer product ID hint plus a "needed for one-click cart" warning on Amazon offers missing it.
- Verify on the live product page (Greece/Germany) that Amazon and iHerb both appear, and that an Amazon basket with ASINs redirects to `amazon.de/gp/aws/cart/add.html`.
