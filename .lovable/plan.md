# Calculator: fixed bar scale, nutrient order, supplement forms, full nutrient audit

## What I found
- **"Not modeled" for vitamin D, B12, B5, B7, manganese, iodine, chromium, molybdenum** mostly happens when the meal contains 0 of that nutrient (or it is "not measured" in those foods): the calculation simply stops instead of showing 0. Chloride has no absorption rate at all. So B12 absorption *is* calculated (and low stomach acid does cut it), but you only see it when the meal has B12.
- **Supplement forms are ignored.** Every supplement goes in as plain "supplement". The form you pick (magnesium oxide vs glycinate, folic acid vs 5-MTHF, D2 vs D3, chromium picolinate, etc.) doesn't change absorption or conversion.
- **No UL on the absorbed and bioactive bars**, only on intake.
- **RDA vs AI:** the label switches between "RDA" and "AI" depending on the nutrient, and when the optimal min equals the RDA the two labels sit on top of each other.
- **Bars scale to the largest value**, so markers wander (e.g. copper's RDA at 10%, the UL at 85%). Values sit far away, under and to the right.
- **Order** follows the data file, not A, B1…B12, C, D, E, K.

## Changes
1. **Fixed bar scale on all three bars:**
   - RDA (or AI) at **35%**, optimal min at **35% × 1.4 = 49%**, optimal max at **70%** (when the optimal max is 2× RDA). In between, the scale is straight-line, normalised to the RDA, so other optimal values fall where they really are relative to the RDA.
   - From 70% to the UL at **95%**, the scale is compressed (logarithmic), so a 2 mg range and a 400 mg UL both fit. Above the UL to 100% is the red zone; anything higher sticks at the end with a "> UL" arrow.
   - If there is no UL, the space after 70% runs up to 4× the RDA.
2. **Values on the bar:** each marker gets its number right beside it ("RDA 8 mg", "Opt min 11.2", "Opt max 16", "UL 45"), above the bar, with the intake/absorbed number at the bar's tip. Because the positions are fixed, labels never overlap. The far-away text line underneath is removed.
3. **UL on absorbed and bioactive bars:** UL × the same reference absorption rate (and conversion), marked "derived" in the legend. Where a UL only counts supplements (magnesium, folic acid, niacin, vitamin E) or only preformed vitamin A, the bar says so.
4. **One label: "RDA"** for both. Where it's really an AI, a small "(AI)" note appears in the legend instead.
5. **Order:** vitamins A, B1, B2, B3, B5, B6, B7, B9, B12, C, D, E, K. Then minerals A–Z (calcium, chloride, chromium, copper, iodine, iron, magnesium, manganese, molybdenum, phosphorus, potassium, selenium, sodium, zinc). Then others (choline, creatine, taurine, fibre, etc.). The same order is used in Analysis, Targets and the supplement list.
6. **Always show modeled nutrients:** a 0 intake shows 0 absorbed, not "Not modeled". "Not measured in these foods" is shown separately from a real zero. Chloride gets a cited absorption rate (it is absorbed almost completely, like sodium).
7. **Supplement forms, bioavailability and conversion:** each supplement form gets its own cited absorption rate and conversion. Examples to research and cite:
   - magnesium oxide vs citrate/glycinate
   - iron sulfate vs bisglycinate
   - zinc oxide vs gluconate/picolinate
   - calcium carbonate (needs acid) vs citrate
   - folic acid (fully absorbed, no conversion needed but uses DHFR) vs 5-MTHF
   - B12 cyano/methyl/hydroxo and the 1.5 µg uptake cap
   - D2 vs D3 (D3 raises 25(OH)D more)
   - vitamin E natural vs synthetic (about 2:1)
   - beta-carotene supplement vs retinol
   - chromium picolinate vs chloride
   - K1 vs MK-7
   
   Forms without a published figure use the plain nutrient rate, with a note.
8. **Full nutrient audit, one nutrient at a time** (all 27 plus chloride): base absorption rate by food type and supplement form, inhibitors and enhancers, saturation, conversion to the active form, how stomach acid and conditions affect it, the reference absorption rate behind the RDA, and the UL scope. Each value is cited in the evidence review or marked "no reliable number, not applied". Where the evidence supports it, the current gaps get filled (for example the vitamin D, B5, B7, iodine, manganese, chromium and molybdenum rates are checked against sources).
9. **Checks:** tests for the bar positions (RDA = 35%, opt max at 2× RDA = 70%, UL = 95%), the order, a magnesium oxide vs glycinate difference, a meal with no B12 showing 0, and low stomach acid lowering B12 from food but not from a supplement. I'll also check the bars in the browser at desktop and phone widths.

## Technical details
- New `bar-scale.js`: `pos(v, rda, ul)` gives a piecewise position: linear 0→2×RDA maps to 0→70%, then log from 2×RDA to UL maps to 70→95%, then 95→100% for UL→1.1×UL. Without a UL, the log segment ends at 4×RDA. Used by `track()` in `app.js`. The old max-value scaling is removed.
- `NUTRIENT_ORDER` constant in a shared module, used for analysis, targets and the supplement library.
- `clinicalEstimate()` (both copies, kept identical) returns a zero result instead of null for engine nutrients with total 0. It adds `Chloride` and a form-aware supplement branch that passes `chemicalForm` from `SUPPLEMENT_FORMS` through `forms[key]` into `evaluateEntericBioavailability`. The rate table lives in a new cited `supplement-forms-bioavailability.js`.
- `barTargets()` adds `ul` for absorbed/bioactive, scaled by rate × phi, and respects `ulScope`.
- Audit results go in `docs/formula-review.md` ("Nutrient audit" section). This is done through parallel research subagents, one per nutrient group, before any values are applied.
