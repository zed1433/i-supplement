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
// Corrected values (docs/formula-review.md)
r=evaluateEntericBioavailability('Manganese','','other',p,ctx);ok(r.rateMin,.01);ok(r.rateMax,.05);
r=evaluateEntericBioavailability('Copper','','other',p,ctx);ok(r.rateMin,.3);ok(r.rateMax,.6);
r=evaluateEntericBioavailability('Vitamin K','','fat_soluble_vitamin',p,ctx);ok(r.rateMin,.05);ok(r.rateMax,.15);
r=evaluateEntericBioavailability('Vitamin E','','fat_soluble_vitamin',p,{...ctx,totalFatGrams:3});ok(r.rateMin,.1);ok(r.rateMax,.35);r=evaluateEntericBioavailability('Vitamin E','','fat_soluble_vitamin',p,ctx);ok(r.rateMax,.2);
r=evaluateEntericBioavailability('Vitamin E','','fat_soluble_vitamin',p,{...ctx,totalFatGrams:10});ok(r.rateMin,.5);
r=evaluateEntericBioavailability('Calcium','','other',p,{...ctx,totalOxalatesMg:400});ok(r.rateMin,.25*.2);ok(r.rateMax,.4*.35);
r=evaluateEntericBioavailability('Calcium','','other',p,{...ctx,totalOxalatesMg:100});ok(r.rateMin,.25*.8);
r=evaluateEntericBioavailability('Magnesium','','other',p,{...ctx,totalOxalatesMg:400,totalCalciumMg:1000});ok(r.rateMin,.25);ok(r.rateMax,.4);
r=evaluateEntericBioavailability('Iron','','other',p,{...ctx,totalVitaminCMg:60});ok(r.rateMin,.03*2);ok(r.rateMax,.12*3);
r=evaluateEntericBioavailability('Iron','','other',p,{...ctx,totalZincMg:40});ok(r.rateMin,.03);
r=clinicalEstimate('vitamin_b12',{total:100,supplement:100},{nutrients:{}},{});ok(r.min,1.5*.45+98.5*.01);
console.log('clinical absorption checks passed');
