# Make the bulk importer read your iHerb CSV

## Why it fails right now

You can see two problems in your screenshot:
1. **Wrong separator.** Your file separates values with semicolons (`;`). The importer only looks for commas, so each line is read as one big value. That's why every row is blank and shows 0 EUR.
2. **Different column names.** Your file uses `title`, `product_url`, `item_id`, `portion_size` and `image_url`. The importer expects `product_name`, `url`, `retailer_product_id` and so on.

## What changes

- **Separator detection:** the importer works out whether a file uses commas, semicolons, tabs or pipes. It also handles quoted text that spans several lines, like your supplement facts.
- **Matching your column names:** each column in your file is linked to the field the importer expects:
  - `title` → product name (brand prefix and size are removed from the name, e.g. "Nutricost, L-Theanine, 200 mg, 120 Capsules" → "L-Theanine 200 mg")
  - `product_url` → link (your referral code NBO7379 is added if it's missing and never overwritten)
  - `item_id` → retailer product id
  - `portion_size` → serving size, `total_servings` → servings
  - `brand`, `price`, `currency` → used as they are
  - `source` = "iHerb" → merchant iHerb, sold directly with no Awin wrapper, ships worldwide
  - `image_url` → main photo, `certifications` → certifications
- **Filled in automatically:** form (capsules, softgels, powder and so on) and category come from the product title. Products the importer can't place get "Other" so you can fix them later.
- **Matching column list:** the column list on the page shows which of your columns were recognised and which were ignored.
- **Large files:** 2,048 rows are sent in batches of about 200, with a progress counter. Products already in the catalogue get their iHerb offer updated instead of being added twice.
- **Rows that need attention:** rows with no price or link are skipped and listed so you can see why. They never show up as €0.00.

## Your file (checked)

- There are 2,048 different products. Every one has a price in EUR and an iHerb link that already carries your NBO7379 code.
- The brands with the most products are NOW Foods (362), California Gold Nutrition (194), Nutricost (116), Life Extension (96) and Swanson (95).
- After the fix I'll run your file through the importer to test it, then you import it from the admin page. Each product's ingredients, directions and warnings text will be kept with it so it can be shown later.

## Technical details

- Reuse `parseCsv`/`detectDelimiter` from `src/lib/csv.ts` in `admin.import.tsx` and remove the local comma-only parser.
- Add a header alias map and title parser for the brand prefix, dose, count and form, plus a keyword-based category guess using the existing category paths.
- Extend `importCatalogRows` (zod schema) with optional `image_url` and `certifications`. Upsert by (merchant, retailer_product_id) and fall back to the URL. Call it in chunks from the client.
- Keep the existing rcode append rule and the direct iHerb network handling.
