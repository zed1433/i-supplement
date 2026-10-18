# Apply the corrected formula values from the review

The calculator will use the corrected values below. Your GitHub calculator stays as it is, so the site's version will differ from it from now on. I'll list every change so you can copy them into GitHub if you want both to match.

## Changes to absorption

| Rule | Now | Corrected |
|---|---|---|
| Vitamin C (50 mg or more) boosts plant iron | ×1.25 to 1.4 | ×2 to 3 |
| Oxalate on calcium | ×0.8 to 0.9 above 50 mg | 50 to 300 mg: ×0.8 to 0.9. Above 300 mg (spinach-level): ×0.2 to 0.35 |
| Oxalate on magnesium | ×0.85 to 0.9 | removed |
| High zinc lowers iron | ×0.75 to 0.85 | removed (not seen with food) |
| High calcium lowers magnesium | ×0.75 to 0.85 | removed |
| Manganese absorbed | 3 to 8% | 1 to 5% |
| Copper absorbed | 50 to 70% | 30 to 60% |
| Vitamin K from plants | 15 to 40% | 5 to 15% |
| Carotenoids (plant vitamin A), highest | up to 95% | up to 65% |
| Vitamin E | 50 to 80% always | 50 to 80% with 5 g fat or more; 10 to 35% below that |
| Vitamin B12 | 45 to 60% at any amount | about 1.5 µg per meal absorbed actively, plus 1% of the rest (large doses no longer overcounted) |

## Changes to the extras from your old database
- **Calories absorbed:** now about 2 kcal less per gram of fiber, and no lectin penalty. The old formula went down to 72%.
- **Diet rules kept:** high-protein and carnivore B6, high-carb thiamine, keto sodium.
- **Diet rules removed:** carnivore potassium, magnesium and vitamin C, and high-protein magnesium.
- **Under 5 g fat:** stays as a warning only.

## Left as they are (the review gave no better number)
- The single reduction for celiac and Crohn's.
- Cereal niacin: the calculator can't tell cereals apart from other plants yet.
- The 50 mg tannin trigger.
- Calcium on iron.

These are marked "not changed" in the report.

## After the change
- The report gets an "Applied" column showing what changed.
- Checks are updated to the new values, and I run a test meal in the browser to compare before and after.

## Technical details
- Edit `public/bio-calculator/clinical-absorption.js` and its mirror `src/lib/calculator/clinical-absorption.js`, plus `legacy-rules.js`. Replace the "verbatim port, don't change formulas" headers with a note that the files deliberately diverge from GitHub, citing `docs/formula-review.md`.
- The B12 saturation is applied in the adapter for each source portion: absorbed = min(amount, 1.5) × rate + 1% × max(0, amount − 1.5).
- Update the AGENTS.md and project-knowledge rule: formulas now follow the evidence review, not verbatim GitHub.
- Extend `test-clinical-absorption.mjs` and `test-legacy-rules.mjs` with one assertion per changed value.
