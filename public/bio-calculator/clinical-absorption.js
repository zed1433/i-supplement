// Based on lib/clinicalAbsorptionEngine.ts from github.com/18387093agg/bio-calculator, deliberately corrected
// per docs/formula-review.md (owner-approved 2026-10-18). Diverges from GitHub; see the review for each change.
const clamp=(v,lo=0.01,hi=0.98)=>Math.min(hi,Math.max(lo,Number.isFinite(v)?v:lo));
const lowAcid=(p)=>p.gastricAcid==='hypochlorhydria'||p.gastricAcid==='achlorhydria';
const hemeFraction=(c,f)=>c.hemeIronFraction!=null?Math.min(1,Math.max(0,c.hemeIronFraction)):f.includes('heme')?1:c.isPureAnimalFood?0.4:0;

function base(n,c,f){
  const a=c.isPureAnimalFood;
  switch(n){
    case 'Vitamin A': return a?[.7,.9,1,'Preformed retinol']:[c.carotenoidMatrixCooked&&c.totalFatGrams>=5?.45:c.carotenoidMatrixCooked?.3:c.totalFatGrams>=5?.25:.15,c.carotenoidMatrixCooked&&c.totalFatGrams>=5?.65:c.carotenoidMatrixCooked?.5:c.totalFatGrams>=5?.45:.35,1,'Provitamin A / RAE'];
    case 'Vitamin D':return[.55,.8,1,'Vitamin D'];
    case 'Vitamin E':return c.totalFatGrams>=5?[.5,.8,1,'Vitamin E']:[.1,.35,1,'Vitamin E (low-fat meal)'];
    case 'Vitamin K':return[a?.4:.05,a?.7:.15,1,a?'Menaquinone':'Vitamin K1'];
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
    case 'Copper':return[.3,.6,1,'Dietary copper'];
    case 'Magnesium':return[a?.35:.25,a?.5:.4,1,'Dietary magnesium'];
    case 'Calcium':return[.25,.4,1,'Dietary calcium'];
    case 'Selenium':return[.7,.9,1,'Selenium'];
    case 'Iodine':return[.9,.98,1,'Iodide / iodine'];
    case 'Manganese':return[.01,.05,1,'Manganese'];
    case 'Molybdenum':return[.7,.93,1,'Molybdate'];
    case 'Chromium':return f.includes('picolinate')?[.02,.05,1,'Chromium picolinate']:[.005,.02,1,'Chromium'];
    case 'Phosphorus':return[.55,.7,1,'Phosphate'];
    case 'Chloride':return[.9,.98,1,'Chloride'];
    case 'Potassium':case 'Sodium':return[.85,.95,1,n];
    default:return[.45,.7,1,f||'Dietary form'];
  }
}

export function evaluateEntericBioavailability(nutrient,chemicalForm,category,pathology,context){
  const f=(chemicalForm||'').toLowerCase();let [min,max,phi,formName]=base(nutrient,context,f);const notes=[];
  const fo=context.formOverride,me=fo?.me??{};
  // Per-form meal effects: me[effect] = [min,max] replaces the base factor, 0 = this form is not affected (cited in supplement-forms.js).
  const eff=(k,a,b,why,whyNo)=>{const o=me[k];if(o===0){if(whyNo)notes.push(whyNo);return}const [x,y]=Array.isArray(o)?o:[a,b];min*=x;max*=y;if(why)notes.push(Array.isArray(o)?why+' (form-specific size)':why)};
  if(fo){if(fo.abs){[min,max]=fo.abs}if(fo.rel){min*=fo.rel;max*=fo.rel}if(fo.phi!=null)phi=fo.phi;if(fo.why)notes.push('Form: '+fo.why)}
  // A form's advantage can't push uptake past 100% before the meal acts on it, so meal/gut effects still lower it.
  min=Math.min(min,1);max=Math.min(max,1);
  const h=nutrient==='Iron'?hemeFraction(context,f):0,nonHeme=1-h;
  const fat=context.totalFatGrams??0;
  // Graded fat effect on fat-soluble vitamins (single-meal studies).
  if(nutrient==='Vitamin E'&&fat<1.5){min=.1;max=.2;notes.push('Almost no fat in the meal: vitamin E absorption ~10–20% (Bruno 2006).');}
  if(nutrient==='Vitamin D'&&fat<1.5){min*=.76;max*=.76;notes.push('Almost no fat in the meal: vitamin D absorption ~24% lower than with a fat-containing meal (Dawson-Hughes 2015).');}
  if(nutrient==='Vitamin K'&&!context.isPureAnimalFood&&fat<1.5)notes.push('Low fat lowers vitamin K1 uptake (Gijsbers 1996), but no reliable number, not applied.');
  // Fibre: pectin/soluble fibre lowers carotenoid uptake (Riedl 1999, ~30–40%). Mineral effects of fibre run mainly through phytate, counted separately.
  if(nutrient==='Vitamin A'&&!context.isPureAnimalFood&&(context.totalFiberGrams??0)>=15){min*=.7;max*=.7;notes.push('High meal fibre (≥15 g) reduces carotenoid absorption (Riedl 1999).');}
  if((context.totalFiberGrams??0)>=15&&['Iron','Zinc','Calcium','Magnesium'].includes(nutrient))notes.push('High fibre: the mineral-binding effect comes mostly from its phytate, which is counted separately (not double-counted).');
  if((context.totalOxalatesMg||0)>50&&!context.isPureAnimalFood&&nutrient==='Calcium'){if(context.totalOxalatesMg>300){min*=.2;max*=.35;notes.push('High meal oxalate (spinach-level) binds most calcium (Heaney 1988).');}else{min*=.8;max*=.9;notes.push('Meal oxalate load reduces calcium availability in the model.');}}
  if((context.totalPhytatesMg||0)>100&&!context.isPureAnimalFood){if(nutrient==='Zinc')eff('phytate',.7,.8,'Meal phytate load reduces zinc availability in the model.','This zinc form is not affected by phytate.');if(nutrient==='Iron'&&nonHeme>0)eff('phytate',.5,.6,'Meal phytate load reduces non-heme iron availability in the model.','This iron form is largely protected from phytate.');if(nutrient==='Calcium'){min*=.85;max*=.9;}}
  if(context.coingestedTannins&&nutrient==='Iron'&&nonHeme>0)eff('tannin',.35,.45,'Co-ingested tannins (tea, coffee, cocoa, red wine) reduce non-heme iron absorption.','This iron form is not affected by tannins.');
  if(nutrient==='Iron'&&nonHeme>0){if(context.totalCalciumMg>350)eff('calcium',.65,.75,'Meal calcium (>350 mg) reduces iron absorption.','This iron form is not affected by meal calcium.');if(context.totalVitaminCMg>=50)eff('vitC',2,3,'Vitamin C enhances non-heme iron absorption.','Vitamin C does not change absorption of this iron form.');}
  if(nutrient==='Copper'&&context.totalCopperMg>0&&context.totalZincMg/context.totalCopperMg>20){min*=.4;max*=.5;notes.push('High meal zinc:copper ratio is modeled as reducing copper absorption.');}
  if(pathology.gastricAcid==='suspected_low'){
    if(nutrient==='Iron'&&nonHeme>0){min*=h+nonHeme*.7;max*=h+nonHeme*.75;notes.push('Suspected low stomach acid: non-heme iron reduced by about a quarter (half the confirmed effect, model).');}
    if(nutrient==='Vitamin B12'&&!/supplement|crystalline|cyanocobalamin|methylcobalamin|hydroxo/.test(f)){min*=.6;max*=.7;notes.push('Suspected low stomach acid: less food-bound B12 released (half the confirmed effect, model).');}
  }
  if(lowAcid(pathology)){
    if(nutrient==='Iron'){min*=h+nonHeme*.4;max*=h+nonHeme*.5;if(nonHeme>0)notes.push('Low stomach acid reduces the non-heme fraction; heme iron is not given the same penalty.');}
    if(nutrient==='Vitamin B12'){const free=/supplement|crystalline|cyanocobalamin|methylcobalamin|hydroxo/.test(f);if(!free){min*=.3;max*=.4;notes.push('Low stomach acid reduces release of food-bound B12 from dietary protein.');}else notes.push('Free/crystalline supplemental B12 does not require gastric protein release.');}
    if(nutrient==='Calcium'&&f.includes('carbonate')){min*=.25;max*=.35;notes.push('Calcium carbonate taken without food needs stomach acid (Recker 1985).');}
  }
  const pf=pathology.factors||{};
  const apply=(pair,why)=>{if(!pair)return;min*=pair[0];max*=pair[1];if(why)notes.push(why)};
  if(pf.all)apply(pf.all.f,pf.all.why);
  if(category==='fat_soluble_vitamin'&&pf.fatSoluble)apply(pf.fatSoluble.f,pf.fatSoluble.why);
  if(nutrient==='Iron'&&pf.iron){min*=h*pf.iron.heme[0]+nonHeme*pf.iron.nonHeme[0];max*=h*pf.iron.heme[1]+nonHeme*pf.iron.nonHeme[1];notes.push(pf.iron.why)}
  if(nutrient==='Calcium'&&pf.calcium)apply(pf.calcium.f,pf.calcium.why);
  if(nutrient==='Vitamin B12'&&pf.b12All)apply(pf.b12All.f,pf.b12All.why);
  if(nutrient==='Thiamine (B1)'&&pf.thiamine)apply(pf.thiamine.f,pf.thiamine.why);
  if(nutrient==='Vitamin B12'&&pf.b12Food&&!/supplement/.test(f))apply(pf.b12Food.f,pf.b12Food.why);
  if(context.biomarkerFx){const bx=context.biomarkerFx;if(nutrient==='Iron'&&bx.iron){const a=h*bx.iron.heme+nonHeme*bx.iron.nonHeme;min*=a;max*=a;notes.push(bx.iron.note)}if(nutrient==='Calcium'&&bx.calcium){min*=bx.calcium.factor;max*=bx.calcium.factor;notes.push(bx.calcium.note)}}
  min=clamp(min);max=clamp(Math.max(min,max));
  return {sanitizedChemicalForm:formName,effectiveActiveRate:clamp((min+max)/2),rateMin:min,rateMax:max,conversionPhi:clamp(phi,0,1),clinicalMechanismNotes:notes};
}

// ---- Adapter (site-specific): maps this site's nutrient keys and settings onto the engine above ----
export const ENGINE_NAMES={vitamin_a:'Vitamin A',vitamin_d:'Vitamin D',vitamin_e:'Vitamin E',vitamin_k:'Vitamin K',thiamine:'Thiamine (B1)',riboflavin:'Riboflavin (B2)',niacin:'Niacin (B3)',pantothenic_acid:'Pantothenic Acid (B5)',vitamin_b6:'Vitamin B6',biotin:'Biotin (B7)',folate:'Folate (B9)',vitamin_b12:'Vitamin B12',vitamin_c:'Vitamin C',choline:'Choline',iron:'Iron',zinc:'Zinc',copper:'Copper',magnesium:'Magnesium',calcium:'Calcium',selenium:'Selenium',iodine:'Iodine',manganese:'Manganese',molybdenum:'Molybdenum',chromium:'Chromium',phosphorus:'Phosphorus',potassium:'Potassium',sodium:'Sodium',chloride:'Chloride'};
// Meal tannin load treated as 'co-ingested tannins' for non-heme iron (Brune et al., Eur J Clin Nutr 1989;43:547-57: dose-dependent inhibition from ~5-25 mg galloyl groups).
export const TANNIN_IRON_THRESHOLD_MG=50;
const FAT_SOLUBLE=new Set(['vitamin_a','vitamin_d','vitamin_e','vitamin_k']);
// Condition + state -> quantitative factors [min,max]. Only effects with published human data get numbers; see docs/formula-review.md.
export function pathologyFromSettings(settings={}){
  const list=(settings.conditions??[]).map(c=>typeof c==='string'?{id:c,state:null}:c);const st=id=>list.find(c=>c.id===id);
  const ids=list.map(c=>c.id);const g=String(settings.gastricAcid??'normal').toLowerCase();
  const hypo=st('hypochlorhydria'),gast=st('gastrectomy'),bar=st('bariatric_bypass');
  let gastricAcid=g.includes('achlor')||hypo?.state==='achlorhydria'?'achlorhydria':(g!=='normal'&&g!=='suspected_low')||(hypo&&hypo.state!=='suspected')||gast||bar?'hypochlorhydria':hypo||g==='suspected_low'?'suspected_low':'normal';
  const factors={},applied=[],noNumber=[];let noIntrinsicFactor=false;
  const cel=st('celiac_disease');if(cel){if(cel.state==='treated_adherent')noNumber.push('Celiac disease (treated): mucosa recovers on a gluten-free diet, no penalty applied.');else{factors.all={f:[.6,.7],why:'Active celiac disease: villous atrophy reduces absorption (model factor ×0.6–0.7).'};applied.push('celiac')}}
  const cr=st('crohn_disease');if(cr){if(String(cr.state||'active').startsWith('active')){factors.all={f:[.6,.7],why:'Active Crohn\u2019s disease: inflamed mucosa reduces absorption (model factor ×0.6–0.7).'};applied.push('crohn')}else noNumber.push('Crohn\u2019s disease in remission: no general penalty applied.');if(String(cr.state||'').includes('ileal')&&!String(cr.state).includes('nonileal'))factors.b12Food={f:[.5,.7],why:'Crohn\u2019s with ileal involvement: B12 uptake in the terminal ileum is impaired (Battat 2014).'}}
  const pei=st('pancreatic_exocrine_insufficiency');if(pei){factors.fatSoluble=pei.state==='documented_with_pert'?{f:[.85,.95],why:'PEI on enzyme replacement: fat absorption ~85–95% (Domínguez-Muñoz 2011).'}:{f:[.6,.75],why:'PEI without enzymes: fat absorption ~60–75%, fat-soluble vitamins follow (Domínguez-Muñoz 2011).'}}
  const liv=st('chronic_liver_disease');if(liv){if(liv.state==='cholestatic'||!liv.state)factors.fatSoluble={f:[.55,.7],why:'Cholestatic liver disease: low bile acids reduce fat-soluble vitamin absorption.'};else noNumber.push('Non-cholestatic liver disease: no absorption factor (bile flow preserved).')}
  if(bar){if(bar.state==='rygb'||bar.state==='bpd_ds'||!bar.state){factors.iron={nonHeme:[.33,.45],heme:[.5,.6],why:'Gastric bypass: duodenum bypassed; non-heme iron absorption fell ~67% and heme ~50% (Ruz 2012).'};factors.calcium={f:[.6,.7],why:'Gastric bypass: fractional calcium absorption falls ~35% (Schafer 2015).'};factors.b12Food={f:[.3,.4],why:'Gastric bypass: little acid and intrinsic factor contact for food B12.'}}if(bar.state==='bpd_ds')factors.fatSoluble={f:[.5,.7],why:'Duodenal switch: bile mixing is delayed, fat-soluble vitamin deficiency is common.'}}
  if(gast?.state==='total'){noIntrinsicFactor=true}
  const ile=st('ileal_resection'),sbs=st('short_bowel_syndrome');if(ile||sbs){noIntrinsicFactor=true;factors.fatSoluble=factors.fatSoluble??{f:[.5,.7],why:'Ileal loss: bile acids are lost, fat and fat-soluble vitamins are malabsorbed.'}}
  const nc=new Set(settings.needConditions??[]);
  if(nc.has('pernicious_anemia'))noIntrinsicFactor=true;
  if((nc.has('atrophic_gastritis')||nc.has('ppi_use'))&&gastricAcid==='normal')gastricAcid='hypochlorhydria';
  if(nc.has('metformin'))factors.b12All={f:[.8,.8],why:'Metformin: B12 status ~19% lower (de Jager 2010); calcium-dependent ileal uptake is impaired (Bauman 2000). Applied as ×0.8, approximate.'};
  if(nc.has('alcohol_use_disorder'))factors.thiamine={f:[.5,.5],why:'Chronic alcohol use roughly halves active thiamine absorption (Thomson 2000; Hoyumpa 1980).'};
  if(nc.has('cystic_fibrosis')&&!factors.fatSoluble)factors.fatSoluble={f:[.6,.75],why:'Cystic fibrosis: pancreatic insufficiency in ~85%; fat-soluble vitamins malabsorbed (CF Foundation 2012; Domínguez-Muñoz 2011). Use the PEI enzyme state if on enzymes.'};
  for(const id of ['ulcerative_colitis','chronic_kidney_disease'])if(ids.includes(id))noNumber.push(id==='ulcerative_colitis'?'Ulcerative colitis affects the colon, where few nutrients are absorbed: no factor applied.':'Chronic kidney disease mainly changes needs and excretion, not absorption: no factor applied.');
  return {gastricAcid,pathology:applied.length?'crohns_celiac':'none',factors,noIntrinsicFactor,noNumber,bileImpairment:false};
}
// B12: intrinsic-factor uptake saturates at ~1.5 µg per meal; ~1% of the rest by passive diffusion (IOM 1998).
export const B12_ACTIVE_CAP_UG=1.5,B12_PASSIVE=0.01;
const b12Split=a=>({active:Math.min(a,B12_ACTIVE_CAP_UG),passive:Math.max(0,a-B12_ACTIVE_CAP_UG)});
// The ~1.5 µg intrinsic-factor cap is shared by all B12 in the meal (food + every supplement), split pro rata.
const b12Share=(a,total)=>{const s=b12Split(total),k=total>0?a/total:0;return{active:s.active*k,passive:s.passive*k}};
// value: {total, animal, plant, supplement, unknown}; meal: calculateMeal() result
// ideal: highest theoretical uptake — healthy gut, no inhibitors, enhancers present, upper rate.
export function clinicalEstimate(key,value,meal,settings={}){
  const name=ENGINE_NAMES[key];if(!name)return null;if(!(value?.total>0))return {min:0,max:0,converted:0,maxAbsorbed:0,maxConverted:0,zero:true,notes:[]};
  const n=meal?.nutrients??{},amt=k=>n[k]?.total??0;
  const ctx={totalFatGrams:meal?.fat??0,totalCarbsGrams:meal?.carbohydrate??0,totalFiberGrams:meal?.fiber??0,totalZincMg:amt('zinc'),totalCopperMg:amt('copper'),totalIronMg:amt('iron'),totalCalciumMg:amt('calcium'),totalVitaminCMg:amt('vitamin_c'),totalPhytatesMg:meal?.antinutrients?.phytate?.total??0,totalOxalatesMg:meal?.antinutrients?.oxalate?.total??0,coingestedTannins:(meal?.antinutrients?.tannin?.total??0)>=TANNIN_IRON_THRESHOLD_MG,biomarkerFx:settings.biomarkerFx??null};
  const ideal={totalFatGrams:20,totalCarbsGrams:0,totalFiberGrams:0,totalZincMg:0,totalCopperMg:1,totalIronMg:0,totalCalciumMg:0,totalVitaminCMg:100,totalPhytatesMg:0,totalOxalatesMg:0,coingestedTannins:false,carotenoidMatrixCooked:true};
  const p=pathologyFromSettings(settings),healthy={gastricAcid:'normal',pathology:'none',factors:{},noIntrinsicFactor:false},cat=FAT_SOLUBLE.has(key)?'fat_soluble_vitamin':'other';
  // Every supplement line (form + dose) is calculated on its own, inside the same meal context as the food.
  const lines=(settings.suppLines?.[key]??[]).filter(l=>l.amount>0),named=lines.reduce((a,l)=>a+l.amount,0),generic=Math.max(0,(value.supplement??0)-named);
  const parts=[['Food (animal)',value.animal??0,true,'',null],['Food (plant/other)',(value.plant??0)+(value.unknown??0),false,'',null],...lines.map(l=>[l.name,l.amount,false,'supplement '+(l.form??''),l.bio??null]),['Supplement (unspecified form)',generic,false,'supplement',null]];
  const b12Total=parts.reduce((a,x)=>a+(x[1]>0?x[1]:0),0);
  let min=0,max=0,conv=0,best=0,bestConv=0,notes=new Set();const out=[];
  for(const [label,amount,animal,form,fo] of parts){if(!(amount>0))continue;
    const r=evaluateEntericBioavailability(name,form,cat,p,{...ctx,isPureAnimalFood:animal,formOverride:fo});
    const ri=evaluateEntericBioavailability(name,form,cat,healthy,{...ideal,isPureAnimalFood:animal,formOverride:fo});
    const sat=key==='vitamin_b12'?b12Share(amount,b12Total):null,activeOk=!(sat&&p.noIntrinsicFactor);
    const up=(rate,useActive)=>sat?(useActive?sat.active*rate:0)+(useActive?sat.passive:amount)*B12_PASSIVE:amount*rate;
    const aMin=up(r.rateMin,activeOk),aMax=up(r.rateMax,activeOk),aBest=up(ri.rateMax,true);
    min+=aMin;max+=aMax;conv+=(aMin+aMax)/2*r.conversionPhi;best+=aBest;bestConv+=aBest*ri.conversionPhi;r.clinicalMechanismNotes.forEach(x=>notes.add(x));out.push({label,amount,min:aMin,max:aMax,converted:(aMin+aMax)/2*r.conversionPhi,supplement:!!form})}
  if(key==='vitamin_b12'&&p.noIntrinsicFactor)notes.add('No intrinsic factor (total gastrectomy / ileal loss): only ~1% passive B12 uptake (IOM 1998).');
  p.noNumber.forEach(x=>notes.add(x));
  return {min,max,converted:conv,maxAbsorbed:Math.max(best,max),maxConverted:Math.max(bestConv,conv),notes:[...notes],lines:out};
}
