# Optimal ranges, absorbed and bioactive targets, body size, stomach acid, fibre

## What I found
- **Your optimal ranges were lost, not missing.** Your old database has them (e.g. iron 18 mg, calcium 1200 mg, magnesium 550 mg, zinc 20 mg). The calculator only reads the GitHub target list, which has no optimal values, so the green zone fell back to the RDA. My earlier message was wrong.
- **Low stomach acid:** you're right. My last change switched the "suspected" state off, so it had no effect on B12 or iron.
- **Weight, height and activity** don't exist in the calculator. Calories are typed in by hand.
- **Fibre** is treated only as a food value. It doesn't block absorption anywhere.
- **Absorbed and bioactive bars** have no targets of their own. They are compared with the intake RDA, which is wrong.

## How targets will work
Two separate things:
- **The bars move with what you ate and how well you absorbed it.** Inhibitors (low stomach acid, phytate, fibre, tannins, low fat, celiac) shorten the absorbed and bioactive bars. Enhancers (vitamin C, fat, heme iron) lengthen them. So 10 mg of iron eaten might show only 1 mg absorbed.
- **The ranges move only when your needs change:** sex, age, weight, activity, calories, macros eaten (protein, carbs, fat), diet type and certain blood markers. Absorption problems never move the ranges.

```text
                Intake bar        Absorbed bar           Bioactive bar
RDA line        official, fixed   RDA x reference rate   absorbed RDA x conversion
Optimal band    needs-based       needs-based            needs-based
Bar length      what you ate      what you absorbed      what became active
```
- **RDA never changes.** Only sex and age choose the official row.
- **Absorbed RDA = RDA × the absorption rate the RDA committee assumed.** For example, the iron RDA assumes about 18% absorption from a mixed diet (IOM 2001), so 8 mg → about 1.4 mg absorbed. Each nutrient gets its published reference rate. Where none is stated, the absorbed RDA line is hidden with a note, not guessed.
- **Optimal range** comes from research optimums (ferritin, 25(OH)D, RBC folate, homocysteine, Mg balance studies), plus your old values, or your 1.4–2× RDA rule where no research exists, kept below the UL. It is shown on all three bars using the same reference rates, then adjusted by needs.

## Changes
1. **Bring back your optimal values** and add researched optimums with citations, nutrient by nutrient.
2. **Three target sets per nutrient** (intake, absorbed, bioactive), with the RDA and optimal markers on each bar.
3. **Low stomach acid lowers B12 and iron in every state:** suspected = a smaller cut, confirmed or on acid blockers = full cut, no acid = strongest. It applies to food B12 (not supplement B12) and to plant iron. It shortens the absorbed bar and leaves the ranges alone.
4. **Needs that change the optimal range** (never the RDA). New inputs: weight, height and activity level. Calories are estimated (Mifflin-St Jeor × activity factor), and you can still type your own. Each is applied only with a cited number:
   - **Calories:** B1, B2 and B3 per 1000 kcal.
   - **Carbohydrate eaten:** B1. Thiamine is the cofactor for carbohydrate metabolism, so I'll look for a per-gram figure, otherwise it is covered through calories.
   - **Protein eaten:** B6 per gram of protein (IOM 0.016 mg/g). Protein target per kg of body weight, higher when active.
   - **Fat eaten:** vitamin E per gram of polyunsaturated fat. Biotin's role in fat metabolism will be researched, and applied only if a number exists.
   - **Weight:** magnesium per kg (optimal range only).
   - **Activity:** sweat losses for sodium, potassium, magnesium, zinc and iron, where studies give amounts.
   - **Blood markers:** for example, low ferritin raises the iron optimum, and low 25(OH)D raises the vitamin D optimum to a repletion dose.
   Anything without evidence is labelled "no evidence of a change".
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
