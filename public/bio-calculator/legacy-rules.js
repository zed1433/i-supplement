// Rules taken from the owner's old Supabase calculator (calculate_meal_bioactive_profile + dietary_modifier_rules).
// Added alongside the GitHub engine; they never change the engine's absorption formulas.
export const DIET_TYPES=['standard','carnivore','ketogenic','high_protein','high_carb'];
export const DIET_LABELS={standard:'Standard',carnivore:'Carnivore',ketogenic:'Keto',high_protein:'High-protein',high_carb:'High-carb'};
export const DIET_RULES={
  high_protein:{magnesium:[1.2,'ATP-Mg chelate requirement for ribosomal protein synthesis'],vitamin_b6:[1.4,'Elevated protein turnover scales transaminase enzyme needs']},
  high_carb:{thiamine:[1.4,'Elevated pyruvate dehydrogenase turnover requires higher TDP']},
  carnivore:{potassium:[1.25,'Lower basal insulin drives higher urinary electrolyte excretion'],magnesium:[1.15,'Higher protein assimilation and ATP utilization'],vitamin_b6:[1.35,'Heavy amino acid transamination increases pyridoxal-5-phosphate demand'],vitamin_c:[0.5,'Reduced glucose competition at GLUT-4 transporters lowers ascorbic requirements']},
  ketogenic:{sodium:[1.4,'Natriuresis of ketosis requires elevated sodium floor']},
};
export function dietAdjustment(key,diet){const r=DIET_RULES[diet]?.[key];return r?{multiplier:r[0],reason:r[1]}:null}
export const FAT_SOLUBLE_KEYS=['vitamin_a','vitamin_d','vitamin_e','vitamin_k'];
export const LOW_FAT_GRAMS=5;
export function lowFatWarning(fatGrams,nutrients={}){return fatGrams<LOW_FAT_GRAMS&&FAT_SOLUBLE_KEYS.some(k=>(nutrients[k]?.total??0)>0)}
// Old formula: absorbed share of calories = max(72, 98 - 0.35 * fiber g - (10 if residual lectin > 30 mg)).
export function calorieAbsorptionPct(fiberGrams=0,lectinMg=0){return Math.round(Math.max(72,98-fiberGrams*0.35-(lectinMg>30?10:0))*100)/100}
export function absorbedCalories(kcal,fiberGrams,lectinMg){const pct=calorieAbsorptionPct(fiberGrams,lectinMg);return{pct,kcal:kcal*pct/100}}
