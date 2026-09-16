# SuppCheck: Clinical Insights

Build a production-grade supplement comparison and clinical biochemistry intelligence platform named "SuppCheck". Use Next.js (App Router), Tailwind CSS, Lucide-react icons, and a Supabase backend.

The platform must prioritize clinical transparency over marketing claims, contrasting elemental yields, carrier molecules, third-party certifications, and multi-retailer live prices across European and US merchants (iHerb, Amazon.de, Skroutz/Linkwise pharmacies).

### 1. Database Schema & Architecture (Supabase / PostgreSQL)

Create the schema and seed realistic clinical data for at least 6 products (e.g., Thorne Magnesium Bisglycinate, Seeking Health Magnesium Malate, Pure Encapsulations Magnesium Glycinate, Doctor's Best Magnesium Lysinate Glycinate, Now Foods Magnesium Citrate, Life Extension Neuro-Mag Threonate):

- `brands`: id (uuid), name (text), country_of_origin (text), website_url (text).

- `products`: id (uuid), brand_id (fk), name (text), slug (text, unique), category (text, e.g., 'Magnesium', 'Vitamin B-Complex', 'Omega-3'), form (text, e.g., 'Powder', 'Capsules', 'Liquid'), serving_size (text), verified_advantages (text[]), trade_offs (text[]), excipients (text[]), third_party_certifications (text[], e.g., 'NSF Certified for Sport', 'Informed Sport', 'USP Verified', 'None').

- `ingredients`: id (uuid), name (text), chemical_form (text), elemental_ratio (numeric), mechanism_of_action (text), target_benefits (text[]), potential_side_effects (text[]), contraindications (text[]), upper_tolerable_limit (text).

- `product_ingredients`: id (uuid), product_id (fk), ingredient_id (fk), gross_amount_mg (numeric), elemental_amount_mg (numeric), percent_daily_value (numeric), bioavailability_score (text, e.g., 'High', 'Moderate', 'Poor').

- `merchant_offers`: id (uuid), product_id (fk), merchant_name (text), country_flag (text), price (numeric), currency (text), shipping_cost (numeric), affiliate_target_url (text), in_stock (boolean), updated_at (timestamptz).

### 2. Homepage (`/`) — Discovery, Live Search & Category Filtering

- Dark-mode, high-density dashboard theme (`bg-neutral-950` with slate/zinc cards and emerald active accents).

- **Hero Section**: Clean heading ("Clinical Lab-Verified Supplement Comparison"), subtext, and a fast real-time Search Bar with instant autocomplete filtering by brand, product name, or chemical form.

- **Dynamic Category & Form Pills**: Multi-select pills to filter products:

  - By Category: All, Magnesium, Thiamine/B-Complex, Omega-3, Electrolytes.

  - By Specific Chemical Form: Bisglycinate / Glycinate, Malate, L-Threonate, Citrate, Oxide, Taurate.

  - By Certification: NSF Certified for Sport, Informed Choice, Non-GMO.

- **Product Catalog Grid**: Cards displaying brand, product name, elemental yield per serving, primary clinical benefit, starting price across stores, and a direct "Compare / View Details" link.

- **Multi-Select Comparison Drawer**: Allow users to tick "Add to Compare" on any 2 to 4 product cards. When selected, a bottom floating bar appears with a "Compare Selected Products" button that routes to `/compare?ids=uuid1,uuid2`.

### 3. Product Detail Page (`/products/[slug]`)

- **Header**: Brand origin, title, packaging spec, and interactive third-party certification badges with tooltip explanations.

- **Clinical Advantages & Trade-Offs Box**: Side-by-side green and amber callouts highlighting actual bioactivity vs filler compromises.

- **Multi-Store Price Comparison Table**:

  - Compares prices from iHerb, Amazon, and EU pharmacies.

  - Displays base price, estimated delivery, in-stock status, and a prominent "Go to Store" button that routes through an internal redirect handler (`/api/affiliate/redirect/[offerId]`) dynamically attaching tracking parameters.

- **Interactive Biochemical Facts Table**:

  - Displays Gross Compound (mg) vs quantified Elemental Active (mg) and % DV.

  - Collapsible mechanism breakdown explaining pharmacokinetic pathways (e.g., peptide channel absorption avoiding osmotic laxative effects vs cheap oxide/citrate).

  - Explicit documentation of gastrointestinal tolerance, side effects, and renal contraindications.

  - Full packet excipient and inactive additive disclosure list.

- **"Similar Alternatives" Carousel**: Displays other products sharing identical active forms with differing price-per-elemental-gram yields.

### 4. Side-by-Side Comparison Engine (`/compare`)

- Accept product IDs via URL search params (e.g. `/compare?ids=...`) or let users pick products from dropdown selectors.

- Render a sticky, side-by-side matrix contrasting:

  1. Primary Form & Elemental Yield per single serving.

  2. Cost Per 100 mg Elemental Active (normalized price calculation).

  3. Chelation Integrity / Carrier molecule (Albion TRAACS bisglycinate vs buffered oxide mixes).

  4. Excipient Transparency (presence of magnesium stearate, silicon dioxide, artificial sweeteners).

  5. 3rd-Party Heavy Metal & Potency Assays.

  6. Lowest live merchant price and direct checkout button.

### 5. Redirect Engine (`/api/affiliate/redirect/[offerId]`)

- Server-side route handler that retrieves the target URL and network type from Supabase, formats the affiliate deep link wrapper (Awin for iHerb, Amazon Tag for Amazon), and executes a clean HTTP 302 redirect.

Make all components responsive, type-safe (TypeScript), and fully styled with Tailwind CSS. Ensure mock data in Supabase includes accurate biochemical details for the seeded magnesium products.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://i-supplement.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3a22ec09-24a9-45ec-9881-3eb081d306ce).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
