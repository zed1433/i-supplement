# Optimal ranges, absorbed and bioactive targets, body size, stomach acid, fibre

## What I found
- **Your optimal ranges were lost, not missing.** Your old database has them (e.g. iron 18 mg, calcium 1200 mg, magnesium 550 mg, zinc 20 mg). The calculator only reads the GitHub target list, which has no optimal values, so the green zone fell back to the RDA. My earlier message was wrong.
- **Low stomach acid:** you're right. My last change switched the "suspected" state off, so it had no effect on B12 or iron.
- **Weight, height and activity** don't exist in the calculator. Calories are typed in by hand.
- **Fibre** is treated only as a food value. It doesn't block absorption anywhere.
- **Absorbed and bioactive bars** have no targets of their own. They are compared with the intake RDA, which is wrong.

## How targets will work
```text
                Intake bar        Absorbed bar           Bioactive bar
RDA line        official, fixed   RDA x reference rate   absorbed RDA x conversion
Optimal band    moves with you    research optimum       research optimum
                (see below)       (fixed per person)     (fixed per person)
```
- **RDA never changes** because of health, meals or biomarkers. Only sex and age pick which official row applies.
- **Absorbed RDA = RDA × the absorption rate the RDA committee assumed.** For example, the iron RDA assumes about 18% absorption from a mixed diet (IOM 2001), so 8 mg → about 1.4 mg absorbed (matching the ~1 mg/day men lose plus a margin). Zinc, calcium, magnesium, B12, folate (DFE), vitamin A (RAE) and so on each get their own published reference rate. Where the committee states no rate, the absorbed line is hidden with a note instead of guessed.
- **Optimal absorbed and bioactive range** comes from research optimums (status-based studies such as ferritin, 25(OH)D, RBC folate, homocysteine, Mg balance), plus your old values. Where no research optimum exists, your rule is used: 1.4–2× the RDA, kept below the UL.
- **The intake optimal range moves.** It is worked out backwards: "how much do I need to eat, with my gut, my meal and my status, to land in the absorbed optimum?" Low stomach acid, phytate, low fat, celiac and so on push the intake band up. The absorbed and bioactive bands stay where they are. So a full intake bar can still show a short absorbed bar.

## Changes
1. **Bring back your optimal values** and add researched optimums with citations, nutrient by nutrient.
2. **Three target sets per nutrient** (intake, absorbed, bioactive) as above, with the RDA and optimal markers on each bar.
3. **Low stomach acid lowers B12 and iron in every state:** suspected = a smaller cut, confirmed or on acid blockers = full cut, no acid = strongest. It applies to food B12 (not supplement B12) and to plant iron.
4. **Body inputs:** weight, height and activity level. Calories are estimated (Mifflin-St Jeor × activity factor), and you can still type your own. Only research-backed scaling is used:
   - Energy-linked B vitamins (B1, B2, B3) per 1000 kcal.
   - B6 per gram of protein.
   - Vitamin E per gram of polyunsaturated fat.
   - Protein per kg of body weight (higher when active).
   - Magnesium per kg for the optimal range.
   - Sweat losses for sodium and potassium as a note.
   Everything else is labelled "no evidence of size or activity effect". These change the optimal range only, never the RDA.
5. **Fibre becomes an antinutrient.** No "eat more fibre" target. Meal fibre reduces mineral absorption only where human studies give a number (mainly through bound phytate, and some effect on zinc, iron, calcium and carotenoids). It isn't double-counted with phytate. Shown as an inhibitor in the detail.
6. **Low-fat meals:** the existing under-5 g fat rule for vitamins A, D, E and K is re-checked, made graded (e.g. 0, 3, 10+ g) where studies support it, and shown on all three bars.
7. **A full interaction and physiology audit.** A research pass, nutrient by nutrient, covering:
   - absorption rates by form and food;
   - enhancers and inhibitors and their combinations (vitamin C + phytate + calcium together, etc.);
   - saturation per meal;
   - conversion and activation (carotene → retinol, folate → 5-MTHF, B6 → PLP, D → 25(OH)D, ALA → EPA/DHA, tryptophan → niacin);
   - status feedback (ferritin, vitamin A status);
   - losses.
   Each item is applied with a cited number or listed as "known, no reliable number". I'll also list physiology you haven't mentioned that matters, so you can decide on it.
8. **Checks:** tests that the RDA stays fixed while the intake optimum rises with low stomach acid, iron 8 mg → about 1.4 mg absorbed RDA, a 60 kg sedentary vs 100 kg active person, fibre and low fat reducing absorption, and the restored optimal values. The evidence review document gets updated, and I'll check it in the browser.

## Technical details
- `optimal-targets.json` built from the legacy CSV plus a cited research table. `personalTarget()` stops overwriting optimal with the RDA.
- New `target-model.js`: reference absorption/conversion rates per nutrient (IOM basis), absorbed/bioactive RDA and optimal, and the inverse intake optimum = absorbed optimum ÷ the user's modeled effective rate for the current meal profile.
- `body-model.js`: energy, protein and per-kg/per-kcal scaling.
- `clinical-absorption.js` (both copies): suspected hypochlorhydria factor, fibre inhibitor, graded fat effect.
- Bars in `app.js` get separate marker sets. The research audit runs in parallel and its findings land in `docs/formula-review.md` before values are applied.
- `roadmap.md` gets these tasks on approval (plan mode can't edit it).
