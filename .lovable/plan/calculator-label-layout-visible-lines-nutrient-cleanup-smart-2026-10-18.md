# Calculator: label layout, visible lines, nutrient cleanup, smarter Perfect day

## What I found
- **Biotin**: only 79 of 4,345 foods have a measured value (4,252 unmeasured). So the zero is mostly missing lab data, not the Perfect day skipping it.
- **Chromium**: 0 foods measured. **Molybdenum**: 47. **Fluoride**: 135.
- **Iodine**: 927 measured; **B12**: 1,761; **Potassium**: 3,690 — enough to reach the green zone, so misses there are the search's fault.
- **Absorbed vs bioactive look the same**: for most nutrients the conversion factor is 1 (the absorbed form already is the active form — e.g. minerals, B12 food forms). The bars only split where a conversion is modeled (beta-carotene → vitamin A, folate forms, B6, etc.). Not caused by Perfect day. I will verify each nutrient's factor and show a small "same as absorbed — no conversion step" note when they are equal, so it is not mistaken for a bug.

## Changes
1. **Numbers below the bars**: RDA, optimal min/max and UL values move to one row under each set of bars (still aligned under their lines, collision-avoided), freeing the side space.
2. **Lines always visible**: RDA / optimal / UL vertical lines drawn above the coloured bar with a light outline, so they stay visible when the bar reaches or passes them.
3. **Remove from analysis**: fluoride (your choice), chromium (no food data). Molybdenum: removed from the analysis bars because food data is too sparse to reach green; still kept in supplements and targets.
3b. **Biotin stays and gets real food data**: add published, lab-measured biotin values (e.g. Staggs et al. 2004 LC-MS food biotin study, the UK McCance & Widdowson composition tables, Danish Frida database, Swiss and German BLS tables where reusable) as a cited file in the published-values folder. Values matched only to the same food (raw/cooked, country kept separate), marked measured or estimated, never invented; unmatched foods stay "not measured". Coverage report before/after, then Perfect day includes biotin.
4. **Perfect day exempt list**: sodium and iodine don't have to hit green (iodized salt), shown as "covered by iodized salt" instead of a miss.
5. **Perfect day optimisation**: weight misses by how far below the band, aim for the band middle, more search rounds, targeted "add a food rich in X" moves for B12, potassium etc., and a final fine-tuning pass on portions. Goal: B12, potassium and other reachable nutrients land in green.

## Technical details
- `app.js` label rendering + CSS (`nb-labels` under tracks, `z-line` z-index above `nb-bar`, outline).
- New hidden list in `nutrient-order.js` (analysis-only exclusions); salt-covered set in `day-planner.js` caller.
- `day-planner.js`: middle-of-band scoring, deficit-weighted `suggest`, more iterations, end hill-climb on grams; extend `scripts/test-day-planner.mjs`.
- Audit `conversionPhi` per nutrient in `clinical-absorption.js` (both copies identical).
