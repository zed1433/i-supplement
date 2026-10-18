// Target model: fixed RDA, needs-based optimal range, and absorbed / bioactive reference targets.
// Rule: the RDA never changes (only sex/age pick the official row). Absorption changes the bars, not the ranges.
// Ranges move only with needs: energy, macros eaten, weight, activity, diet type and some blood markers.
// Every number is cited; see docs/formula-review.md ("Target model").
import {clinicalEstimate} from './clinical-absorption.js';
import {applyNeedConditions} from './need-conditions.js';

// Owner's optimal targets from the old database (nutrient_daily_targets.csv): [legacy RDA, legacy optimal].
// Used as a ratio on the personal RDA. Missing nutrients use the owner's rule: 1.4–2× RDA.
export const LEGACY_OPTIMAL={calcium:[1000,1200],biotin:[30,100],thiamine:[1.2,2.5],vitamin_a:[900,1500],selenium:[55,120],magnesium:[420,550],vitamin_b6:[1.7,3.5],vitamin_k:[120,300],phosphorus:[700,1000],vitamin_c:[90,250],choline:[550,750],iron:[8,18],vitamin_e:[15,30],copper:[0.9,2],zinc:[11,20],iodine:[150,250],folate:[400,600],vitamin_d:[20,75],riboflavin:[1.3,2.2],vitamin_b12:[2.4,6],sodium:[1500,2500],niacin:[16,25],potassium:[3400,4700],manganese:[2.3,4],pantothenic_acid:[5,8]};

// Research optimums that override the legacy ratio.
export const RESEARCH_OPTIMAL={
  vitamin_d:{abs:[37.5,75],why:'Endocrine Society 2011 (Holick): 37.5–50 µg/day or more keeps 25(OH)D above 75 nmol/L in most adults; capped below the UL.'},
  vitamin_c:{abs:[200,400],why:'Levine et al., PNAS 1996: plasma and cells saturate at ~200 mg/day; above ~400 mg absorption falls and the extra is excreted.'},
  iron:{rel:[1,1.5],why:'IOM 2001: no benefit above needs in iron-replete adults and excess iron is not excreted, so the optimum stays close to the RDA.'},
  sodium:{abs:[1500,2300],why:'NASEM 2019: Chronic Disease Risk Reduction intake 2300 mg; the optimum is a ceiling, not a goal.'},
};

// Fraction absorbed that the DRI committees assumed when setting the RDA (healthy adult, mixed diet).
export const REFERENCE_RATES={
  iron:[0.18,'IOM 2001: the RDA assumes 18% absorption of iron from a mixed Western diet.'],
  zinc:[0.41,'IOM 2001: the zinc requirement uses ~41% fractional absorption (men).'],
  calcium:[0.30,'IOM 2011: ~30% calcium absorption from a mixed diet underlies the RDA.'],
  phosphorus:[0.625,'IOM 1997: 62.5% phosphorus absorption used to set the EAR.'],
  vitamin_b12:[0.50,'IOM 1998: the RDA assumes ~50% absorption of food B12.'],
  folate:[0.50,'IOM 1998: food folate ~50% bioavailable (basis of DFE).'],
  magnesium:[0.35,'EFSA 2015: 30–40% absorption from usual diets.'],
};
const model={};
// Model reference: the engine's healthy-gut estimate for a balanced meal (no inhibitors), used where the DRI states no rate.
export function referenceRates(key){
  if(model[key])return model[key];
  const meal={fat:20,carbohydrate:60,protein:25,nutrients:{},antinutrients:{}};
  const c=clinicalEstimate(key,{total:100,animal:50,plant:50,supplement:0,unknown:0},meal,{});
  const fixed=REFERENCE_RATES[key];
  const engineRate=c?(c.min+c.max)/200:null,phi=c&&c.min+c.max>0?c.converted/((c.min+c.max)/2):null;
  return model[key]={rate:fixed?fixed[0]:engineRate,phi:phi??1,why:fixed?fixed[1]:engineRate!=null?'Model reference: healthy-gut estimate for a balanced mixed meal (no DRI rate published).':null};
}

// ---- Body, energy and protein ----
export const ACTIVITY={sedentary:[1.2,'Sedentary'],light:[1.375,'Light (1–3 days/week)'],moderate:[1.55,'Moderate (3–5 days/week)'],very:[1.725,'Very active (6–7 days/week)'],athlete:[1.9,'Athlete / physical job']};
// Mifflin-St Jeor 1990 resting energy × activity factor (FAO/WHO/UNU PAL convention).
export function estimateEnergy(s={}){const w=+s.weight,h=+s.height,a=+s.age||30;if(!(w>0&&h>0))return null;const bmr=10*w+6.25*h-5*a+(s.sex==='female'?-161:5);return Math.round(bmr*(ACTIVITY[s.activity]??ACTIVITY.sedentary)[0])}
export function energyFor(s={}){return s.energyMode!=='manual'&&estimateEnergy(s)?estimateEnergy(s):(+s.energyKcal||2500)}
// Protein: RDA 0.8 g/kg (IOM 2005); active people 1.2–1.6 g/kg (ACSM/AND/DC position stand 2016).
export function proteinNeed(s={}){const w=+s.weight;if(!(w>0))return null;const active=['moderate','very','athlete'].includes(s.activity);return{rda:+(0.8*w).toFixed(0),min:+((active?1.2:0.8)*w).toFixed(0),max:+((active?1.6:1.0)*w).toFixed(0)}}

// ---- Optimal range (intake) ----
// meal: calculateMeal() result (protein eaten etc.), markers: latestBiomarkers()
export function optimalRange(key,t,s={},meal={},markers={},dietRule=null){
  const rda=t.rda??t.ai;if(rda==null)return null;const notes=[];let lo,hi;
  const r=RESEARCH_OPTIMAL[key],L=LEGACY_OPTIMAL[key];
  if(r?.abs){[lo,hi]=r.abs;notes.push(r.why)}
  else if(r?.rel){lo=rda*r.rel[0];hi=rda*r.rel[1];notes.push(r.why)}
  else if(L){const ratio=L[1]/L[0];lo=rda*Math.min(ratio,1.4);hi=rda*Math.max(ratio,2);notes.push(`Your optimal value (${L[1]} vs RDA ${L[0]}) scaled to your RDA.`)}
  else{lo=rda*1.4;hi=rda*2;notes.push('Your rule: 1.4–2× the RDA (no published optimum).')}
  const kcal=energyFor(s),floor=(v,why)=>{if(v>lo){lo=v;notes.push(why)}};
  // Energy- and macro-linked needs (NRC 1989 RDA basis; IOM 1998 keeps the link qualitatively).
  if(key==='thiamine')floor(kcal/1000*0.5,`Calories ${kcal}: thiamine 0.5 mg per 1000 kcal (NRC 1989).`);
  if(key==='riboflavin')floor(kcal/1000*0.6,`Calories ${kcal}: riboflavin 0.6 mg per 1000 kcal (NRC 1989).`);
  if(key==='niacin')floor(kcal/1000*6.6,`Calories ${kcal}: niacin 6.6 mg NE per 1000 kcal (NRC 1989).`);
  if(key==='vitamin_b6'&&meal.protein>0)floor(meal.protein*0.016,`Protein ${Math.round(meal.protein)} g: B6 0.016 mg per g protein (NRC 1989).`);
  if(key==='thiamine'&&meal.carbohydrate>0)notes.push('Carbohydrate: thiamine need rises with carbohydrate burned; covered through calories (no per-gram figure published).');
  if(key==='biotin'&&meal.fat>0)notes.push('Fat: biotin is a cofactor of fat synthesis, but no published per-gram need exists, so no change.');
  if(key==='vitamin_e')notes.push('Polyunsaturated fat raises vitamin E need (~0.4–0.6 mg per g PUFA, EFSA 2015); PUFA is not tracked per food, so not applied yet.');
  if(key==='magnesium'&&+s.weight>0)floor(+s.weight*6,`Weight ${s.weight} kg: magnesium 6 mg/kg (Durlach 1989; Seelig).`);
  const active=['very','athlete'].includes(s.activity);
  if(active&&key==='iron'){lo*=1.3;hi*=1.3;notes.push('High activity: iron need up to 30–70% higher in endurance athletes (IOM 2001); ×1.3 applied.')}
  if(active&&['sodium','potassium','zinc','magnesium'].includes(key))notes.push('High activity: sweat losses raise need, but amounts vary too much to apply a fixed number.');
  if(dietRule){lo*=dietRule[0];hi*=dietRule[0];notes.push(`Diet: ×${dietRule[0]} — ${dietRule[1]}`)}
  const d=markers.vitamin_d?.value;if(key==='vitamin_d'&&d&&d<50){lo=Math.max(lo,50);hi=Math.max(hi,100);notes.push(`25(OH)D ${Math.round(d)} nmol/L (<50): repletion range 50–100 µg/day (Endocrine Society 2011), within the UL.`)}
  const fer=markers.ferritin?.value;if(key==='iron'&&fer&&fer<30)notes.push(`Ferritin ${Math.round(fer)} µg/L: low stores. Your body already absorbs more (shown on the absorbed bar); repletion dosing is a clinical decision.`);
  ({lo,hi}=applyNeedConditions(key,lo,hi,rda,s,notes));
  if(hi<lo*1.2)hi=lo*1.2;
  if(t.ul!=null&&!t.ulScope){hi=Math.min(hi,t.ul*0.95);lo=Math.min(lo,hi)}
  return{lo,hi,notes};
}

// Targets for the three bars. Absorbed/bioactive = intake targets × reference rate × conversion.
export function barTargets(key,t,opt){
  const rda=t.rda??t.ai,ref=referenceRates(key);
  const intake={rda,lo:opt?.lo,hi:opt?.hi,ul:t.ulScope?null:t.ul};
  if(ref.rate==null)return{intake,absorbed:null,bioactive:null,ref};
  const a=v=>v==null?null:v*ref.rate,b=v=>v==null?null:v*ref.rate*ref.phi;
  const ul=t.ul!=null&&!t.ulScope?t.ul:null;
  return{intake,absorbed:{rda:a(rda),lo:a(opt?.lo),hi:a(opt?.hi),ul:a(ul),derived:true},bioactive:{rda:b(rda),lo:b(opt?.lo),hi:b(opt?.hi),ul:b(ul),derived:true},ref};
}
