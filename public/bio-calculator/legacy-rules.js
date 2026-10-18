// Rules taken from the owner's old Supabase calculator (calculate_meal_bioactive_profile + dietary_modifier_rules).
// Added alongside the GitHub engine; they never change the engine's absorption formulas.
export const DIET_TYPES=['standard','vegetarian','vegan','carnivore','ketogenic','high_protein','high_carb'];
export const DIET_LABELS={standard:'Standard',vegetarian:'Vegetarian',vegan:'Vegan',carnivore:'Carnivore',ketogenic:'Keto',high_protein:'High-protein',high_carb:'High-carb'};
// Old-database multipliers removed (no published human evidence; thiamine already scales with energy). Published IOM diet rules live in personal-model.js.
export const DIET_RULES={};
export function dietAdjustment(key,diet){const r=DIET_RULES[diet]?.[key];return r?{multiplier:r[0],reason:r[1]}:null}
export const FAT_SOLUBLE_KEYS=['vitamin_a','vitamin_d','vitamin_e','vitamin_k'];
export const LOW_FAT_GRAMS=5;
export function lowFatWarning(fatGrams,nutrients={}){return fatGrams<LOW_FAT_GRAMS&&FAT_SOLUBLE_KEYS.some(k=>(nutrients[k]?.total??0)>0)}
// Corrected per docs/formula-review.md: ~2 kcal lost per g fiber (Baer 1997; Novotny 2012); no lectin penalty (no human data).
export const KCAL_LOST_PER_G_FIBER=2;
export function absorbedCalories(kcal,fiberGrams=0){const k=Math.max(0,kcal-KCAL_LOST_PER_G_FIBER*fiberGrams);return{kcal:k,pct:kcal>0?Math.round(k/kcal*1000)/10:100}}

// Extra processing steps from the owner's old preparation_methods table (duplicates merged).
// heat = share of heat-sensitive vitamins kept; anti = share of phytate/oxalate/tannin/lectin removed.
// Heat loss is applied only to foods listed as raw, so already-cooked USDA/CIQUAL values are not penalised twice.
export const PROCESSING=[
  {id:'none',label:'None',heat:1,anti:0},
  {id:'soaked',label:'Soaked (12–24 h)',heat:.95,anti:.35},
  {id:'sprouted',label:'Sprouted / germinated',heat:.9,anti:.65},
  {id:'fermented',label:'Fermented (sourdough / lactic)',heat:.9,anti:.6},
  {id:'pressure',label:'Pressure cooked',heat:.85,anti:.75},
  {id:'boiled_drained',label:'Boiled, water discarded',heat:.8,anti:.5},
  {id:'boiled_kept',label:'Boiled, broth eaten',heat:.95,anti:.3},
  {id:'steamed',label:'Steamed',heat:.9,anti:0},
  {id:'slow',label:'Slow cooked / braised',heat:.9,anti:0},
  {id:'sous_vide',label:'Sous-vide / poached',heat:.98,anti:0},
  {id:'roasted',label:'Oven roasted / baked',heat:.82,anti:0},
  {id:'pan_fried',label:'Pan fried',heat:.88,anti:0},
  {id:'air_fried',label:'Air fried',heat:.85,anti:0},
  {id:'grilled',label:'Grilled / charred',heat:.75,anti:0},
  {id:'smoked',label:'Smoked',heat:.8,anti:0},
  {id:'deep_fried',label:'Deep fried',heat:.7,anti:0},
];
export const HEAT_SENSITIVE=['vitamin_c','thiamine','folate','vitamin_b6','riboflavin','pantothenic_acid'];
const ANTI_KEYS=['phytate','oxalate','tannin','lectin_load'];
export function applyProcessing(item){
  const m=PROCESSING.find(p=>p.id===item?.processing);
  if(!m||m.id==='none'||!item.food)return item;
  const raw=/\braw\b/i.test(item.food.name)||/raw/i.test(typeof item.preparation==='string'?item.preparation:item.preparation?.method??'');
  const nutrients={...item.food.nutrients};
  for(const [key,v] of Object.entries(nutrients)){
    if(typeof v!=='number')continue;
    const base=key.split('@')[0];
    if(ANTI_KEYS.includes(base))nutrients[key]=v*(1-m.anti);
    else if(raw&&HEAT_SENSITIVE.includes(base))nutrients[key]=v*m.heat;
  }
  return{...item,food:{...item.food,nutrients}};
}
