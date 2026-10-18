import assert from 'node:assert/strict';
import {barScale} from '../public/bio-calculator/bar-scale.js';
import {byNutrientOrder} from '../public/bio-calculator/nutrient-order.js';
import {clinicalEstimate} from '../public/bio-calculator/clinical-absorption.js';
import {SUPPLEMENT_FORM_ROWS} from '../public/bio-calculator/supplement-forms.js';
import {applySupplementNeeds} from '../public/bio-calculator/supplement-needs.js';
import {menstrualIron,applyNeedConditions,lifeStage} from '../public/bio-calculator/need-conditions.js';

const near=(a,b,e=0.01)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
const p=barScale(10,400);
near(p(10),35);near(p(14),49);near(p(20),70);near(p(400),95);
assert.equal(barScale(8,null)(32),95);

const keys=['zinc','vitamin_c','vitamin_a','iron','vitamin_b12','thiamine','calcium','choline'];
assert.deepEqual(keys.sort(byNutrientOrder),['vitamin_a','thiamine','vitamin_b12','vitamin_c','calcium','iron','zinc','choline']);

const meal={fat:20,carbohydrate:50,protein:20,nutrients:{},antinutrients:{}};
const mg=(name)=>{const f=SUPPLEMENT_FORM_ROWS.find(x=>x.name===name);return clinicalEstimate('magnesium',{total:300,animal:0,plant:0,supplement:300,unknown:0},meal,{suppLines:{magnesium:[{name,form:f.chemicalForm,bio:f.bio,amount:300}]}})};
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
// Two forms of one nutrient are calculated separately.
const F=n=>SUPPLEMENT_FORM_ROWS.find(x=>x.name===n),ox=F('Magnesium oxide'),gl=F('Magnesium glycinate / bisglycinate');
const mix=clinicalEstimate('magnesium',{total:300,animal:0,plant:0,supplement:300,unknown:0},meal,{suppLines:{magnesium:[{name:ox.name,form:ox.chemicalForm,bio:ox.bio,amount:200},{name:gl.name,form:gl.chemicalForm,bio:gl.bio,amount:100}]}});
assert.equal(mix.lines.filter(l=>l.supplement).length,2);
const oxOnly=clinicalEstimate('magnesium',{total:200,supplement:200},meal,{suppLines:{magnesium:[{name:ox.name,form:ox.chemicalForm,bio:ox.bio,amount:200}]}}),glOnly=clinicalEstimate('magnesium',{total:100,supplement:100},meal,{suppLines:{magnesium:[{name:gl.name,form:gl.chemicalForm,bio:gl.bio,amount:100}]}});
near(mix.max,oxOnly.max+glOnly.max,1e-9);
// Benfotiamine is still reduced by the meal/gut, but beats plain B1 in the same conditions.
const bf=F('Benfotiamine'),th=F('Thiamine hydrochloride'),b1=(row,s)=>clinicalEstimate('thiamine',{total:100,supplement:100},meal,{...s,suppLines:{thiamine:[{name:row.name,form:row.chemicalForm,bio:row.bio,amount:100}]}});
const sick={conditions:[{id:'celiac_disease',state:'active_untreated'}]};
assert.ok(b1(bf,sick).max<b1(bf,{}).max);assert.ok(b1(bf,sick).max>b1(th,sick).max);
// Iron forms react differently to the same meal.
const phyt={...meal,antinutrients:{phytate:{total:500}}},fe=(row,m)=>clinicalEstimate('iron',{total:20,supplement:20},m,{suppLines:{iron:[{name:row.name,form:row.chemicalForm,bio:row.bio,amount:20}]}});
const so=F('Ferrous sulfate'),bg=F('Iron bisglycinate'),hm=F('Heme iron polypeptide (Proferrin)');
assert.ok(fe(so,phyt).max/fe(so,meal).max<fe(bg,phyt).max/fe(bg,meal).max);
const tea={...meal,antinutrients:{tannin:{total:200}}};assert.ok(fe(so,tea).max<fe(so,meal).max);near(fe(hm,tea).max,fe(hm,meal).max,1e-9);
// Two B12 supplements share one 1.5 µg active cap.
const b=F('Cyanocobalamin')??SUPPLEMENT_FORM_ROWS.find(x=>x.nutrientId==='vitamin_b12');
const two=clinicalEstimate('vitamin_b12',{total:200,supplement:200},meal,{suppLines:{vitamin_b12:[{name:'a',form:b.chemicalForm,bio:b.bio,amount:100},{name:'b',form:b.chemicalForm,bio:b.bio,amount:100}]}});
const one=clinicalEstimate('vitamin_b12',{total:200,supplement:200},meal,{suppLines:{vitamin_b12:[{name:'a',form:b.chemicalForm,bio:b.bio,amount:200}]}});near(two.max,one.max,1e-9);
// Calcium carbonate drops with low stomach acid; citrate does not.
const ca=(n,s)=>{const r=F(n);return clinicalEstimate('calcium',{total:500,supplement:500},meal,{...s,suppLines:{calcium:[{name:r.name,form:r.chemicalForm,bio:r.bio,amount:500}]}}).max};
const low={gastricAcid:'hypochlorhydria'};assert.ok(ca('Calcium carbonate (with food)',low)<ca('Calcium carbonate (with food)',{}));near(ca('Calcium citrate',low),ca('Calcium citrate',{}),1e-9);
// Supplements change other nutrients' needs: zinc 80 mg -> copper optimum >= 2 mg (AREDS).
assert.ok(applySupplementNeeds('copper',1.26,1.8,[{nutrient:'zinc',amount:80,form:'zinc gluconate'}]).lo>=2);
const nt=[];applySupplementNeeds('magnesium',550,840,[{nutrient:'vitamin_d',amount:50,form:'cholecalciferol'}],nt);assert.ok(nt.length===1);
console.log('bar scale, order, forms, per-form lines and needs: ok');
