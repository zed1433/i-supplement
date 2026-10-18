// Checks for rules carried over from the owner's old calculator. Run: node scripts/test-legacy-rules.mjs
import assert from 'node:assert/strict';
import { dietAdjustment, calorieAbsorptionPct, lowFatWarning } from '../public/bio-calculator/legacy-rules.js';

assert.equal(dietAdjustment('potassium', 'carnivore').multiplier, 1.25);
assert.equal(dietAdjustment('sodium', 'ketogenic').multiplier, 1.4);
assert.equal(dietAdjustment('vitamin_b6', 'high_protein').multiplier, 1.4);
assert.equal(dietAdjustment('thiamine', 'high_carb').multiplier, 1.4);
assert.equal(dietAdjustment('vitamin_c', 'carnivore').multiplier, 0.5);
assert.equal(dietAdjustment('potassium', 'standard'), null);
assert.equal(calorieAbsorptionPct(0, 0), 98);
assert.equal(calorieAbsorptionPct(20, 0), 91);
assert.equal(calorieAbsorptionPct(20, 31), 81);
assert.equal(calorieAbsorptionPct(200, 100), 72);
assert.equal(lowFatWarning(4.9, { vitamin_a: { total: 10 } }), true);
assert.equal(lowFatWarning(5, { vitamin_a: { total: 10 } }), false);
assert.equal(lowFatWarning(1, { iron: { total: 10 } }), false);
console.log('legacy rules: all checks passed');
