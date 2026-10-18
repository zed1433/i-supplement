# Supplements: calculate each form on its own, and let the meal affect them

## What's wrong now
- When two forms of the same nutrient are taken (e.g. magnesium oxide + glycinate), the calculator picks the form with the bigger dose and applies its rate to the whole supplement amount. The smaller form is ignored.
- Some forms carry a fixed absorption figure (e.g. "benfotiamine ~3.6× thiamine"). That figure comes from fasting studies, so it shouldn't stay the same when the meal contains phytate, tannins, calcium, little fat, or when the gut is impaired.

## Changes
1. **Each supplement line is calculated separately.** Every supplement you add (its form and dose) gets its own absorbed and bioactive amount. The nutrient total is the sum of foods plus each supplement line. The detail popup lists each line ("Magnesium oxide 200 mg → x mg absorbed; glycinate 100 mg → y mg").
2. **Supplements behave like food in the meal.** A form's advantage is applied as a *relative* factor on top of the base nutrient rate (for example "glycinate ≈ 2× oxide"). The same meal effects then apply as they do to food:
   - inhibitors: phytate, oxalate, tannins, calcium on iron, high zinc on copper, fibre on carotenoids, a low-fat meal for vitamins A, D, E and K, low stomach acid, gut conditions, biomarkers (ferritin);
   - enhancers: vitamin C on iron, fat on fat-soluble vitamins.
   
   **Each form reacts to the meal in its own way.** The same meal can block one form, boost another, and leave a third alone. So every meal effect gets its own size for each form, in a form-by-effect table, for example:
   - non-heme iron salts (sulfate, fumarate, gluconate): fully blocked by coffee/tea, phytate and calcium, and boosted by vitamin C; iron bisglycinate is partly protected from phytate (Layrisse 2000), and heme iron polypeptide is barely affected by these;
   - calcium carbonate needs stomach acid and food; calcium citrate doesn't (Recker 1985);
   - free (crystalline) B12 doesn't need stomach acid to be released, while food B12 does;
   - magnesium oxide vs organic salts, zinc oxide vs gluconate/picolinate with phytate, and the fat-soluble forms (oil, dry, micellised, liposomal) against meal fat get researched too.
   
   Each cell is either a cited number, "same as the base nutrient" when the study shows no difference, or "no form-specific data". With no data, the form gets the base nutrient's meal effect, with a visible note. A boost is never invented (for example vitamin C on magnesium) without a study.
3. **Shared limits are shared.** Limits that apply to the whole meal are worked out across food and all supplements together, not per line: the ~1.5 µg intrinsic-factor B12 cap per meal, iron and calcium dose saturation, and the per-meal fat effect. Each line then gets its share.
4. **Conversion per form.** Each line keeps its own conversion to the active form (folic acid vs 5-MTHF, D2 vs D3, natural vs synthetic vitamin E, beta-carotene vs retinol, K1 vs MK-7), still reduced by the meal and conditions.
5. **Highest possible bar:** the faded bar uses the same per-line maths with no inhibitors and a healthy gut.
6. **Form table review:** forms currently stored as fixed absolute rates are converted to relative factors against the base nutrient, with the source noted. Any whose source only gives a fasting figure says so.
7. **Supplements change the needs for other nutrients, per form.** Taking a supplement can raise or lower what you need of other nutrients. This moves only the optimal range of the affected nutrient, never the RDA, scaled to the dose taken, and the card says why. A research pass covers every form, for example:
   - vitamin D3/D2 → magnesium (used to activate vitamin D) and vitamin K2 context;
   - high-dose zinc → copper (zinc over ~40–50 mg/day causes copper deficiency);
   - folic acid vs 5-MTHF → B12 (folic acid can hide B12 deficiency);
   - high-dose calcium → magnesium balance; high-dose iron → zinc;
   - niacin (nicotinic acid vs niacinamide) → methyl donors (choline, folate);
   - high-dose B6 forms, vitamin E → vitamin K, creatine → methylation load, and others found in the research.
   
   Each effect is a cited number, or listed as "known effect, no reliable number, not applied". Forms of the same nutrient can differ (for example nicotinic acid vs niacinamide). These rules live in one table so new forms can be added later.
8. **"Perfect day" button.** In the Meal builder, pick a calorie amount and press the button. It fills in a random full day of foods where every nutrient's absorbed and bioactive amount lands in its optimal range. It takes into account your sex, age, weight, activity, diet type, conditions, biomarkers and the meal effects above. Each press gives a different day.
   - Portions are realistic sizes, spread across meals, using whole foods by default.
   - If no combination of foods can hit every range at that calorie amount, it says so plainly. It names the nutrients that fell short or went over, and shows the closest day it found.
   - If a condition makes a target impossible to reach from food (for example folate in thalassemia, or B12 with no intrinsic factor), it names the condition and the nutrient it blocks, and links to the supplement comparison.
   - Supplements are only added if you tick "allow supplements".

## Checks
- Perfect day: a normal 2,000 kcal profile gets a day within range; 800 kcal reports what falls short; total stomach removal reports B12 as blocked.
- D3 dose raises the magnesium optimum, and zinc 50 mg raises the copper optimum (where a cited number exists).
- Magnesium oxide 200 mg + glycinate 100 mg gives oxide part + glycinate part, not 300 mg at one rate.
- Benfotiamine with a high-tannin, high-phytate meal and low stomach acid absorbs less than benfotiamine alone, but still more than plain B1 in the same meal.
- Iron sulfate loses more to phytate than iron bisglycinate.
- Coffee/tea in the meal lowers iron sulfate but not heme iron polypeptide.
- Two B12 supplements together still share one 1.5 µg active-uptake cap.
- Calcium carbonate drops with low stomach acid; calcium citrate doesn't.
- Browser check of the detail popup listing each supplement line.

## Technical details
- `app.js`: replace `suppForms()` (max-dose pick) with a per-line list `suppLines[key] = [{name, form, bio, amount}]`; the engine's `value.supplement` total stays for display.
- `clinicalEstimate()` (both copies, kept identical): loop over food parts plus each supplement line; run `evaluateEntericBioavailability` per line with the full meal context; B12 saturation computed once on the meal total and split pro rata; returns `lines[]` for the popup.
- `evaluateEntericBioavailability`: `formOverride.abs` replaced by `rel` (relative to base), applied before meal modifiers; each meal modifier reads a per-form factor from a `mealEffects` map on the form row (e.g. `{phytate:0.5, caffeine:1, vitC:1}`), falling back to the base nutrient factor with a note. Caffeine/coffee gets tracked as a meal input for iron.
- `supplement-forms.js`: convert `abs` rows to `rel` with citations; add cited `mealEffects` per form. Update `docs/formula-review.md` and `scripts/test-bar-scale-forms.mjs`.
- Supplement → need rules: `SUPPLEMENT_NEED_RULES` in `need-conditions.js` (per form, dose-scaled, cited), applied in `optimalRange()` of `target-model.js`.
- Perfect day: new `day-planner.js` running in a Web Worker. It starts from a random greedy fill, then does a local search over foods and portions, scoring distance from each absorbed/bioactive optimal range at ±5% calories. It reports infeasible and condition-blocked nutrients separately.
- `roadmap.md` gets these tasks on approval.
