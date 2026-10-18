# Perfect day as 3 meals + more biotin food data

## 1. Three meals everywhere
- Each food in Build your meal gets a **Meal** label: Breakfast, Lunch or Dinner (a small selector per row; new foods default to the last one used). Older saved meals all count as one meal, so nothing changes for them.
- **Perfect day** builds three balanced meals (roughly a third of the calories each), labels each food, and the search scores each meal as well as the whole day. Supplements go with breakfast as now.
- **Nutrition Analysis** works out absorption per meal and adds the three together. Per-meal limits (the B12 uptake limit, inhibitors such as tea or phytate in that meal) then only affect their own meal. The bars show the whole day.
- The meal table groups foods under Breakfast / Lunch / Dinner with calories per meal.
- Result: the B12 that reached green in Perfect day also shows green in the analysis.

## 2. Biotin food search
- Look for national food tables with lab-measured biotin that we're allowed to reuse, for example Japan's food composition tables (biotin for over 1,000 foods), the Danish Frida database, the UK tables (McCance & Widdowson), Swiss tables and Germany's BLS, plus published studies.
- Match only the same food and preparation (raw/cooked/roasted), keep the source country, mark values measured or estimated, cite each source, never invent a value. Never overwrite a value already measured.
- Report how many foods have biotin before and after, and which sources couldn't be used and why (license or no download).

## Technical details
- Add `meal: 0|1|2` to each meal item in `app.js` state and saved workspace (missing = 0). Add `dayTotal()`, which runs `mealFrom` + `clinicalEstimate` per meal group and sums min/max/converted/maxAbsorbed/maxConverted/lines; `analysis()` and `nutrient()` use it.
- `day-planner.js`: items carry `meal`; moves can switch a food's meal; `scaleTo` balances kcal per meal; `planEvaluate` groups by `meal` instead of `i%3`. Update `scripts/test-day-planner.mjs` (3 meals, kcal split).
- Biotin: new rows in `scripts/data/published/biotin.csv` (or one CSV per source merged into it), applied with `apply-published-values.py`; logged in corrections.json.
