import assert from 'node:assert/strict';
import {optimalRange,barTargets,estimateEnergy,referenceRates} from '../public/bio-calculator/target-model.js';
import {clinicalEstimate} from '../public/bio-calculator/clinical-absorption.js';
const near=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
// Iron RDA 8 mg -> absorbed RDA 1.44 mg (18%, IOM 2001); RDA itself unchanged.
const iron={rda:8,ul:45};const bt=barTargets('iron',iron,optimalRange('iron',iron));
assert.equal(bt.intake.rda,8);near(bt.absorbed.rda,1.44);
// Owner's optimal restored: magnesium 420 -> 550 ratio; fallback 1.4–2× RDA.
const mg=optimalRange('magnesium',{rda:420});near(mg.lo,550);near(mg.hi,840);
const mo=optimalRange('molybdenum',{rda:45,ul:2000});near(mo.lo,63);near(mo.hi,90);
// Low stomach acid moves the absorbed value, never the ranges.
const meal={fat:10,nutrients:{},antinutrients:{}},v={total:10,plant:10,animal:0,supplement:0};
const ok=clinicalEstimate('iron',v,meal,{}),sus=clinicalEstimate('iron',v,meal,{conditions:[{id:'hypochlorhydria',state:'suspected'}]}),doc=clinicalEstimate('iron',v,meal,{conditions:[{id:'hypochlorhydria',state:'documented'}]});
assert.ok(sus.max<ok.max&&doc.max<sus.max);
const b12={total:2,animal:2};assert.ok(clinicalEstimate('vitamin_b12',b12,meal,{conditions:[{id:'hypochlorhydria',state:'suspected'}]}).max<clinicalEstimate('vitamin_b12',b12,meal,{}).max);
assert.deepEqual(optimalRange('iron',iron,{}),optimalRange('iron',iron,{conditions:[{id:'hypochlorhydria',state:'documented'}]}));
// Body size and activity change optimal ranges.
const small={sex:'male',age:30,weight:60,height:170,activity:'sedentary'},big={sex:'male',age:30,weight:100,height:190,activity:'very'};
assert.ok(estimateEnergy(big)>estimateEnergy(small)+1000);
assert.ok(optimalRange('niacin',{rda:16,ul:35},big).lo>optimalRange('niacin',{rda:16,ul:35},small).lo);
assert.ok(optimalRange('magnesium',{rda:420},big).lo>optimalRange('magnesium',{rda:420},small).lo);
assert.ok(optimalRange('vitamin_b6',{rda:1.3,ul:100},{},{protein:200}).lo>=3.2);
// Fibre lowers carotenoid absorption; no-fat meal lowers vitamin D.
const va={total:900,plant:900};assert.ok(clinicalEstimate('vitamin_a',va,{...meal,fiber:20},{}).max<clinicalEstimate('vitamin_a',va,meal,{}).max);
const vd={total:10,animal:10};assert.ok(clinicalEstimate('vitamin_d',vd,{fat:0},{}).max<clinicalEstimate('vitamin_d',vd,{fat:10},{}).max);
assert.ok(referenceRates('vitamin_c').rate>0.5);
console.log('target model checks passed');
