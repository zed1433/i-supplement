# Fix Amazon and iHerb cart destinations

## What is happening now

- The green Amazon button correctly reaches Amazon’s official “Add to shopping basket” confirmation page with the right item and quantity. Amazon requires the shopper to press its own **Add to basket** button; an outside website cannot bypass that confirmation or directly modify the shopper’s Amazon account/cart.
- The saved iHerb product URL is currently marked as an Awin link. The site wraps it with the demo Awin merchant ID `12345`, which produces the inactive `awin1.com/closedMerchant.html` page shown in the screenshot instead of opening iHerb.

## Changes

1. **Make the Amazon handoff truthful and complete**
   - Keep the official Amazon multi-item handoff for every item with a valid ASIN.
   - Rename the site button from “Add … to cart” to **“Continue on Amazon”** so it does not imply Amazon’s required confirmation has already been completed.
   - Add a short note that Amazon will show the items and quantities, then requires one confirmation before they enter the Amazon basket.
   - Keep missing-ASIN products clearly listed as separate product links instead of silently dropping them.

2. **Preserve the exact iHerb link entered in admin**
   - Do not send an iHerb product through the generic Awin wrapper when the stored destination is already an iHerb URL.
   - Open the saved iHerb destination itself and preserve its existing path and referral parameters.
   - Only add the configured iHerb referral code when the saved URL does not already contain one; never replace a referral code already supplied by the admin.
   - Keep iHerb as an individual product handoff because it does not provide a supported public multi-item cart URL.

3. **Prevent the same setup mistake**
   - In the offer editor, identify direct iHerb URLs as iHerb destinations even if “awin” was entered as the network.
   - Make the test-link behavior use the same final destination visitors receive, so inactive tracking links are caught before verification.
   - Explain beside the network field that pasted retailer/referral links are preserved.

4. **Verify the real flows**
   - Confirm the Amazon button reaches Amazon’s item-and-quantity confirmation page, then document that Amazon’s own confirmation is the unavoidable final step before checkout.
   - Confirm the iHerb button opens the exact saved iHerb product rather than `awin1.com/closedMerchant.html`.
   - Test both the product-page retailer button and the grouped basket button.
   - Recheck the current consent-provider runtime error during the same browser flow and correct it only if it reproduces.

## Technical details

- Adjust affiliate URL construction so retailer-domain URLs take precedence over a stale or incorrectly selected network label.
- Preserve existing query parameters and add only missing, valid retailer parameters.
- Keep Amazon’s server-side validation for ASIN, stock, verified links, quantities, and marketplace.
- No database schema change is required.
