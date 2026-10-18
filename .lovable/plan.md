# Finish the remaining calculator work and judge which formulas are factually correct

## 1. Which formulas are factually correct (delivered first)
You'll get a report that checks every rule from your GitHub calculator, and every rule from the old database, against published research. Each rule gets one verdict:
- **Correct:** it matches published human studies, both in direction and roughly in size.
- **Right direction, wrong size:** the effect is real, but the number is off. The report gives the published range.
- **Not supported:** there's no good human evidence for the rule, or the evidence says the opposite.

Every verdict cites its sources: reviews, EFSA and NIH factsheets, and key studies. Examples of what gets checked: heme vs non-heme iron absorption, phytate on zinc and iron, vitamin C on iron, calcium on iron, zinc to copper ratio, low stomach acid on B12, the 5 g fat rule for vitamins A, D, E and K, the tannin rule, calories absorbed, and the diet type multipliers.

You get the report as a document and as a page in the calculator. No formula changes until you choose.

## 2. Fill food gaps from published tables
- **Phytate, oxalate and tannins:** values from published composition tables (USDA proanthocyanidin and flavonoid databases, Phenol-Explorer, and published phytate and oxalate tables). Every value keeps its citation.
- **Wrong zeros fixed:** soybeans, sesame and any other plant foods where studies show real amounts.
- **Creatine and taurine:** check the current values against the studies. Cooked meat gets values only from published cooked measurements.
- **Chromium, molybdenum and biotin:** from published composition studies where they exist.
- **Magnesium and similar gaps in meats:** filled only from a lab table that measured the same cut.
- **No made-up numbers:** anything without evidence stays "Not measured".
- **Before and after:** you get a coverage report.

## 3. Your 88 foods as "My database" choices
Labeled "My database", next to the USDA and CIQUAL foods.

## 4. Your 29 preparation methods
For example fermented, sprouted, and boiled and drained, added to the preparation list. Each one applies its heat loss and anti-nutrient reduction from your old data.

## 5. Online saving for signed-in visitors
Meals, supplements, blood tests and settings follow a signed-in person across devices, and each person sees only their own data. Visitors who don't sign in keep saving in their browser.

## 6. Phone check
Open every section through the phone menu, check that nothing is cut off or broken, and fix whatever is.

## Technical details
- Formula review: `docs/formula-review.md`, copied to /mnt/documents, plus a "Formula review" section in the embedded app (read-only).
- Gap data: CSV tables with citations in `scripts/data/published/`, merged by `scripts/build-food-profiles.py` with M/Z/B/E/U statuses. A `corrections.json` lists the changed legacy zeros.
- `legacy-db.json` (88 foods with their full profiles, 29 methods) is built from `scripts/data/legacy-supabase/`. Methods are applied in `legacy-rules.js`: anti-nutrient reduction factor, and the thermal factor applied to heat-sensitive vitamins only. Engine formulas stay untouched.
- `calculator_workspaces` table (user_id uuid primary key referencing auth.users, data jsonb, updated_at). It has grants for authenticated and service_role, plus RLS so users can only select, insert and update their own row. The /calculator page reads the session and syncs with the iframe via origin-checked postMessage. The newer copy wins on first sign-in.
- Tests: extend the food-profile and legacy-rules tests. Playwright runs at 390 px and 1280 px.
