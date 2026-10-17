# Expand the calculator's foods with lab-measured data

Every food keeps its source, so the same food from different countries stays separate. Soil and farming change nutrient levels, so we keep each version instead of averaging them.

## Sources
- **USDA FoodData Central (US)**: same source as your 87 foods. Lab-analysed whole foods, plus branded products.
- **CIQUAL (France, ANSES)**: about 3,000 European foods, free to use with credit.
- **Greek/EU tables**: the Hellenic food composition data (Greek and Mediterranean dishes) and other EU national tables, where the licence allows reuse. If a Greek table can't legally be reused, I'll tell you before adding it, not swap in made-up numbers.
- **Branded packaged foods**: USDA Branded Foods plus Open Food Facts (EU products). These numbers come from the pack label, not a lab, and get a "Label data" badge.

## What you'll see in the calculator
- A new **Region** switch (Europe / Greece / USA / All). Europe shows European and Greek foods first, then the rest.
- Food filters for **Origin** (Greece, France/EU, USA) and **Type** (whole food, traditional dish, branded product), next to the current category filter.
- Each food shows a small source badge, e.g. "CIQUAL 2020 · France · lab measured".
- The same food from two countries shows as two choices, e.g. "Spinach, raw (EU)" and "Spinach, raw (US)".
- Your 87 existing foods, formulas and screens stay as they are. Nothing is removed.

## How foods get added
1. **Big batch now**: about 1,000 to 1,500 common whole foods and Greek/Mediterranean dishes across the three sources, plus a starter set of common EU branded products.
2. **Search and add**: a "Search more foods" box searches USDA and Open Food Facts live. Picking a result adds it to your food list with its source badge.

## Needed from you
- A free USDA FoodData Central key (sign up at api.data.gov, takes a minute). I'll ask for it in a secure box when we get there. Search works in a limited test mode until then.

## Technical details
- New `foods` table in Lovable Cloud (public read, admin write) with source, country, region, type, license, measured-or-label flag and nutrients per 100 g, mapped to the engine's existing nutrient keys and units. Each nutrient keeps its source record ID and unit.
- One-time import scripts per source (USDA FDC Foundation/SR Legacy/FNDDS, CIQUAL XML, Greek table, Open Food Facts) that convert units and skip foods missing energy or macros. Mapping is tested against known values (e.g. USDA chicken breast 165 kcal / 31 g protein).
- Server route that proxies USDA and Open Food Facts search, keeps the key server-side, and saves picked foods.
- The embedded app loads the 87 canonical foods plus the database foods. Region, origin and type filters are added to `public/bio-calculator/app.js` and the language files (EN/ΕΛ). Calculation engine stays unchanged.
- Extend `scripts/test-calculator.mjs` with unit-conversion and region-order checks.
- Source licences and credits added to the calculator page and About page.
