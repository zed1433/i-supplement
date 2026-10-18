// Conditions and life stages that change nutrient NEEDS (optimal range) and, where cited, absorption.
// Absorption effects live in clinical-absorption.js (pathologyFromSettings reads settings.needConditions).
// Every number is cited; anything without one is a note only. See docs/formula-review.md ("Conditions and needs").

export const NEED_CONDITIONS=[
  ['pregnancy','Pregnancy','Official pregnancy RDAs replace the adult row (IOM).'],
  ['breastfeeding','Breastfeeding','Official lactation RDAs replace the adult row (IOM).'],
  ['thal_minor','Beta-thalassemia minor (trait)','Mild extra red-cell turnover; folate need raised.'],
  ['thal_major','Beta-thalassemia major / intermedia','High red-cell turnover and iron overload risk.'],
  ['sickle_cell','Sickle cell disease','Chronic hemolysis raises folate need.'],
  ['hemolytic_anemia','Other hemolytic anemia','Chronic hemolysis raises folate need.'],
  ['hemochromatosis','Hereditary hemochromatosis','Iron is over-absorbed; iron becomes a ceiling, not a goal.'],
  ['wilson','Wilson disease','Copper is not excreted; copper becomes a ceiling.'],
  ['pernicious_anemia','Pernicious anemia','No intrinsic factor: only ~1% passive B12 uptake.'],
  ['atrophic_gastritis','Atrophic gastritis','Low stomach acid: less food B12 and plant iron released.'],
  ['ppi_use','Acid-blocker use (PPI / H2)','Low stomach acid: less food B12 and plant iron; low magnesium risk.'],
  ['metformin','Metformin use','Lower B12 uptake.'],
  ['alcohol_use_disorder','Heavy alcohol use','Lower thiamine absorption; higher B1, folate, magnesium, zinc losses.'],
  ['cystic_fibrosis','Cystic fibrosis','Fat and fat-soluble vitamin malabsorption; higher vitamin D need.'],
  ['kidney_stones','Calcium-oxalate kidney stones','Vitamin C ceiling; normal calcium protects.'],
  ['hypothyroidism','Hypothyroidism','Iodine and selenium context.'],
  ['hyperparathyroidism','Primary hyperparathyroidism','Calcium / vitamin D caution.'],
  ['sarcoidosis','Sarcoidosis','Excess active vitamin D; vitamin D caution.'],
  ['mthfr_tt','MTHFR 677TT genotype','Riboflavin supports the enzyme; folate form context.'],
  ['sibo','Small intestinal bacterial overgrowth (SIBO)','Bacteria consume B12; fat malabsorption possible.'],
  ['lactose_intolerance','Lactose intolerance','Calcium intake context.'],
];

// Official DRI life-stage rows (IOM/National Academies, adults 19–50). Replace RDA/AI.
const PREG={iron:27,folate:600,iodine:220,zinc:11,choline:450,vitamin_a:770,vitamin_b6:1.9,vitamin_b12:2.6,vitamin_c:85,riboflavin:1.4,thiamine:1.4,niacin:18,pantothenic_acid:6,biotin:30,magnesium:350,copper:1000,selenium:60,manganese:2.0,molybdenum:50,chromium:30,potassium:2900,calcium:1000,vitamin_d:15,vitamin_e:15,vitamin_k:90,phosphorus:700};
const LACT={iron:9,folate:500,iodine:290,zinc:12,choline:550,vitamin_a:1300,vitamin_b6:2.0,vitamin_b12:2.8,vitamin_c:120,riboflavin:1.6,thiamine:1.4,niacin:17,pantothenic_acid:7,biotin:35,magnesium:310,copper:1300,selenium:70,manganese:2.6,molybdenum:50,chromium:45,potassium:2800,calcium:1000,vitamin_d:15,vitamin_e:19,vitamin_k:90,phosphorus:700};
export function lifeStage(key,base,s={}){
  const nc=s.needConditions??[];if(s.sex!=='female')return base;
  const row=nc.includes('pregnancy')?[PREG,'Pregnancy']:nc.includes('breastfeeding')?[LACT,'Breastfeeding']:null;
  if(!row||row[0][key]==null)return base;
  const v=row[0][key],out={...base,population:`${base.population??''} · ${row[1]} row (US National Academies DRI)`};
  if(base.rda!=null)out.rda=v;else out.ai=v;return out;
}

// Menstrual iron: ~0.47 mg iron per mL blood (Hb ~14 g/dL × 3.4 mg Fe/g). Median loss ~30–35 mL/cycle;
// >80 mL = heavy (Hallberg 1966). The RDA spreads an average loss across the month (IOM 2001).
export const FLOW={light:[20,'Light (~20 mL/cycle)'],normal:[35,'Normal (~35 mL/cycle)'],heavy:[90,'Heavy (>80 mL/cycle)']};
const FE_PER_ML=0.47,AVG_ML=35,CYCLE=28,IRON_RATE=0.18;
export function menstrualIron(s={}){
  if(s.sex!=='female'||!s.menstruates)return null;const nc=s.needConditions??[];if(nc.includes('pregnancy'))return null;
  const ml=(FLOW[s.flow]??FLOW.normal)[0],days=Math.max(2,+s.periodDays||5),notes=[];let absorbed=0;
  if(ml>AVG_ML){const x=(ml-AVG_ML)*FE_PER_ML/CYCLE;absorbed+=x;notes.push(`Heavy flow (~${ml} mL): +${x.toFixed(2)} mg absorbed iron/day above what the RDA assumes (Hallberg 1966; 0.47 mg Fe/mL).`)}
  if(s.periodToday){const x=ml*FE_PER_ML/days-ml*FE_PER_ML/CYCLE;absorbed+=x;notes.push(`Period day: ~${(ml*FE_PER_ML/days).toFixed(1)} mg iron lost per day over ${days} days, of which ${(ml*FE_PER_ML/CYCLE).toFixed(2)} mg/day is already in the RDA; +${x.toFixed(2)} mg absorbed iron today. Iron stores buffer this across the cycle.`)}
  return absorbed>0?{absorbed,intake:absorbed/IRON_RATE,notes}:null;
}

// Adjust the intake optimal range for needs. Returns {lo,hi}; pushes notes. Never touches the RDA.
export function applyNeedConditions(key,lo,hi,rda,s={},notes=[]){
  const nc=new Set([...(s.needConditions??[]),...((s.conditions??[]).map(c=>typeof c==='string'?c:c.id))]);
  const floor=(a,b,why)=>{lo=Math.max(lo,a);hi=Math.max(hi,b,lo*1.2);notes.push(why)},ceil=(c,why)=>{hi=Math.min(hi,c);lo=Math.min(lo,hi);notes.push(why)};
  if(key==='folate'){
    if(nc.has('thal_major'))floor(1000,5000,'Thalassemia major/intermedia: folic acid 1 mg/day is standard (TIF guidelines 2021). Food alone rarely reaches this — usually needs a supplement.');
    else if(nc.has('sickle_cell'))floor(1000,5000,'Sickle cell disease: folic acid 1 mg/day commonly prescribed (NHLBI 2014). Food alone rarely reaches this — usually needs a supplement.');
    else if(nc.has('hemolytic_anemia'))floor(1000,5000,'Chronic hemolysis: folic acid 1 mg/day (BSH guidance). Food alone rarely reaches this — usually needs a supplement.');
    else if(nc.has('thal_minor'))floor(600,1000,'Beta-thalassemia trait: mild extra erythropoiesis; 400 µg–1 mg folic acid is commonly advised and 5 mg in pregnancy (RCOG 2014). Range 600–1000 µg; no trial-defined dose outside pregnancy. Hard to reach from food alone.');
    if(nc.has('alcohol_use_disorder'))notes.push('Heavy alcohol use lowers folate absorption and raises losses (Halsted 2002); no reliable number.');
    if(nc.has('mthfr_tt'))notes.push('MTHFR TT: 5-MTHF bypasses the enzyme; folate need itself not changed by a fixed amount.');
  }
  if(key==='iron'){
    if(nc.has('hemochromatosis'))ceil(rda,'Hemochromatosis: iron is over-absorbed (HFE); no iron supplements, optimum capped at the RDA (EASL 2022). Vitamin C with meals increases non-heme iron.');
    if(nc.has('thal_major'))ceil(rda,'Thalassemia major/intermedia: iron overload risk; no iron unless prescribed (TIF 2021).');
    else if(nc.has('thal_minor'))notes.push('Thalassemia trait is not iron deficiency: take iron only if ferritin is low (BSH).');
    const m=menstrualIron(s);if(m){lo+=m.intake;hi+=m.intake;m.notes.forEach(n=>notes.push(n))}
  }
  if(key==='copper'&&nc.has('wilson'))ceil(rda,'Wilson disease: avoid high-copper foods and supplements (AASLD 2022); optimum capped at the RDA.');
  if(key==='vitamin_c'){if(nc.has('kidney_stones'))ceil(1000,'Calcium-oxalate stones: vitamin C supplements ≥1000 mg/day about double stone risk (Thomas 2013).');if(nc.has('hemochromatosis'))notes.push('Hemochromatosis: avoid vitamin C supplements with meals (raises iron absorption).')}
  if(key==='calcium'&&nc.has('kidney_stones'))floor(1000,1200,'Calcium-oxalate stones: a normal 1200 mg calcium diet lowered recurrence vs low calcium (Borghi 2002).');
  if(key==='vitamin_d'){if(nc.has('cystic_fibrosis'))floor(20,50,'Cystic fibrosis: 800–2000 IU (20–50 µg) vitamin D daily for adults (CF Foundation 2012).');if(nc.has('sarcoidosis'))ceil(rda,'Sarcoidosis: granulomas make active vitamin D; high doses risk hypercalcemia. Optimum capped at the RDA (no published safe dose).');if(nc.has('hyperparathyroidism'))notes.push('Primary hyperparathyroidism: replete vitamin D to 25(OH)D ≥50 nmol/L under supervision (Bilezikian 2014).')}
  if(key==='vitamin_e'&&nc.has('cystic_fibrosis'))notes.push('Cystic fibrosis: vitamin E 200–400 IU often prescribed (CF Foundation); not applied automatically.');
  if(key==='vitamin_a'&&nc.has('cystic_fibrosis'))notes.push('Cystic fibrosis: vitamin A dosing is guided by serum retinol; no fixed change.');
  if(key==='phosphorus'&&nc.has('chronic_kidney_disease'))ceil(1000,'Chronic kidney disease: phosphorus 800–1000 mg/day (KDOQI 2000).');
  if(key==='potassium'&&nc.has('chronic_kidney_disease'))notes.push('Chronic kidney disease: potassium is individualised by blood potassium (KDOQI 2020); no fixed number.');
  if(key==='magnesium'){if(nc.has('chronic_kidney_disease'))notes.push('Chronic kidney disease: avoid magnesium supplements without advice (excretion reduced).');if(nc.has('ppi_use'))notes.push('Long-term PPIs can cause low magnesium (FDA 2011); no fixed number.');if(nc.has('alcohol_use_disorder'))notes.push('Alcohol raises urinary magnesium loss; no reliable number.')}
  if(key==='thiamine'&&nc.has('alcohol_use_disorder'))notes.push('Heavy alcohol use: thiamine absorption roughly halved (shown on the absorbed bar).');
  if(key==='riboflavin'&&nc.has('mthfr_tt'))floor(1.6,3.2,'MTHFR TT: riboflavin 1.6 mg/day lowered blood pressure in TT carriers (Wilson/McNulty 2012).');
  if(key==='zinc'&&(nc.has('alcohol_use_disorder')||nc.has('sickle_cell')||nc.has('thal_major')))notes.push('Zinc losses rise (alcohol / hemolysis / chelation); no reliable number.');
  if(key==='vitamin_b12'){if(nc.has('pernicious_anemia'))notes.push('Pernicious anemia: injections or 1000–2000 µg oral daily (Vidal-Alaball 2005); need is unchanged, absorption is the problem.');if(nc.has('sibo'))notes.push('SIBO: bacteria consume B12; no reliable number.')}
  if(['iodine','selenium'].includes(key)&&nc.has('hypothyroidism'))notes.push('Hypothyroidism: do not exceed the UL; extra iodine/selenium only if deficient (ATA 2014).');
  if(key==='calcium'&&nc.has('lactose_intolerance'))notes.push('Lactose intolerance: hard cheese, yogurt and lactose-free milk still provide calcium; need unchanged.');
  if(key==='calcium'&&nc.has('hyperparathyroidism'))notes.push('Primary hyperparathyroidism: normal calcium intake, not restriction (Bilezikian 2014).');
  return{lo,hi};
}
