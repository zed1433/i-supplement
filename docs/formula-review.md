# Bio Calculator: formula review against published research

Verdicts: **Correct** = matches human studies in direction and rough size. **Right direction, wrong size** = effect is real but the number is off. **Not supported** = no good human evidence, or evidence points the other way.
No formula has been changed. GitHub (`clinicalAbsorptionEngine.ts`) remains the calculator's source of truth.

## A. GitHub formulas — base absorption

| Nutrient | GitHub range | Published | Verdict |
|---|---|---|---|
| Heme iron | 15–35% | 15–35% (Hurrell & Egli, AJCN 2010) | Correct |
| Non-heme iron | 3–12% | 2–20%, meal-dependent (Hurrell & Egli 2010) | Correct |
| Zinc (animal / plant) | 30–50% / 15–30% | ~15–50% depending on phytate (EFSA 2014; IZiNCG 2004) | Correct |
| Magnesium | 25–50% | 30–40% typical (EFSA 2015; NIH ODS) | Correct |
| Calcium | 25–40% | ~25–35% from mixed diet (Heaney; IOM 2011) | Correct |
| Selenium | 70–90% | >70% for selenomethionine (EFSA 2014) | Correct |
| Iodine | 90–98% | >90% (EFSA 2014) | Correct |
| Manganese | 3–8% | 1–5% (EFSA 2013) | Right direction, slightly high |
| Chromium | 0.5–2% (picolinate 2–5%) | 0.4–2.5% (EFSA 2014) | Correct |
| Molybdenum | 70–93% | 40–90%, higher from liquids (Turnlund 1995; EFSA 2013) | Correct |
| Phosphorus | 55–70% | 55–70% (EFSA 2015) | Correct |
| Potassium / sodium | 85–95% | ~85–90% / >95% (EFSA 2016, 2019) | Correct |
| Copper | 50–70% | 30–60% (EFSA 2015) | Right direction, slightly high |
| Preformed vitamin A | 70–90% | 70–90% (IOM 2001) | Correct |
| Provitamin A (carotenoids) | 20–95% by fat/cooking | 5–65%; then converted ~12:1 (IOM 2001 RAE) | Right direction, upper end too high |
| Vitamin D | 55–80% | ~50–80%, better with fat (Dawson-Hughes, JBMR 2015) | Correct |
| Vitamin E | 50–80% | 10–80%, strongly fat-dependent (EFSA 2015) | Right direction, often too high in low-fat meals |
| Vitamin K1 (plants) | 15–40% | ~5–15% from greens, more with fat (Gijsbers 1996) | Right direction, too high |
| Vitamin K2 (animal) | 40–70% | MK-7 well absorbed; MK-4 data limited (Schurgers 2007) | Correct (limited evidence) |
| Vitamin B12 | 45–60% | ~50% at ~1 µg per meal, falls to <10% at large doses (IOM 1998; Carmel) | Correct for small amounts; too high for large doses |
| Folate (food) | 40–60% | ~50% (basis of DFE, IOM 1998) | Correct |
| Vitamin C | 70–90% | 70–90% up to ~200 mg, falls above 1 g (Levine 1996) | Correct for normal doses |
| Thiamine / riboflavin | 50–80% / 60–85% | Efficient at food doses (EFSA 2016, 2017) | Correct |
| Niacin (plant ×0.9) | 55–85% | Cereal niacin often ~30% bioavailable (bound niacytin) | Right direction, too high for cereals |
| Vitamin B6 (plant ×0.75) | 40–60% | Plant pyridoxine glucoside ~50–75% (Gregory 1998) | Correct |
| Pantothenic acid / biotin | 40–60% / 50–80% | ~50% (EFSA 2014) | Correct |
| Choline | 60–85% | Not well quantified | Not supported (no data either way) |

## B. GitHub formulas — meal interactions

| Rule | Published | Verdict |
|---|---|---|
| Vitamin C ≥50 mg: non-heme iron ×1.25–1.4 | 2–3× in single meals (Hallberg 1989; Cook & Reddy 2001) | Right direction, too small |
| Tannins (≥50 mg meal): non-heme iron ×0.35–0.45 | Tea/coffee cut absorption 60–90% (Disler 1975; Hurrell 1999) | Correct |
| Phytate >100 mg: non-heme iron ×0.5–0.6 | Dose-dependent; even 2–10 mg inhibits; science uses phytate:iron molar ratio (Hurrell 2003) | Right direction, crude threshold |
| Phytate >100 mg: zinc ×0.7–0.8 | Phytate:zinc molar ratio >15 can halve absorption (EFSA 2014; Miller 2007) | Right direction, too small for high-phytate meals |
| Oxalate >50 mg: calcium ×0.8–0.9 | Spinach calcium ~5% vs milk ~27% (Heaney 1988) | Right direction, far too small for high-oxalate foods |
| Oxalate: magnesium ×0.85–0.9 | Little effect found (Bohn 2004) | Not supported |
| Calcium >350 mg: non-heme iron ×0.65–0.75 | Single meal: 50–60% drop (Hallberg 1991); over weeks: negligible (Lönnerdal 2010) | Right direction for one meal; overstated long-term |
| Zinc >25 mg: iron ×0.75–0.85 | Shown in water; little effect when eaten with food (Whittaker 1998) | Not supported with food |
| Zinc:copper >20: copper ×0.4–0.5 | Real with high zinc (≥50 mg/day for weeks); single-meal ratio rule not established (Fosmire 1990) | Right direction, size uncertain |
| Calcium >800 mg: magnesium ×0.75–0.85 | Most studies find no effect (Andon 1996; EFSA 2015) | Not supported |
| Low stomach acid: food B12 ×0.3–0.4, supplement B12 unaffected | Well established (Carmel; NIH ODS) | Correct |
| Low stomach acid: non-heme iron reduced, heme spared | Established (Betesh 2015) | Correct |
| Low stomach acid: calcium carbonate ×0.25–0.35 | True when fasting; normal with meals (Recker 1985) | Correct only when taken without food |
| Celiac / Crohn's: everything ×0.6–0.7 | Depends on disease activity and gut segment | Not supported as one factor |
| Bile problems: vitamins A/D/E/K ×0.55–0.7 | Established for cholestasis (Sokol 1994) | Correct |

## C. Old database rules (now added as extras)

| Rule | Published | Verdict |
|---|---|---|
| Under 5 g fat: fat-soluble vitamins lose 80% | Carotenoids need ~3–5 g fat (Brown 2004). Vitamin D still absorbed without fat, about 32% less (Dawson-Hughes 2015) | Right direction, 80% too strong. The calculator shows a warning only |
| Calories absorbed = max(72, 98 − 0.35×fiber − 10 if lectins >30) | Mixed diets ~92–97% digestible; fiber costs ~2 kcal/g (Baer 1997; Novotny 2012). No human data for a lectin penalty | Not supported in size |
| High-carb: thiamine ×1.4 | Thiamine needs scale with energy/carbohydrate (IOM 0.5 mg/1000 kcal) | Right direction, size not established |
| High-protein / carnivore: B6 ×1.35–1.4 | B6 requirement rises with protein intake (IOM 1998) | Right direction |
| Keto: sodium ×1.4 | Early ketosis causes sodium loss (natriuresis) | Right direction, size not established |
| Carnivore: potassium ×1.25 | No controlled data | Not supported |
| High-protein / carnivore: magnesium ×1.15–1.2 | No controlled data | Not supported |
| Carnivore: vitamin C ×0.5 | Glucose–ascorbate competition is a hypothesis; no human trial | Not supported |
| Tannin trigger at 50 mg (my choice) | Inhibition starts at 5–25 mg galloyl groups (Brune 1989) | Right direction; could be lower |

## Summary
- Most base absorption rates in GitHub are **correct**.
- Biggest gaps: vitamin C's boost is too small; oxalate's effect on calcium is far too small; the zinc→iron and calcium→magnesium rules are not supported with food; the celiac/Crohn's single factor is too crude.
- From the old database: the B6, thiamine and keto sodium rules point the right way. The potassium, magnesium and vitamin C diet rules, and the calories-absorbed formula, are not supported.
- Nothing has been changed. Tell me which verdicts you want applied. Formula changes should be made in the GitHub repo first, then copied.

## Applied (2026-10-18, owner-approved)
Changed in the calculator: vitamin C on iron ×2–3; oxalate on calcium ×0.2–0.35 above 300 mg (×0.8–0.9 for 50–300 mg); oxalate→magnesium, zinc→iron and calcium→magnesium rules removed; manganese 1–5%; copper 30–60%; plant vitamin K 5–15%; carotenoid maximum 65%; vitamin E 10–35% when meal fat <5 g; B12 active uptake capped at 1.5 µg per meal + 1% passive; calories absorbed = kcal − 2 × fiber g (no lectin penalty); diet rules for carnivore potassium/magnesium/vitamin C and high-protein magnesium removed.
Not changed (no better number): celiac/Crohn's single factor, cereal niacin, 50 mg tannin trigger, calcium on iron.

## Data update: tannin values (Oct 2026)
147 plant foods now carry tannin values from the USDA Proanthocyanidin Database, Release 2 (2015), via `scripts/data/published/tannin.csv` (sum of dimers through polymers per NDB food; monomers excluded because they bind iron weakly). Proanthocyanidins are a proxy for the galloyl-containing tannins in Brune 1989. Tea and coffee are deliberately excluded: their iron inhibitors (theaflavins, galloyl catechins, chlorogenic acid) are not proanthocyanidins, so the PA figure would understate them; their earlier estimates are kept.

## Personal model (Oct 2026)
Implemented in `public/bio-calculator/personal-model.js`; tested by `scripts/test-personal-model.mjs`.
- **Sex/age targets:** RDA/AI and age-dependent ULs from the US National Academies DRI tables (IOM 1997-2001, NASEM 2011, 2019) for adults 19-30, 31-50, 51-70 and 71+.
- **UL scope:** magnesium, niacin, folate (folic acid) and vitamin E ULs apply only to supplements; the vitamin A UL applies only to preformed vitamin A. Food intake no longer triggers "Above UL" for these.
- **Diet:** old-database diet multipliers removed (no human evidence; thiamine already scales with energy). Vegetarian/vegan: iron ×1.8 and zinc ×1.5 (IOM 2001). Vegans get a B12 note.
- **Biomarkers:** ferritin → iron uses Hallberg 1997's log-log relation (non-heme exponent 0.53, heme 0.30, reference 40 µg/L, clamped ×0.4-2.5). The heme exponent is an approximation of the weaker heme regulation. 25(OH)D <25 nmol/L → calcium ×0.8 (Need 2008). Hemoglobin, B12, folate, zinc and magnesium are context only, because no reliable absorption factor exists.
- **Health context by state:** treated celiac disease, Crohn's in remission, non-cholestatic liver disease, suspected hypochlorhydria, ulcerative colitis and chronic kidney disease get no absorption penalty. PEI ×0.6-0.75 fat-soluble (×0.85-0.95 with enzymes). Gastric bypass: non-heme iron ×0.33-0.45, heme ×0.5-0.6 (Ruz 2012); calcium ×0.6-0.7 (Schafer 2015); food B12 ×0.3-0.4. Total gastrectomy and ileal loss: no intrinsic factor, so only ~1% passive B12. Ileal loss also cuts fat-soluble vitamins ×0.5-0.7.
- **Highest possible:** the same engine with a healthy gut, no inhibitors, vitamin C and fat present, and the upper rate.
- **Interactions listed but not applied (no reliable number):** beta-carotene conversion vs vitamin A status, tryptophan → niacin (60:1, no tryptophan data in the profiles), ALA → EPA/DHA, riboflavin → B6 activation, magnesium → vitamin D activation, protein → zinc/calcium.

## Target model (owner-approved 2026-10-18)
Rule: the RDA never changes (sex/age pick the row). Absorption moves the bars; only needs move the optimal range. Code: `public/bio-calculator/target-model.js`.

| Item | Value | Source |
|---|---|---|
| Optimal range | Owner's old-database optimum ÷ legacy RDA, applied to the personal RDA (low = min(ratio,1.4), high = max(ratio,2)); otherwise 1.4–2× RDA; capped at 95% of a full-intake UL | Owner |
| Vitamin D optimum | 37.5–75 µg | Endocrine Society 2011 |
| Vitamin C optimum | 200–400 mg | Levine 1996 |
| Iron optimum | 1–1.5× RDA | IOM 2001 (no benefit above needs) |
| Sodium optimum | 1500–2300 mg | NASEM 2019 CDRR |
| Absorbed RDA/optimal | intake × DRI reference rate: Fe 18%, Zn 41%, Ca 30%, P 62.5%, B12 50%, folate 50%, Mg 35%; others = engine healthy mixed-meal estimate | IOM 1997–2011; EFSA 2015 |
| Bioactive targets | absorbed × engine conversion factor | engine |
| Energy | Mifflin-St Jeor × activity factor 1.2–1.9 | Mifflin 1990; FAO/WHO |
| Protein | 0.8 g/kg; active 1.2–1.6 g/kg | IOM 2005; ACSM 2016 |
| B1 / B2 / B3 floors | 0.5 / 0.6 / 6.6 per 1000 kcal | NRC 1989 |
| B6 floor | 0.016 mg per g protein eaten | NRC 1989 |
| Magnesium floor | 6 mg/kg | Durlach 1989 |
| Very active iron | ×1.3 | IOM 2001 (30–70% higher) |
| Diet (vegetarian/vegan) | iron ×1.8, zinc ×1.5 on the optimal range, not the RDA | IOM 2001 |
| 25(OH)D < 50 nmol/L | vitamin D optimum 50–100 µg | Endocrine Society 2011 |
| Not applied (no number) | carbs→B1 beyond calories, fat→biotin, PUFA→vitamin E (PUFA not tracked), sweat Na/K/Zn/Mg, ferritin→intake | — |

## Absorption additions (2026-10-18)
- Suspected low stomach acid: non-heme iron ×0.70–0.75, food B12 ×0.6–0.7 (half the confirmed effect; model assumption). Confirmed/achlorhydria unchanged.
- Fibre is an inhibitor, not a target: ≥15 g fibre → carotenoids ×0.7 (Riedl 1999). Fibre's mineral effect comes through phytate, which is already counted, so it isn't counted twice.
- Graded fat: <1.5 g fat → vitamin E 10–20% (Bruno 2006), vitamin D ×0.76 (Dawson-Hughes 2015); vitamin K1 effect noted, no number.

## Bar scale, supplement forms, conditions and needs (2026-10-18)
- **Bar scale (owner spec):** RDA/AI at 35%, 1.4×RDA at 49%, 2×RDA at 70% (linear), log segment 2×RDA→UL at 70–95%, red zone after. No UL: log segment ends at 4×RDA. Absorbed/bioactive UL = UL × reference rate × conversion ("derived"). Supplement-only ULs (Mg, niacin, folic acid, vitamin E) are not drawn on bars.
- **Zero intake** shows 0 absorbed, not "not modeled". **Chloride** absorbed 90–98% (IOM 2005).
- **Supplement forms:** `public/bio-calculator/supplement-forms.js` holds every form (incl. patented/branded) with a cited absolute rate, a relative factor, a conversion factor, or "no form-specific data — base rate". Key values: Mg oxide ×0.4 (Firoz & Graber 2001); Zn citrate/gluconate 55–65%, oxide 45–55% (Wegmüller 2014); FeSO4 10–15%, carbonyl ×0.7 (Gordeuk 1987), ferric ×0.3 (Santiago 2012), heme polypeptide 15–35%; folic acid 85% with food / ~100% fasting, 5-MTHF equivalent (IOM 1998; Pietrzik 2010); D2 counted 60% of D3 (Tripkovic 2012); all-rac vitamin E 50%, tocotrienols 0% toward RDA (IOM 2000); MK-4 ×0.3 (Sato 2012); benfotiamine ×3.6 (Loew 1996); selenite 50–70% vs selenomethionine 90–98% (Thomson 1986); chromium chloride 0.4% (Anderson 1983); omega-3 rTG ×1.24 / EE ×0.73 (Dyerberg 2010); curcumin piperine ×20 (Shoba 1998), Meriva ×29 (Cuomo 2011), BCM-95 ×6.9 (Antony 2008), Theracurmin ×27 (Sasaki 2011). When several forms of one nutrient are taken, the largest dose's form is applied (model simplification).
- **Conditions, absorption:** pernicious anemia → no intrinsic factor; atrophic gastritis / PPI → low stomach acid; metformin → B12 ×0.8 (de Jager 2010, approximate); heavy alcohol → thiamine ×0.5 (Thomson 2000); cystic fibrosis → fat-soluble ×0.6–0.75.
- **Conditions, needs (optimal range only; RDA fixed):** pregnancy/lactation use official DRI rows; thalassemia major, sickle cell, hemolytic anemia → folate 1000–5000 µg (TIF 2021; NHLBI 2014; BSH); thalassemia trait → folate 600–1000 µg (RCOG 2014 practice; no trial-defined dose outside pregnancy); hemochromatosis and thalassemia major → iron capped at RDA; Wilson → copper capped at RDA; kidney stones → vitamin C ≤1000 mg (Thomas 2013), calcium ≥1000 mg (Borghi 2002); CKD → phosphorus ≤1000 mg (KDOQI 2000); CF → vitamin D 20–50 µg (CFF 2012); sarcoidosis → vitamin D capped at RDA; MTHFR TT → riboflavin ≥1.6 mg (McNulty 2012). Others are notes only.
- **Menstruation:** 0.47 mg Fe per mL blood; flows light 20 / normal 35 / heavy 90 mL (Hallberg 1966). Period-day extra absorbed iron = flow×0.47/days − flow×0.47/28 (the part already spread in the RDA); heavy flow adds (flow−35)×0.47/28 every day. Converted to intake with the 18% reference rate.

## Supplement lines, per-form meal effects and supplement-driven needs (Oct 2026)
- Each supplement line (form + dose) is calculated on its own and summed with food; forms are never merged.
- A form's own rate is capped at 100% before the meal acts on it, then the same meal, gut, stomach-acid and biomarker effects apply as for food. Example: benfotiamine (~3.6× thiamine HCl, Loew 1996) is still lowered by active celiac disease.
- Per-form meal effects (`me` in supplement-forms.js): iron bisglycinate phytate penalty mostly lifted (×0.9–1.0; Bovell-Benjamin 2000: 6.0% vs 1.7% for sulfate in high-phytate maize). Heme iron is exempt from phytate, tannin and vitamin C effects (Hallberg 1997). Calcium carbonate needs stomach acid; citrate does not (Recker 1985). Free B12 needs no gastric release. Other forms with no form-specific study get the base nutrient's meal effect.
- The ~1.5 µg intrinsic-factor B12 cap is shared by all B12 in a meal (food and supplements), split pro rata (IOM 1998).
- Supplement → other-nutrient needs (supplement-needs.js): zinc ≥25 mg raises the copper optimal minimum to 1 mg per 40 mg zinc (AREDS 2001; IOM 2001 zinc UL basis). Note only, no number: vitamin D → magnesium (Uwitonze 2018) and K2, folic acid/5-MTHF ≥1 mg → B12 masking (IOM 1998), calcium → magnesium (Seelig 1994), iron ≥25 mg → zinc uptake (Whittaker 1998), nicotinic acid/nicotinamide → methyl groups (Sun 2012), vitamin E ≥670 mg → vitamin K (Booth 2004), creatine → methyl groups (Stead 2006).
- Perfect day: evaluated as 3 meals so per-meal limits apply; nutrients most foods were never lab-tested for are listed as "not checked" rather than scored.
