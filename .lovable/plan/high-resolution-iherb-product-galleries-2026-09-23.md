# High-resolution iHerb product galleries

## Scope
Upgrade the 50 products from the latest iHerb link batch. Other catalogue products remain unchanged.

## Photo sourcing and quality
- Read each linked iHerb product page’s image set and collect the largest available originals rather than the current small `/s/` thumbnails.
- Save a sharp front-pack image plus useful secondary views for each product, including at least one Supplement Facts or ingredients-label image whenever iHerb provides one.
- Identify the label image from the full gallery rather than assuming it is always the second photo; verify its text is legible at full size before publishing it.
- Do not invent or generate label imagery. If a product has no readable label photo on iHerb, show its other high-quality photos and mark the label image as unavailable rather than displaying a misleading substitute.
- Store copies in the app’s managed media storage so catalogue quality does not depend on iHerb’s thumbnail transforms or hotlink availability.

## Catalogue cards
- Replace the blurry primary images with the high-resolution front-pack photos.
- Add a compact, stable photo carousel to each of these 50 cards, with swipe gestures on phones and arrow controls on larger screens.
- Keep product names, comparison selection, retailer choices, prices, and existing card behavior unchanged.
- Lazy-load secondary images so adding galleries does not make the catalogue slow.

## Product pages
- Replace the single image with a full gallery: large selected image, thumbnails, previous/next controls, phone swiping, and an image counter.
- Label the Supplement Facts/ingredients photo clearly and allow it to open in a full-screen zoom view so small print can be read.
- Use accurate alternative text for front, back, label, and other product views.
- Preserve the existing fallback when an image fails.

## Data and administration
- Add a public-read product-photo collection linked to each product, storing image URL, image type, display order, source, and accessibility text.
- Keep the existing product image field as the primary/front-photo compatibility field for current comparison, basket, and related-product views.
- Add admin controls to review, reorder, replace, or remove gallery photos later.
- Restrict photo changes to administrators; public visitors can only view them.

## Verification
- Confirm all 50 targeted products have a sharp primary photo and every available readable iHerb label photo is included.
- Check a sample across several brands at full zoom to ensure label text is genuinely readable, not merely enlarged blur.
- Test card carousels and product galleries on phone and desktop, including touch swiping, arrows, zoom, keyboard controls, failed images, and long product names.
- Confirm catalogue filtering, comparison selection, retailer buttons, basket actions, and product pages still work without layout shifts or console errors.
- Record this work in the project roadmap during implementation.

## Technical notes
- Current state: the catalogue supports only one `products.image_url`; all 48 products currently marked with iHerb-sourced imagery use iHerb’s small `/s/` image path. The two existing products matched during the 50-link import will be included by their iHerb offers.
- Create a `product_images` table with explicit public read grants, authenticated admin-only write policies, RLS, and service access.
- Prefer iHerb’s high-resolution `/v/` or best available original image variant, then upload validated files into managed storage.
- Use image dimensions plus OCR/readability checks to select label images; image ordering varies by product and cannot be inferred from a fixed index.
