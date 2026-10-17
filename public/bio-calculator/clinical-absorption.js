// Verbatim JS port of lib/clinicalAbsorptionEngine.ts from github.com/18387093agg/bio-calculator (rebuilt version).
// Do not change formulas here — change them in the source repo, then re-copy.
const clamp=(v,lo=0.01,hi=0.98)=>Math.min(hi,Math.max(lo,Number.isFinite(v)?v:lo));
const lowAcid=(p)=>p.gastricAcid==='hypochlorhydria'||p.gastricAcid==='achlorhydria';
const hemeFraction=(c,f)=>c.hemeIronFraction!=null?Math.min(1,Math.max(0,c.hemeIronFraction)):f.includes('heme')?1:c.isPureAnimalFood?0.4:0;

function base(n,c,f){
  const a=c.isPureAnimalFood;
  switch(n){
    case 'Vitamin A': return a?[.7,.9,1,'Preformed retinol']:[c.carotenoidMatrixCooked&&c.totalFatGrams>=5?.55:c.carotenoidMatrixCooked?.35:c.totalFatGrams>=5?.3:.2,c.carotenoidMatrixCooked&&c.totalFatGrams>=5?.95:c.carotenoidMatrixCooked?.7:c.totalFatGrams>=5?.6:.45,1,'Provitamin A / RAE'];
    case 'Vitamin D':return[.55,.8,1,'Vitamin D'];
    case 'Vitamin E':return[.5,.8,1,'Vitamin E'];
    case 'Vitamin K':return[a?.4:.15,a?.7:.4,1,a?'Menaquinone':'Vitamin K1'];
    case 'Thiamine (B1)':return f.includes('ttfd')?[.8,.95,1,'TTFD']:[.5,.8,1,'Thiamine'];
    case 'Riboflavin (B2)':return[.6,.85,1,'Riboflavin'];
    case 'Niacin (B3)':return[.55,.85,a?1:.9,'Niacin'];
    case 'Pantothenic Acid (B5)':return[.4,.6,1,'Pantothenic acid'];
    case 'Vitamin B6':return[a?.7:.4,a?.9:.6,a?1:.75,a?'PLP/PMP':'Pyridoxine'];
    case 'Biotin (B7)':return[.5,.8,1,'Biotin'];
    case 'Folate (B9)':return[.4,.6,1,'Food folate / 5-MTHF'];
    case 'Vitamin B12':return[.45,.6,1,'Cobalamin'];
    case 'Vitamin C':return[.7,.9,1,'Ascorbate'];
    case 'Choline':return[.6,.85,1,'Choline'];
    case 'Iron':{const h=hemeFraction(c,f);return[h*.15+(1-h)*.03,h*.35+(1-h)*.12,1,h>.05?'Mixed iron ('+Math.round(h*100)+'% heme)':'Non-heme iron'];}
    case 'Zinc':return[a?.3:.15,a?.5:.3,1,'Dietary zinc'];
    case 'Copper':return[.5,.7,1,'Dietary copper'];
    case 'Magnesium':return[a?.35:.25,a?.5:.4,1,'Dietary magnesium'];
    case 'Calcium':return[.25,.4,1,'Dietary calcium'];
    case 'Selenium':return[.7,.9,1,'Selenium'];
    case 'Iodine':return[.9,.98,1,'Iodide / iodine'];
    case 'Manganese':return[.03,.08,1,'Manganese'];
    case 'Molybdenum':return[.7,.93,1,'Molybdate'];
    case 'Chromium':return f.includes('picolinate')?[.02,.05,1,'Chromium picolinate']:[.005,.02,1,'Chromium'];
    case 'Phosphorus':return[.55,.7,1,'Phosphate'];
    case 'Potassium':case 'Sodium':return[.85,.95,1,n];
    default:return[.45,.7,1,f||'Dietary form'];
  }
}

export function evaluateEntericBioavailability(nutrient,chemicalForm,category,pathology,context){
  const f=(chemicalForm||'').toLowerCase();let [min,max,phi,formName]=base(nutrient,context,f);const notes=[];
  const h=nutrient==='Iron'?hemeFraction(context,f):0,nonHeme=1-h;
  if((context.totalOxalatesMg||0)>50&&!context.isPureAnimalFood){if(nutrient==='Calcium'){min*=.8;max*=.9;notes.push('Meal oxalate load reduces calcium availability in the model.');}if(nutrient==='Magnesium'){min*=.85;max*=.9;}}
  if((context.totalPhytatesMg||0)>100&&!context.isPureAnimalFood){if(nutrient==='Zinc'){min*=.7;max*=.8;notes.push('Meal phytate load reduces zinc availability in the model.');}if(nutrient==='Iron'&&nonHeme>0){min*=.5;max*=.6;notes.push('Meal phytate load reduces non-heme iron availability in the model.');}if(nutrient==='Calcium'){min*=.85;max*=.9;}}
  if(context.coingestedTannins&&nutrient==='Iron'&&nonHeme>0){min*=.35;max*=.45;notes.push('Co-ingested tannins reduce non-heme iron absorption.');}
  if(nutrient==='Iron'&&nonHeme>0){if(context.totalCalciumMg>350){min*=.65;max*=.75;}if(context.totalZincMg>25){min*=.75;max*=.85;}if(context.totalVitaminCMg>=50){min*=1.25;max*=1.4;notes.push('Vitamin C enhances non-heme iron absorption.');}}
  if(nutrient==='Copper'&&context.totalCopperMg>0&&context.totalZincMg/context.totalCopperMg>20){min*=.4;max*=.5;notes.push('High meal zinc:copper ratio is modeled as reducing copper absorption.');}
  if(nutrient==='Magnesium'&&context.totalCalciumMg>800){min*=.75;max*=.85;}
  if(lowAcid(pathology)){
    if(nutrient==='Iron'){min*=h+nonHeme*.4;max*=h+nonHeme*.5;if(nonHeme>0)notes.push('Low stomach acid reduces the non-heme fraction; heme iron is not given the same penalty.');}
    if(nutrient==='Vitamin B12'){const free=/supplement|crystalline|cyanocobalamin|methylcobalamin|hydroxo/.test(f);if(!free){min*=.3;max*=.4;notes.push('Low stomach acid reduces release of food-bound B12 from dietary protein.');}else notes.push('Free/crystalline supplemental B12 does not require gastric protein release.');}
    if(nutrient==='Calcium'&&f.includes('carbonate')){min*=.25;max*=.35;}
  }
  if(pathology.pathology==='crohns_celiac'){min*=.6;max*=.7;}
  if(pathology.bileImpairment&&category==='fat_soluble_vitamin'){min*=.55;max*=.7;}
  min=clamp(min);max=clamp(Math.max(min,max));
  return {sanitizedChemicalForm:formName,effectiveActiveRate:clamp((min+max)/2),rateMin:min,rateMax:max,conversionPhi:clamp(phi,0,1),clinicalMechanismNotes:notes};
}

// ---- Adapter (site-specific): maps this site's nutrient keys and settings onto the engine above ----
export const ENGINE_NAMES={vitamin_a:'Vitamin A',vitamin_d:'Vitamin D',vitamin_e:'Vitamin E',vitamin_k:'Vitamin K',thiamine:'Thiamine (B1)',riboflavin:'Riboflavin (B2)',niacin:'Niacin (B3)',pantothenic_acid:'Pantothenic Acid (B5)',vitamin_b6:'Vitamin B6',biotin:'Biotin (B7)',folate:'Folate (B9)',vitamin_b12:'Vitamin B12',vitamin_c:'Vitamin C',choline:'Choline',iron:'Iron',zinc:'Zinc',copper:'Copper',magnesium:'Magnesium',calcium:'Calcium',selenium:'Selenium',iodine:'Iodine',manganese:'Manganese',molybdenum:'Molybdenum',chromium:'Chromium',phosphorus:'Phosphorus',potassium:'Potassium',sodium:'Sodium'};
// Meal tannin load treated as 'co-ingested tannins' for non-heme iron (Brune et al., Eur J Clin Nutr 1989;43:547-57: dose-dependent inhibition from ~5-25 mg galloyl groups).
export const TANNIN_IRON_THRESHOLD_MG=50;
const FAT_SOLUBLE=new Set(['vitamin_a','vitamin_d','vitamin_e','vitamin_k']);
export function pathologyFromSettings(settings={}){
  const ids=(settings.conditions??[]).map(c=>typeof c==='string'?c:c.id);
  const g=String(settings.gastricAcid??'normal').toLowerCase();
  const gastricAcid=g.includes('achlor')?'achlorhydria':g!=='normal'||ids.includes('hypochlorhydria')||ids.includes('gastrectomy')?'hypochlorhydria':'normal';
  const pathology=ids.includes('celiac_disease')||ids.includes('crohn_disease')?'crohns_celiac':ids.includes('ileal_resection')?'ileal_resection':'none';
  return {gastricAcid,pathology,bileImpairment:ids.includes('chronic_liver_disease')};
}
// value: {total, animal, plant, supplement, unknown}; meal: calculateMeal() result
export function clinicalEstimate(key,value,meal,settings){
  const name=ENGINE_NAMES[key];if(!name||!(value?.total>0))return null;
  const n=meal?.nutrients??{},amt=k=>n[k]?.total??0;
  const ctx={totalFatGrams:meal?.fat??0,totalCarbsGrams:meal?.carbohydrate??0,totalFiberGrams:0,totalZincMg:amt('zinc'),totalCopperMg:amt('copper'),totalIronMg:amt('iron'),totalCalciumMg:amt('calcium'),totalVitaminCMg:amt('vitamin_c'),totalPhytatesMg:meal?.antinutrients?.phytate?.total??0,totalOxalatesMg:meal?.antinutrients?.oxalate?.total??0,coingestedTannins:(meal?.antinutrients?.tannin?.total??0)>=TANNIN_IRON_THRESHOLD_MG};
  const p=pathologyFromSettings(settings),cat=FAT_SOLUBLE.has(key)?'fat_soluble_vitamin':'other';
  const parts=[['animal',value.animal??0,true,''],['plant',(value.plant??0)+(value.unknown??0),false,''],['supplement',value.supplement??0,false,'supplement']];
  let min=0,max=0,conv=0,notes=new Set();
  for(const [,amount,animal,form] of parts){if(!(amount>0))continue;const r=evaluateEntericBioavailability(name,form,cat,p,{...ctx,isPureAnimalFood:animal});min+=amount*r.rateMin;max+=amount*r.rateMax;conv+=amount*(r.rateMin+r.rateMax)/2*r.conversionPhi;r.clinicalMechanismNotes.forEach(x=>notes.add(x))}
  return {min,max,converted:conv,notes:[...notes]};
}
