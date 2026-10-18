# Optimal ranges, low stomach acid, body size and activity

## What I found
- **Your optimal ranges were lost, not missing.** Your old database has them (`optimal_target`, e.g. iron 18 mg, calcium 1200 mg, magnesium 550 mg, zinc 20 mg). The calculator only reads the GitHub target list, which has no optimal values, so the band fell back to the RDA. My earlier message was wrong to say you never set them.
- **Low stomach acid:** you're right. The "suspected" state was switched off by my change, so a suspected case had no effect on B12 or iron. Confirmed cases still worked.
- **Weight, height, activity:** none exist in the calculator. Energy is typed in by hand (default 2500 kcal), and only thiamine follows it. Protein has no per-kg target.

## Changes
1. **Bring your optimal ranges back.** Use your old database values for each nutrient. Where you had none, use your rule: 1.4× to 2× the RDA, never above the UL. The green band runs from the optimal minimum to the optimal maximum, and the RDA line stays separate. When sex and age change the RDA, your optimal range moves with it by the same ratio. Your manual overrides in Targets still win.
2. **Low stomach acid lowers B12 and iron in every state.** Suspected = a smaller reduction, confirmed or on acid-blocking medicine = full reduction, no acid at all = strongest. It affects food-bound B12 (not supplement B12) and plant iron, and each step is listed in the nutrient detail.
3. **New body inputs in Health Context:** weight, height and activity level (sedentary to very active).
   - Daily calories are worked out automatically (Mifflin-St Jeor × activity factor). You can still type your own number.
   - Protein target = 0.8 g per kg of body weight (higher for active people, 1.2-1.6 g/kg, per sports nutrition position stands).
4. **Targets that scale with size, calories, macros or activity, only where research gives a number:**
   - Per 1000 kcal: thiamine, riboflavin, niacin (energy-linked B vitamins, IOM).
   - B6 rises with protein eaten (IOM's 0.016 mg per g protein).
   - Vitamin E rises with polyunsaturated fat eaten (about 0.4-0.6 mg per g, Horwitt/EFSA).
   - Magnesium per kg body weight (about 4-6 mg/kg) applied to the optimal range only, not the official RDA.
   - Sodium and potassium: shown as a note for heavy sweating, since there's no reliable fixed number.
   - Fibre 14 g per 1000 kcal (IOM).
   - Everything else: listed as "no evidence that size or activity changes this", so nothing is invented.
5. **Checks:** tests for the restored optimal values (iron, calcium, the 1.4-2× fallback), for suspected vs confirmed low stomach acid on B12 and iron, and for a 60 kg sedentary vs 100 kg very active person (calories, protein, B vitamins and magnesium change). Every new rule goes into the evidence review document. I'll check it in the browser.

## Technical details
- Load `scripts/data/legacy-supabase/nutrient_daily_targets.csv` into a static `optimal-targets.json` mapped to calculator keys; `personalTarget()` scales optimal by personalRDA/baseRDA and stops overwriting it with the RDA.
- Gastric-acid mapping in `clinical-absorption.js` (both copies): suspected → a separate milder factor, not "normal".
- New `body-model.js`: energy estimate, protein/kg and scaling rules with citations; applied in `app.js` after sex/age targets and before diet adjustments. Settings are saved with the existing workspace.
