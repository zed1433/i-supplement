// Fixed checks taken from the source repo's clinicalAbsorptionEngine.ts.
import assert from 'node:assert/strict';
import {clinicalEstimate,evaluateEntericBioavailability} from '../public/bio-calculator/clinical-absorption.js';
const ok=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const ctx={totalFatGrams:0,totalCalciumMg:0,totalZincMg:0,totalCopperMg:0,totalVitaminCMg:0,isPureAnimalFood:false};
const p={gastricAcid:'normal',pathology:'none',bileImpairment:false};
let r=clinicalEstimate('calcium',{total:100,plant:100},{nutrients:{}},{});ok(r.min,25);ok(r.max,40);
r=evaluateEntericBioavailability('Magnesium','','other',p,ctx);ok(r.rateMin,.25);ok(r.rateMax,.4);
r=evaluateEntericBioavailability('Vitamin B12','','other',{...p,gastricAcid:'hypochlorhydria'},{...ctx,isPureAnimalFood:true});ok(r.rateMin,.45*.3);
r=clinicalEstimate('vitamin_b6',{total:10,plant:10},{nutrients:{}},{});ok(r.converted,10*.5*.75);
console.log('clinical absorption checks passed');
