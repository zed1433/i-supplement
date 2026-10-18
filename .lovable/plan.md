# Fill the food data gaps, finish the remaining calculator features, and test everything

## Your questions answered

**What the tannin threshold means.** Your formula only has a yes/no switch, "tannins eaten with this meal". It has no amount. Your foods now carry tannin amounts in milligrams, so I had to pick the amount where the switch turns on. I picked 50 mg, because a published iron study (Brune, 1989) found that even small amounts of tannins (about 5 to 25 mg of their active part) clearly reduce iron absorption. A cup of tea has about 100 to 200 mg. Your formula itself stays the same.

**Did I change your formulas?** No. The absorption math is copied exactly from your GitHub calculator. I only changed what gets fed into it:
- Meat portions are now treated as meat. Before, they were treated as plant food.
- Phytate, oxalate and tannin amounts from the foods now reach your existing rules.
- The 50 mg tannin switch point described above.

"Side-by-side report of your old formulas" means comparing your **old Supabase** formulas with your **current GitHub** formulas. Nothing changes from that report unless you choose.

**Old meal history:** won't be imported, as you asked.

## What I'll build

1. **Fill anti-nutrient gaps from published tables.** Phytate, oxalate, tannins and lectins get added from published sources: USDA flavonoid and proanthocyanidin databases, Phenol-Explorer, and peer-reviewed phytate and oxalate tables. Every value keeps its source. Values that come from a closely matching food are labeled "Estimated".
2. **Fix wrong zeros from your old database.** Plant foods where published studies show real amounts (for example soybeans and sesame for oxalate) get the published value. Every fix is listed in a correction report.
3. **Creatine and taurine.** Check the current values against the studies and fix any that don't match. Cooked meat gets values only where a published cooked-meat measurement exists. Otherwise it stays "Not measured".
4. **Chromium, molybdenum and biotin.** Add values from published composition studies where they exist (for example USDA biotin research and published molybdenum and chromium surveys), with sources. The rest stay "Not measured".
5. **Missing common minerals in meats.** Fill magnesium and similar gaps only from another lab table measuring the same cut (USDA for the matching cut, labeled with its source and country). With no measured match, the value stays "Not measured".
6. **Side-by-side formula report** (old Supabase compared with current), shown as a page you can read.
7. **Your 88 old foods** as "My database" choices.
8. **Your 29 preparation methods** added to the preparation list.
9. **Diet type setting** (standard, carnivore, keto, high-protein, high-carb) that raises daily targets, with the reason shown.
10. **Under 5 g fat warning** for vitamins A, D, E and K, and a **calories actually absorbed** figure.
11. **Online saving for signed-in visitors.** Visitors who don't sign in keep saving in their browser.
12. **Full feature check.** Test every calculator section in a browser on desktop and phone: all 9 menu sections, adding and removing foods, search, filters, region, preparation, supplements, blood tests, history, targets, health conditions, language switch, food popup, live search and saving. Fix whatever breaks, then send you a short report.

You'll get a coverage report showing, for each value, how many foods are measured, estimated or not measured, before and after.

## Technical details
- Gap filling extends `scripts/build-food-profiles.py`. New source tables go in `scripts/data/` with citations, and the M/Z/B/E/U statuses are kept. Corrections are logged in a generated `corrections.json`.
- Verbatim engine files and `clinical-absorption.js` formulas stay untouched. New rules (diet modifiers, fat warning, absorbed kcal, preparation methods) live in a tested `legacy-rules.js`.
- `legacy-db.json` holds the 88 foods and 29 methods. The formula report is generated from both sources.
- `calculator_workspaces` table (user_id primary key, data jsonb, updated_at) with grants and RLS limited to the user's own row. The embedded app and the page talk via postMessage. No legacy history import.
- Tests: extend `test-food-profiles.mjs`, `test-calculator.mjs` and `test-clinical-absorption.mjs`. Playwright runs across all sections at 1280 and 390 widths.
