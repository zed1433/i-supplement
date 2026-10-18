// Rules taken from the owner's old Supabase calculator (calculate_meal_bioactive_profile + dietary_modifier_rules).
// Added alongside the GitHub engine; they never change the engine's absorption formulas.
export const DIET_TYPES=['standard','carnivore','ketogenic','high_protein','high_carb'];
export const DIET_LABELS={standard:'Standard',carnivore:'Carnivore',ketogenic:'Keto',high_protein:'High-protein',high_carb:'High-carb'};
export const DIET_RULES={
  high_protein:{vitamin_b6:[1.4,'Elevated protein turnover scales transaminase enzyme needs']},
  high_carb:{thiamine:[1.4,'Elevated pyruvate dehydrogenase turnover requires higher TDP']},
  carnivore:{vitamin_b6:[1.35,'Heavy amino acid transamination increases pyridoxal-5-phosphate demand']},
  // Removed per docs/formula-review.md (no human evidence): carnivore potassium/magnesium/vitamin C, high-protein magnesium.
  ketogenic:{sodium:[1.4,'Natriuresis of ketosis requires elevated sodium floor']},
};
export function dietAdjustment(key,diet){const r=DIET_RULES[diet]?.[key];return r?{multiplier:r[0],reason:r[1]}:null}
export const FAT_SOLUBLE_KEYS=['vitamin_a','vitamin_d','vitamin_e','vitamin_k'];
export const LOW_FAT_GRAMS=5;
export function lowFatWarning(fatGrams,nutrients={}){return fatGrams<LOW_FAT_GRAMS&&FAT_SOLUBLE_KEYS.some(k=>(nutrients[k]?.total??0)>0)}
// Corrected per docs/formula-review.md: ~2 kcal lost per g fiber (Baer 1997; Novotny 2012); no lectin penalty (no human data).
export const KCAL_LOST_PER_G_FIBER=2;
export function absorbedCalories(kcal,fiberGrams=0){const k=Math.max(0,kcal-KCAL_LOST_PER_G_FIBER*fiberGrams);return{kcal:k,pct:kcal>0?Math.round(k/kcal*1000)/10:100}}
