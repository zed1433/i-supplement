# Bring your old Supabase calculator's data and formulas into the site

All 18 tables and 6 functions arrived. Your calculator on GitHub never used this project. It's an older, separate version.

## What's in it
- **88 foods** with what the current calculator lacks: phytate, oxalate, tannins, lectins, fiber and the heme share of iron, plus about 8,000 nutrient values.
- **Cooking:** 29 preparation methods (for example boiled and drained, fermented, sprouted, pan-fried) with how much heat destroys and how much of the anti-nutrients they remove. Also 4 cooking styles with how much of each nutrient group survives.
- **Absorption rules:** phytate and oxalate blocking iron, zinc, magnesium and calcium; vitamin C boosting iron; calcium blocking iron; mineral competition.
- **Diet rules:** for example carnivore needs more potassium, keto more sodium, high-protein more B6 and magnesium.
- **31 daily targets** and **74 nutrient definitions** with base absorption and conversion rates.
- **Your personal history:** 1,461 daily meal entries, 367 meal logs and 1 saved meal.

## Something I found
Your current calculator already has phytate and oxalate rules. They never take effect, because none of its foods carry phytate or oxalate numbers. Your old data has them, which would switch those rules on for beans, grains, spinach and similar foods.

## What I'll build
1. **Side-by-side comparison first.** A short report, nutrient by nutrient, showing where the old and current formulas agree and differ. Nothing in the results changes until you choose.
2. **Anti-nutrient values for matching foods.** Phytate, oxalate, tannin and lectin values go to the matching foods in the calculator, so the existing rules start working. Each value is marked as coming from your old database.
3. **Your 88 foods as their own choices,** labeled "My database", next to the USDA and CIQUAL foods.
4. **More preparation methods.** Your 29 methods, such as fermented, sprouted and boiled and drained, get added to the preparation list, with their heat and anti-nutrient effects.
5. **A diet type setting** (standard, carnivore, keto, high-protein, high-carb) that raises daily targets using your rules, and shows the reason for each.
6. **Under 5 g fat warning** for vitamins A, D, E and K, plus the **calories actually absorbed** figure, both taken from your old function.
7. **Your history,** if you want it: your 1,461 meal entries and your saved meal imported into your account, so they show up on the History page.
8. **Online saving for anyone who signs in,** so meals, blood tests and settings follow them across devices. Visitors who don't sign in keep saving in their browser.

## Your call
- Should items 2 to 6 change results right away, or only after you've seen the comparison? By default they wait for the comparison.
- Should your old meal history be imported (item 7)?

## Technical details
- Reference data gets converted into static JSON under `public/bio-calculator/` (`legacy-db.json`) by a build script, in the same pattern as `extra-foods.json`. It's public and read-only, with no database tables.
- The new rules live in a separate tested module (`legacy-rules.js`). Verbatim engine files stay untouched. The adapter in `clinical-absorption.js` gets `totalPhytatesMg`, `totalOxalatesMg` and `coingestedTannins` from food data. This is a change to the site-specific adapter only, not the engine part.
- Personal rows (meal logs, presets) are never put in public files. Item 7 imports them into the signed-in user's `calculator_workspaces` row.
- `calculator_workspaces` table (user_id uuid primary key, data jsonb, updated_at): grants, RLS limited to own row, newer copy wins on first sign-in, iframe and parent talk via postMessage.
- The old unprotected functions (`bulk_insert_daily_logs` and SECURITY DEFINER functions without user checks) are not copied.
