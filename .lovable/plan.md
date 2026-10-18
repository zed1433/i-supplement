# Supplements: calculate each form on its own, and let the meal affect them

## What's wrong now
- When two forms of the same nutrient are taken (e.g. magnesium oxide + glycinate), the calculator picks the form with the bigger dose and applies its rate to the whole supplement amount. The smaller form is ignored.
- Some forms carry a fixed absorption figure (e.g. "benfotiamine ~3.6× thiamine"). That figure comes from fasting studies, so it shouldn't stay the same when the meal contains phytate, tannins, calcium, little fat, or when the gut is impaired.

## Changes
1. **Each supplement line is calculated separately.** Every supplement you add (its form and dose) gets its own absorbed and bioactive amount. The nutrient total is the sum of foods plus each supplement line. The detail popup lists each line ("Magnesium oxide 200 mg → x mg absorbed; glycinate 100 mg → y mg").
2. **Supplements behave like food in the meal.** A form's advantage is applied as a *relative* factor on top of the base nutrient rate (for example "glycinate ≈ 2× oxide"). The same meal effects then apply as they do to food:
   - inhibitors: phytate, oxalate, tannins, calcium on iron, high zinc on copper, fibre on carotenoids, a low-fat meal for vitamins A, D, E and K, low stomach acid, gut conditions, biomarkers (ferritin);
   - enhancers: vitamin C on iron, fat on fat-soluble vitamins.
   
   Exceptions are kept only where research shows the form is protected, each cited, for example: iron bisglycinate is less affected by phytate (Layrisse 2000); calcium citrate doesn't need stomach acid (Recker 1985); free (crystalline) B12 doesn't need stomach acid to be released; liposomal or fat-free-ready forms only where a study gives a number. Without evidence, the form gets the full meal effect.
3. **Shared limits are shared.** Limits that apply to the whole meal are worked out across food and all supplements together, not per line: the ~1.5 µg intrinsic-factor B12 cap per meal, iron and calcium dose saturation, and the per-meal fat effect. Each line then gets its share.
4. **Conversion per form.** Each line keeps its own conversion to the active form (folic acid vs 5-MTHF, D2 vs D3, natural vs synthetic vitamin E, beta-carotene vs retinol, K1 vs MK-7), still reduced by the meal and conditions.
5. **Highest possible bar:** the faded bar uses the same per-line maths with no inhibitors and a healthy gut.
6. **Form table review:** forms currently stored as fixed absolute rates are converted to relative factors against the base nutrient, with the source noted. Any whose source only gives a fasting figure says so.

## Checks
- Magnesium oxide 200 mg + glycinate 100 mg gives oxide part + glycinate part, not 300 mg at one rate.
- Benfotiamine with a high-tannin, high-phytate meal and low stomach acid absorbs less than benfotiamine alone, but still more than plain B1 in the same meal.
- Iron sulfate loses more to phytate than iron bisglycinate.
- Two B12 supplements together still share one 1.5 µg active-uptake cap.
- Calcium carbonate drops with low stomach acid; calcium citrate doesn't.
- Browser check of the detail popup listing each supplement line.

## Technical details
- `app.js`: replace `suppForms()` (max-dose pick) with a per-line list `suppLines[key] = [{name, form, bio, amount}]`; the engine's `value.supplement` total stays for display.
- `clinicalEstimate()` (both copies, kept identical): loop over food parts plus each supplement line; run `evaluateEntericBioavailability` per line with the full meal context; B12 saturation computed once on the meal total and split pro rata; returns `lines[]` for the popup.
- `evaluateEntericBioavailability`: `formOverride.abs` replaced by `rel` (relative to base), applied before meal modifiers; new `formOverride.protect` flags (`phytate`, `acid`, `fat`) skip only the cited modifiers.
- `supplement-forms.js`: convert `abs` rows to `rel` with citations; add `protect` flags where cited. Update `docs/formula-review.md` and `scripts/test-bar-scale-forms.mjs`.
