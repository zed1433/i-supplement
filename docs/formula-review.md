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
