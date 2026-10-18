// Personal model: sex/age reference intakes, UL scope, diet target rules and biomarker effects.
// Every number cites its source; see docs/formula-review.md ("Personal model").

// US National Academies DRIs (adults, non-pregnant). Order: M19-30, M31-50, M51-70, M71+, F19-30, F31-50, F51-70, F71+.
// Sources: IOM DRI reports 1997 (Ca, P, Mg, D, F), 1998 (B vitamins, choline), 2000 (C, E, Se), 2001 (A, K, Fe, Zn, Cu, Mn, I, Cr, Mo),
// NASEM 2011 (Ca, D) and NASEM 2019 (Na, K). ULs are age-dependent only where listed.
const T={
  iron:{ref:[8,8,8,8,18,18,8,8]},
  zinc:{ref:[11,11,11,11,8,8,8,8]},
  calcium:{ref:[1000,1000,1000,1200,1000,1000,1200,1200],ul:[2500,2500,2000,2000,2500,2500,2000,2000]},
  magnesium:{ref:[400,420,420,420,310,320,320,320]},
  phosphorus:{ref:[700,700,700,700,700,700,700,700],ul:[4000,4000,4000,3000,4000,4000,4000,3000]},
  vitamin_a:{ref:[900,900,900,900,700,700,700,700]},
  vitamin_c:{ref:[90,90,90,90,75,75,75,75]},
  vitamin_d:{ref:[15,15,15,20,15,15,15,20]},
  vitamin_e:{ref:[15,15,15,15,15,15,15,15]},
  vitamin_k:{ref:[120,120,120,120,90,90,90,90]},
  thiamine:{ref:[1.2,1.2,1.2,1.2,1.1,1.1,1.1,1.1]},
  riboflavin:{ref:[1.3,1.3,1.3,1.3,1.1,1.1,1.1,1.1]},
  niacin:{ref:[16,16,16,16,14,14,14,14]},
  vitamin_b6:{ref:[1.3,1.3,1.7,1.7,1.3,1.3,1.5,1.5]},
  choline:{ref:[550,550,550,550,425,425,425,425]},
  chloride:{ref:[2300,2300,2000,1800,2300,2300,2000,1800]},
  potassium:{ref:[3400,3400,3400,3400,2600,2600,2600,2600]},
  manganese:{ref:[2.3,2.3,2.3,2.3,1.8,1.8,1.8,1.8]},
  chromium:{ref:[35,35,30,30,25,25,20,20]},
  fluoride:{ref:[4,4,4,4,3,3,3,3]},
};
export const SEXES={male:'Male',female:'Female'};
export function ageBand(age){const a=Number(age)||30;return a<31?0:a<51?1:a<71?2:3}
export function personalTarget(key,base,settings={}){
  const row=T[key];const sex=settings.sex==='female'?'female':'male';const idx=(sex==='female'?4:0)+ageBand(settings.age);
  const out={...base};
  if(row){const v=row.ref[idx],field=base.rda!=null?'rda':'ai';const old=base[field];out[field]=v;
    if(base.optimalMin===old)out.optimalMin=v;if(base.optimalMax===old)out.optimalMax=v;
    if(row.ul)out.ul=row.ul[idx];
    out.population=`${SEXES[sex]}, age ${['19–30','31–50','51–70','71+'][ageBand(settings.age)]} (US National Academies DRI)`;}
  else out.population=`All adults (same DRI for both sexes)`;
  if(UL_SCOPE[key])out.ulScope=UL_SCOPE[key];
  return out;
}
// ULs that apply only to some sources (IOM): the bar compares only that part of intake with the UL.
export const UL_SCOPE={
  magnesium:{part:'supplement',label:'UL applies to supplements/medicines only (IOM 1997)'},
  niacin:{part:'supplement',label:'UL applies to supplemental/fortificant niacin only (IOM 1998)'},
  folate:{part:'supplement',label:'UL applies to synthetic folic acid only (IOM 1998)'},
  vitamin_e:{part:'supplement',label:'UL applies to supplemental α-tocopherol only (IOM 2000)'},
  vitamin_a:{part:'preformed',label:'UL applies to preformed vitamin A (animal foods + supplements), not carotenoids (IOM 2001)'},
};
export function ulComparable(key,value){const s=UL_SCOPE[key];if(!s)return value.total;if(s.part==='supplement')return value.supplement??0;return (value.animal??0)+(value.supplement??0)}

// Diet type target rules. Only adjustments published by the IOM are applied; the old database multipliers had no human evidence.
export const DIET_TARGET_RULES={
  vegetarian:{iron:[1.8,'IOM 2001: iron requirement is 1.8× higher for vegetarians because of lower bioavailability'],zinc:[1.5,'IOM 2001: vegetarians may need up to 50% more zinc (phytate)']},
  vegan:{iron:[1.8,'IOM 2001: iron requirement is 1.8× higher for vegetarians/vegans because of lower bioavailability'],zinc:[1.5,'IOM 2001: vegetarians may need up to 50% more zinc (phytate)']},
};
export const DIET_NOTES={
  vegan:'No reliable plant source of B12: a supplement or fortified food is needed (IOM 1998).',
  ketogenic:'Early ketosis increases sodium loss; no published multiplier, so the target is unchanged.',
  high_protein:'IOM links B6 needs to protein intake but gives no multiplier; target unchanged.',
  high_carb:'Thiamine already scales with your energy requirement; no extra multiplier.',
  carnivore:'No human data for diet-specific targets; targets unchanged.',
};

// ---- Biomarkers ----
// Canonical unit + conversions. factor converts the alternative unit to the canonical one.
export const BIOMARKERS={
  ferritin:{name:'Ferritin',unit:'µg/L',alt:{'ng/mL':1},range:'15–150 (F) / 30–400 (M)'},
  vitamin_d:{name:'Vitamin D, 25(OH)D',unit:'nmol/L',alt:{'ng/mL':2.496},range:'50–125'},
  hemoglobin:{name:'Hemoglobin',unit:'g/L',alt:{'g/dL':10},range:'120–160 (F) / 130–170 (M)'},
  vitamin_b12:{name:'Vitamin B12',unit:'pmol/L',alt:{'pg/mL':0.738},range:'148–600'},
  folate:{name:'Folate (serum)',unit:'nmol/L',alt:{'ng/mL':2.266},range:'>10'},
  zinc:{name:'Zinc (serum)',unit:'µmol/L',alt:{'µg/dL':0.153},range:'10.7–18.4'},
  magnesium:{name:'Magnesium (serum)',unit:'mmol/L',alt:{'mg/dL':0.411},range:'0.75–0.95'},
};
export function biomarkerId(name){const n=String(name||'').toLowerCase();if(n.includes('ferritin'))return'ferritin';if(n.includes('25')||n.includes('vitamin d'))return'vitamin_d';if(n.includes('hemo')||n.includes('haemo')||n==='hb'||n==='hgb')return'hemoglobin';if(n.includes('b12')||n.includes('cobal'))return'vitamin_b12';if(n.includes('fol'))return'folate';if(n.includes('zinc'))return'zinc';if(n.includes('magnes'))return'magnesium';return null}
export function canonicalValue(row){const id=biomarkerId(row.marker),b=BIOMARKERS[id];if(!b)return null;const v=Number(row.value);if(!Number.isFinite(v)||v<=0)return null;if(row.unit===b.unit)return v;const f=b.alt[row.unit];return f?v*f:null}
export function latestBiomarkers(rows=[]){const out={};for(const r of [...rows].sort((a,b)=>String(a.date).localeCompare(String(b.date)))){const id=biomarkerId(r.marker),v=canonicalValue(r);if(id&&v!=null)out[id]={value:v,date:r.date}}return out}

// Absorption effects of status. Only two have quantitative human data:
// 1) Ferritin → iron: Hallberg et al., Am J Clin Nutr 1997;66:347-56 — log-log inverse relation (non-heme slope ≈ -0.53,
//    heme slope ≈ -0.30) between serum ferritin and absorption. Engine rates are treated as the 40 µg/L reference.
// 2) 25(OH)D → calcium: Need et al., Am J Clin Nutr 2008;88:1784 — calcium absorption falls only when 25(OH)D is below ~25 nmol/L;
//    Heaney et al. 2003 found ~+65% absorption between 50 and 86 nmol/L but later work (Gallagher 2012) did not reproduce it.
export const FERRITIN_REF=40;
export function biomarkerEffects(markers={}){
  const fx={};const fer=markers.ferritin?.value;
  if(fer){const cl=x=>Math.min(2.5,Math.max(0.4,x));fx.iron={nonHeme:cl((FERRITIN_REF/fer)**0.53),heme:cl((FERRITIN_REF/fer)**0.30),note:`Ferritin ${Math.round(fer)} µg/L: non-heme iron ×${cl((FERRITIN_REF/fer)**0.53).toFixed(2)}, heme ×${cl((FERRITIN_REF/fer)**0.30).toFixed(2)} (Hallberg 1997)`}}
  const d=markers.vitamin_d?.value;
  if(d&&d<25)fx.calcium={factor:0.8,note:`25(OH)D ${Math.round(d)} nmol/L (<25): calcium absorption ×0.8 (Need 2008)`};
  return fx;
}
export const BIOMARKER_CONTEXT_ONLY={
  hemoglobin:'Context only: hemoglobin reflects anaemia but absorption is regulated by iron stores (ferritin), so no factor is applied.',
  vitamin_b12:'Context only: B12 absorption is not up-regulated by low status.',
  folate:'Context only: folate absorption does not depend on status.',
  zinc:'Context only: serum zinc is a poor marker of zinc status, so no absorption factor is applied.',
  magnesium:'Context only: serum magnesium is a poor marker of body stores.',
};
