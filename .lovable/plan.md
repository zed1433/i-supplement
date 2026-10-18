# Calculator: biomarkers, bars, health context

## What I found
- **Biomarkers do nothing to absorption today.** Your lab results are saved and charted, but no calculation reads them, so low ferritin does not raise iron absorption. Entry problems too: the unit doesn't change when you switch markers, a blank value is saved as 0, and trend charts mix units.
- **The RDA and optimal-range lines look broken** because the marker lines are drawn across the whole card while the bars use only the middle column, so a line at 50% doesn't sit at 50% of the bar. There is no shaded optimal band, only end ticks. Labels that sit close together overlap. That is the unreadable text.
- **The UL is shown only as a thin tick**, not as a clear zone.
- **Health context mostly works but is too crude.** Low stomach acid, celiac/Crohn's and liver disease change absorbed values, and the bioactive amount follows. But the condition state is ignored (treated celiac and Crohn's in remission are still penalised), six listed conditions have no effect, and the calcium-carbonate rule can never trigger.
- **There is no "highest possible" value**, so the faded second bar from the old system is missing.
- **Tannins:** 147 is what the published USDA tables cover. I'll search two more cited sources (Phenol-Explorer and published cereal and legume tannin tables). Foods without a source stay "not measured".

## Changes
1. **Biomarkers that change absorption, only where research supports it:**
   - Ferritin → plant (non-heme) iron absorption, a strong effect (Hallberg/Cook). Heme iron gets a weaker effect.
   - Hemoglobin, only when ferritin is missing → a mild iron boost if anaemic.
   - Vitamin D 25(OH)D under 50 nmol/L → calcium absorption reduced modestly (Heaney).
   - Zinc (serum) low → a small rise in zinc absorption (King).
   - B12, folate, magnesium and others: shown as context only, with a note that the research doesn't support an absorption change.
   
   Each change appears as a labelled line in the nutrient detail, for example "Ferritin 15 µg/L: iron absorption ×1.6".
2. **Biomarker entry fixes:** the right unit loads automatically per marker, with conversion where one is needed (e.g. ng/mL ↔ nmol/L). Blank values are rejected, and trend charts keep units separate and scaled.
3. **New nutrient bar:**
   - Solid bar = absorbed. A faded bar behind it = highest possible absorbed (no inhibitors, best healthy rate, best preparation). The same pair is shown for bioactive.
   - A shaded green optimal band, a sharp RDA line, and a red UL zone running from the UL to the end of the scale.
   - Markers line up exactly with the bar. Labels move above or below to avoid each other and stay inside the card, with numbers in a small legend underneath.
4. **Health context corrections:** condition state is respected (treated or remission = no or a smaller penalty, active = full), and the effect of each choice is listed in the detail. I'll add cited effects only where published data exists (pancreatic insufficiency → fat-soluble vitamins and fat; short bowel or ileal resection → B12 and fat-soluble vitamins; bariatric surgery → iron, B12, calcium). Any other condition stays "no number used" with a visible note. I'll fix the calcium-carbonate path.
5. **Tannins:** add cited values from the extra sources where they exist. No guessed values.
6. **Checks:** every formula change is added to the evidence review document. I'll test in the browser: ferritin 10 vs 150 changes iron absorption, active vs treated celiac, how the bars and labels look at desktop and phone widths, and that the UL zone appears for a high-zinc meal.

## Technical details
- Biomarker modifiers live in a new `biomarker-modifiers.js` that `clinical-absorption.js` calls (both copies kept identical). The latest valid biomarker per marker is passed into `clinicalEstimate()`.
- Theoretical max = the same engine run with inhibitors cleared, healthy context, the upper absorption rate and the best prep. It is shown as `maxAbsorbed`/`maxBioactive`.
- The bar is rebuilt as one positioned track (bar, ghost bar, band, RDA, UL zone share the same coordinate box). Labels use simple collision bumping across two rows. The ceiling includes the optimal minimum.
- Formula-engine ports in `src/lib/calculator` are untouched apart from the `clinical-absorption.js` mirror.
