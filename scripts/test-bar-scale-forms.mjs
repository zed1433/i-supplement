import assert from 'node:assert/strict';
import {barScale} from '../public/bio-calculator/bar-scale.js';
import {byNutrientOrder} from '../public/bio-calculator/nutrient-order.js';
import {clinicalEstimate} from '../public/bio-calculator/clinical-absorption.js';
import {SUPPLEMENT_FORM_ROWS} from '../public/bio-calculator/supplement-forms.js';
import {menstrualIron,applyNeedConditions,lifeStage} from '../public/bio-calculator/need-conditions.js';

const near=(a,b,e=0.01)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
const p=barScale(10,400);
near(p(10),35);near(p(14),49);near(p(20),70);near(p(400),95);
assert.equal(barScale(8,null)(32),95);

const keys=['zinc','vitamin_c','vitamin_a','iron','vitamin_b12','thiamine','calcium','choline'];
assert.deepEqual(keys.sort(byNutrientOrder),['vitamin_a','thiamine','vitamin_b12','vitamin_c','calcium','iron','zinc','choline']);

const meal={fat:20,carbohydrate:50,protein:20,nutrients:{},antinutrients:{}};
const mg=(name)=>{const f=SUPPLEMENT_FORM_ROWS.find(x=>x.name===name);return clinicalEstimate('magnesium',{total:300,animal:0,plant:0,supplement:300,unknown:0},meal,{suppForms:{magnesium:{form:f.chemicalForm,bio:f.bio}}})};
assert.ok(mg('Magnesium oxide').max<mg('Magnesium glycinate / bisglycinate').max*0.5,'oxide absorbed less than glycinate');

const z=clinicalEstimate('vitamin_b12',{total:0},meal,{});
assert.equal(z.min,0);assert.equal(z.zero,true);

const food=clinicalEstimate('vitamin_b12',{total:1,animal:1,plant:0,supplement:0,unknown:0},meal,{gastricAcid:'hypochlorhydria'});
const foodOk=clinicalEstimate('vitamin_b12',{total:1,animal:1,plant:0,supplement:0,unknown:0},meal,{});
const supp=clinicalEstimate('vitamin_b12',{total:1,animal:0,plant:0,supplement:1,unknown:0},meal,{gastricAcid:'hypochlorhydria'});
const suppOk=clinicalEstimate('vitamin_b12',{total:1,animal:0,plant:0,supplement:1,unknown:0},meal,{});
assert.ok(food.max<foodOk.max);near(supp.max,suppOk.max,1e-9);

assert.ok(clinicalEstimate('chloride',{total:1000,animal:0,plant:1000,supplement:0,unknown:0},meal,{}).min>=900);

// Menstruation: normal flow, period today, 5 days: 35*0.47/5 - 35*0.47/28 = 2.70 mg absorbed
near(menstrualIron({sex:'female',menstruates:true,periodToday:true,flow:'normal',periodDays:5}).absorbed,2.70,0.01);
assert.equal(menstrualIron({sex:'male',menstruates:true,periodToday:true}),null);
// Thalassemia minor raises folate floor to 600 µg; hemochromatosis caps iron at the RDA
assert.equal(applyNeedConditions('folate',560,800,400,{needConditions:['thal_minor']}).lo,600);
assert.equal(applyNeedConditions('iron',8,12,8,{needConditions:['hemochromatosis']}).hi,8);
assert.equal(lifeStage('iron',{rda:18},{sex:'female',needConditions:['pregnancy']}).rda,27);
console.log('bar scale, order, forms and needs: ok');
