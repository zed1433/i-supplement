// Checks for rules carried over from the owner's old calculator. Run: node scripts/test-legacy-rules.mjs
import assert from 'node:assert/strict';
import { dietAdjustment, absorbedCalories, lowFatWarning, applyProcessing } from '../public/bio-calculator/legacy-rules.js';

assert.equal(dietAdjustment('potassium', 'carnivore'), null);
assert.equal(dietAdjustment('magnesium', 'high_protein'), null);
assert.equal(dietAdjustment('vitamin_b6', 'carnivore').multiplier, 1.35);
assert.equal(dietAdjustment('sodium', 'ketogenic').multiplier, 1.4);
assert.equal(dietAdjustment('vitamin_b6', 'high_protein').multiplier, 1.4);
assert.equal(dietAdjustment('thiamine', 'high_carb').multiplier, 1.4);
assert.equal(dietAdjustment('vitamin_c', 'carnivore'), null);
assert.equal(dietAdjustment('potassium', 'standard'), null);
assert.equal(absorbedCalories(500, 20).kcal, 460);
assert.equal(absorbedCalories(500, 0).kcal, 500);
assert.equal(lowFatWarning(4.9, { vitamin_a: { total: 10 } }), true);
assert.equal(lowFatWarning(5, { vitamin_a: { total: 10 } }), false);
assert.equal(lowFatWarning(1, { iron: { total: 10 } }), false);
const lentil={grams:100,processing:'sprouted',food:{name:'Lentils, raw',nutrients:{phytate:1000,'vitamin_c@plant':10,iron_total:7}}};
let pr=applyProcessing(lentil).food.nutrients;
assert.equal(pr.phytate,350); assert.equal(pr['vitamin_c@plant'],9); assert.equal(pr.iron_total,7);
pr=applyProcessing({...lentil,processing:'pressure',food:{...lentil.food,name:'Lentils, boiled'}}).food.nutrients;
assert.equal(pr.phytate,250); assert.equal(pr['vitamin_c@plant'],10);
const none={...lentil,processing:'none'}; assert.equal(applyProcessing(none), none);
console.log('legacy rules: all checks passed');
