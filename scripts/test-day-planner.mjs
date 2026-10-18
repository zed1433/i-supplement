import assert from 'node:assert/strict';
import {planDay,dayScore} from '../public/bio-calculator/day-planner.js';
const pool=[...Array(20)].map((_,i)=>({id:'f'+i,nutrients:{energy:100+i*10,x:i%5}}));
const ev=items=>{const kcal=items.reduce((a,x)=>a+x.food.nutrients.energy*x.grams/100,0),x=items.reduce((a,y)=>a+y.food.nutrients.x*y.grams/100,0);return{kcal,rows:[{key:'x',name:'x',absorbed:x,bioactive:x,lo:20,hi:60}]}};
const r=await planDay({pool,evaluate:ev,kcal:2000,iterations:300});assert.equal(r.miss.length,0);assert.ok(Math.abs(r.kcal-2000)<150);
const r2=await planDay({pool,evaluate:items=>({...ev(items),rows:[{key:'x',name:'x',absorbed:0,bioactive:0,lo:20,hi:60}]}),kcal:2000,iterations:50});assert.equal(r2.miss.length,1);
console.log('planner ok');
