# Product photos + easier navigation

The catalogue has 38 products and not one of them has a photo stored, which is why every page reads as a wall of text. This plan adds a real picture to every product and makes the site quicker to scan.

## 1. A photo for every product

Sourcing order per product, one product at a time:

1. Search the web for the exact brand + product name and take a clean product shot (prefer the brand's own site or a large retailer).
2. If nothing usable, take the photo from one of the shops we already link to for that product.
3. Only if both fail, generate a neutral studio-style bottle image matching the brand, form and label text.

Each found image is saved to the product record, so retailer feeds can later overwrite it with the shop's own photo automatically (the feed importer already fills the photo field when it is empty — this gets changed to keep a real retailer photo as the preferred one).

A small "generated illustration" note appears under any image we had to create, so nothing is passed off as a real photograph.

## 2. Showing the photos

- Catalogue cards: photo at the top of each card, consistent square frame, brand name and product name under it. All current numbers stay exactly as they are.
- Product page: large photo beside the headline figures.
- Comparison table: a thumbnail at the top of each column so you can tell the products apart at a glance.
- Basket: a thumbnail per line item.
- Graceful fallback: if an image is ever missing or fails to load, a clean branded tile shows instead of a broken picture.

## 3. Easier to navigate (everything stays visible)

- Category shortcuts: a row of the main categories (Magnesium, Omega-3, Vitamin D, Probiotics, Multivitamins…) under the search box, one tap to filter. The long filter list stays as it is for people who want it.
- The current category filter list shows full breadcrumb paths that wrap over four lines each; it gets grouped by top category with short labels, so the sidebar is skimmable.
- Sort control: cheapest, best value per 100 mg, most elemental per serving, A–Z.
- Plain-language labels: short explanation tooltips on "Elemental / serving" and "Cost / 100 mg" so a first-time visitor knows what they mean.
- A one-line "how to read this" strip on the catalogue explaining the two numbers.
- Product pages get a short summary block at the top (what it is, who it suits, best price) above the detailed science sections, which stay in full below.
- Mobile: photos and card layout checked at phone width; filter sheet already exists and stays.

## 4. Removals

- The admin gear icon moves out of the public header (it stays reachable at its address for you) — ordinary visitors do not need it.
- No data or detail is removed anywhere.

## Technical notes

- Fill `products.image_url` for all 38 rows; images fetched and uploaded to a public storage bucket so they are served from our own domain and cannot break when a shop changes its site. Generated fallbacks saved the same way.
- Add an `image_source` marker (`retailer` / `web` / `generated`) so the feed sync only overwrites non-retailer images.
- `ProductCard`, `products.$slug`, `compare`, `basket` get an image element with lazy loading, fixed aspect ratio and alt text (SEO benefit too).
- Sorting and category chips are client-side on the already-loaded catalogue; no extra queries.
- Storage bucket public-read, writes admin/service only.
