# Fill in "Estimated absorbed" and "Converted / bioactive" from your newer calculator

## What I found
- The GitHub repo has been rebuilt since I copied it. It's now a different app, the one with your own database.
- The version on the site came from the old repo, so it only had absorption formulas for iron, B12 and zinc. Everything else shows "Not modeled", whichever source the food comes from.
- Your new version (`lib/clinicalAbsorptionEngine.ts`) has absorption ranges for about 30 nutrients: vitamins A, D, E, K, B1–B12, C and choline, plus iron, zinc, copper, magnesium, calcium, selenium, iodine, manganese, molybdenum, chromium, phosphorus, potassium and sodium. Some also have a conversion step (B3, B6), and they adjust for the food: animal or plant, cooked carotenoids, fat in the meal, heme share, and gut conditions.
- The formulas are written in the app's code, not stored in your database. Your database holds the foods, cooking factors and targets, and I can't reach it. The site keeps using its own 4,345 foods, and the formulas work on those foods directly.

## What changes
1. Copy your new absorption formulas word for word into the calculator, along with the cooking-retention and gut-condition adjustments.
2. Every nutrient row shows "Estimated absorbed" as a range (min–max) and "Converted / bioactive" when your formula has a conversion step.
3. Where your new formulas cover iron, B12 and zinc, they replace the old ones. Iron uses your new heme/non-heme blend, so it also works for foods that only list total iron.
4. The Health contexts settings (gastric acid, conditions) feed into these new formulas.
5. Fix the "OPT MIN"/"OPT MAX" labels so they don't print on top of each other when the values are the same.
6. Nothing is removed. Your foods, screens and saved meals stay as they are.

## Technical details
- Add a verbatim port of `lib/clinicalAbsorptionEngine.ts` (plus the `nutrientCanonical` and `types/bioavailability` pieces it depends on) to `src/lib/calculator/` and `public/bio-calculator/`, as a JS module.
- In `app.js`, `nutrient()` uses the new engine's `[min, max, conversion]` for every key. It maps site nutrient keys (e.g. `vitamin_b6`) to the engine's names (`Vitamin B6`), and the animal/plant share comes from each entry's `origin`.
- Update the AGENTS.md calculator rule: engine source is now the rebuilt Next.js repo.
- Extend `scripts/test-calculator.mjs` with a few fixed checks taken from the source, e.g. calcium 100 mg gives 25–40 mg and plant magnesium gives 25–40%.
