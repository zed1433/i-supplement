# More biotin data + handle biotin the way the science does

You're right that biotin deficiency is rare: gut bacteria make some biotin, and a mixed diet usually covers the 30 µg AI. The problem is labs rarely measure it, so most foods show "not measured". There are two ways to fix this, and I'd do both.

## 1. More lab-measured biotin (real numbers only)
Check each table's licence first. Only use one if reuse is allowed, and tell you which ones can't be used.
- **UK CoFID (McCance & Widdowson):** biotin for roughly 1,000+ foods, released under the UK Open Government Licence (reuse allowed with credit). This is likely the biggest gain.
- **Danish Frida (DTU):** biotin for many foods, open licence with credit.
- **German BLS 4.0:** now free to download. Check whether its licence allows reuse.
- **Swiss food database:** check whether it has biotin and what its licence allows.

Same rules as before: match only the same food and preparation, keep the source country, mark a different preparation as an estimate, never overwrite a measured value, and log every value with its source.

## 2. Treat biotin honestly when data is missing
- In **Nutrition Analysis**, biotin shows "Partly measured: X of your foods have lab biotin data". Then the bar can be read as a minimum, not a deficiency.
- In **Perfect day**, biotin counts as a goal only when the chosen foods have measured values. If coverage is low, it shows a note ("Biotin deficiency is rare on a mixed diet; data is limited") and doesn't call it a miss.
- No invented values, and no filling gaps from "similar" foods.

## Result
I'll report biotin coverage before and after (it's 306 foods now) and which tables I couldn't use and why.

## Technical details
- New CSVs `scripts/data/published/biotin__uk.csv`, `biotin__dk.csv` (plus DE/CH if licensed), mode `only_unknown`, applied by `apply-published-values.py` in name order. Log to corrections.json.
- Matching uses a name map from each table's English names to our foods, checked by hand for preparation (raw/cooked).
- `app.js`: a per-nutrient count of how many foods in the meal have measured data, shown for biotin. `day-planner.js`: biotin is skipped from scoring when meal coverage is below a set threshold, and a note is added.
- Update `scripts/test-food-profiles.mjs` (biotin status counts, measured values never overwritten) and the source credits.
