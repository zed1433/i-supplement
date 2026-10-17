// Checks for the full food profiles: statuses, origin routing and anti-nutrient effects.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mergeFoodProfiles, originItem, antinutrientTotals } from '../public/bio-calculator/food-profiles.js';
import { clinicalEstimate } from '../public/bio-calculator/clinical-absorption.js';

const prof = JSON.parse(readFileSync(new URL('../public/bio-calculator/food-profiles.json', import.meta.url)));
const canon = JSON.parse(readFileSync(new URL('../public/bio-calculator/canonical-foods.json', import.meta.url)));
const extra = JSON.parse(readFileSync(new URL('../public/bio-calculator/extra-foods.json', import.meta.url)));
const K = prof.keys, at = (id, key) => { const p = prof.foods[id], i = K.indexOf(key); return [p.v[i], p.s[i]]; };

// Every food has a profile with every key.
assert.equal(Object.keys(prof.foods).length, canon.foods.length + extra.rows.length);
for (const p of Object.values(prof.foods)) { assert.equal(p.s.length, K.length); assert.equal(p.v.length, K.length); }

// Unknown is never stored as a number; biological absence is zero.
for (const p of Object.values(prof.foods)) p.s.split('').forEach((c, i) => { if (c === 'U') assert.equal(p.v[i], null); if (c === 'B') assert.equal(p.v[i], 0); });

const byName = n => extra.rows.find(r => r[1] === n)[0];
// Animal foods carry no phytate/oxalate; plants no creatine/heme.
const beef = byName('Beef, neck, raw');
assert.deepEqual(at(beef, 'phytate'), [0, 'B']);
assert.deepEqual(at(beef, 'creatine'), [450, 'E']); // Balsom 1994: beef 4.5 g/kg
assert.deepEqual(at(beef, 'taurine'), [43.1, 'E']); // Laidlaw 1990
const lentils = byName('Lentil, green, boiled/cooked in water');
assert.deepEqual(at(lentils, 'creatine'), [0, 'B']);
assert.equal(at(lentils, 'phytate')[1], 'E');
assert.ok(at(lentils, 'phytate')[0] < 600 && at(lentils, 'phytate')[0] > 100); // cooked lentils are diluted vs dry (600 mg)
// Copper is in µg, matching the calculator target unit.
assert.equal(prof.units.copper, 'µg');

// Merge never overwrites a source value and routes origins.
const data = { foods: [{ id: beef, name: 'Beef', nutrients: { zinc: 5 }, provenance: { zinc: { unit: 'mg' } } }], nutrientForms: { zinc: { nutrientKey: 'zinc', origin: 'unknown' } }, targets: { zinc: {}, magnesium: {} } };
mergeFoodProfiles(data, prof);
assert.equal(data.foods[0].nutrients.zinc, 5);
assert.equal(data.foods[0].nutrients.magnesium, undefined); // CIQUAL did not measure it: stays unknown, not zero
assert.equal(data.foods[0].nutrients.selenium, 6.64);
assert.equal(data.foods[0].profile.status.magnesium, 'U');
const forms = { ...data.nutrientForms };
const routed = originItem({ grams: 100, food: data.foods[0] }, forms);
assert.equal(forms['zinc@animal'].origin, 'animal');
assert.equal(routed.food.nutrients['zinc@animal'], 5);

// Anti-nutrient totals scale with grams and list unknown foods separately.
const t = antinutrientTotals([{ grams: 200, food: { name: 'X', nutrients: { phytate: 300 }, profile: { status: { phytate: 'E', oxalate: 'U', tannin: 'B', lectin_load: 'B' } } } }]);
assert.equal(t.phytate.total, 600);
assert.deepEqual(t.oxalate.unknownFoods, ['X']);

// Phytate > 100 mg cuts plant zinc absorption by the engine's 0.7/0.8 factors.
const base = clinicalEstimate('zinc', { total: 10, plant: 10 }, { nutrients: {} }, {});
const phy = clinicalEstimate('zinc', { total: 10, plant: 10 }, { nutrients: {}, antinutrients: { phytate: { total: 600 } } }, {});
assert.ok(Math.abs(phy.min - base.min * 0.7) < 1e-9 && Math.abs(phy.max - base.max * 0.8) < 1e-9);
// Tannins at or above 50 mg reduce non-heme iron; below do not.
const ironLow = clinicalEstimate('iron', { total: 5, plant: 5 }, { nutrients: {}, antinutrients: { tannin: { total: 49 } } }, {});
const ironHigh = clinicalEstimate('iron', { total: 5, plant: 5 }, { nutrients: {}, antinutrients: { tannin: { total: 50 } } }, {});
assert.ok(ironHigh.max < ironLow.max);
console.log('food profile checks passed');
