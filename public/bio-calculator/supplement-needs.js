// Supplements that change the need for OTHER nutrients. Each rule moves only the optimal range of the affected
// nutrient (never the RDA), scales with the dose taken, and is matched per form. Rules without a reliable number
// are listed as notes only. Add rows freely.
// match: regex on the supplement form's chemical form/name; min: dose from which the rule applies (same unit as the form).
// floor(dose) returns the new optimal minimum for the target nutrient; omit it for note-only rules.
export const SUPPLEMENT_NEED_RULES=[
  {from:'zinc',match:/./,min:25,target:'copper',floor:d=>d/40,why:d=>`Zinc supplement ${d} mg: high zinc induces copper loss (IOM 2001, basis of the 40 mg zinc UL); AREDS paired 80 mg zinc with 2 mg copper (1 mg Cu per 40 mg Zn) to prevent copper-deficiency anaemia (AREDS 2001).`},
  {from:'vitamin_d',match:/./,min:25,target:'magnesium',why:d=>`Vitamin D ${d} µg: magnesium is needed to activate vitamin D and high-dose D uses it up (Uwitonze 2018), but no study gives an amount, so not applied.`},
  {from:'vitamin_d',match:/./,min:25,target:'vitamin_k',why:d=>`Vitamin D ${d} µg: raises vitamin-K-dependent proteins; extra K2 is often advised, but no need figure exists, so not applied.`},
  {from:'folate',match:/folic acid/,min:1000,target:'vitamin_b12',why:d=>`Folic acid ${d} µg: can hide B12-deficiency anaemia while nerve damage progresses (IOM 1998, basis of the folic acid UL). Check B12 status; no need figure exists.`},
  {from:'folate',match:/mthf|folinic/,min:1000,target:'vitamin_b12',why:()=>'High-dose reduced folate can also mask B12 deficiency (no DHFR step, but same blood-count correction); check B12 status.'},
  {from:'calcium',match:/./,min:500,target:'magnesium',why:d=>`Calcium supplement ${d} mg: high calcium can lower magnesium balance (Seelig 1994), but no reliable figure, so not applied.`},
  {from:'iron',match:/./,min:25,target:'zinc',why:d=>`Iron supplement ${d} mg: 25+ mg iron taken without food lowers zinc absorption (Whittaker 1998); take apart from zinc. Need figure not established.`},
  {from:'niacin',match:/nicotinic acid|inositol hexanicotinate/,min:500,target:'choline',why:d=>`Nicotinic acid ${d} mg: cleared by methylation, raising methyl-group demand (Sun 2012), no need figure.`},
  {from:'niacin',match:/nicotinamide/,min:500,target:'choline',why:d=>`Nicotinamide ${d} mg: cleared by methylation (N1-methylnicotinamide), raising methyl-group demand (Sun 2012), no need figure.`},
  {from:'vitamin_e',match:/./,min:670,target:'vitamin_k',why:d=>`Vitamin E ${d} mg: about 1000 IU/day antagonises vitamin K and raised PIVKA-II (Booth 2004); no need figure, avoid with anticoagulants.`},
  {from:'creatine',match:/./,min:2000,target:'choline',why:()=>'Creatine supplement: spares the methyl groups the body uses to make creatine (Stead 2006), so methyl-group need may fall; no figure, not applied.'},
];
// lines: [{nutrient, form, name, amount}] — every supplement line the user takes (dose in the form's unit).
export function applySupplementNeeds(key,lo,hi,lines=[],notes=[]){
  for(const r of SUPPLEMENT_NEED_RULES){if(r.target!==key)continue;
    const dose=lines.filter(l=>l.nutrient===r.from&&r.match.test(String((l.form??'')+' '+(l.name??'')).toLowerCase())).reduce((a,l)=>a+(+l.amount||0),0);
    if(!(dose>=r.min))continue;const msg=r.why(Math.round(dose*10)/10);
    if(r.floor){const v=r.floor(dose);if(v>lo){hi=Math.max(hi,v*hi/lo);lo=v}notes.push(msg)}else notes.push(msg+' (note only)')}
  return{lo,hi};
}
