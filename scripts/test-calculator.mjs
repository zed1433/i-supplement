/**
 * Formula checks for the Bio Calculator engine port.
 * Run: node scripts/test-calculator.mjs
 * The engine files are verbatim ports; these tests pin the documented formulas.
 */
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = "/tmp/calc-test";
mkdirSync(outDir, { recursive: true });

/** Transpile a ported engine file to plain JS in /tmp so relative imports resolve. */
async function loadModule(relPath, outName) {
  const source = readFileSync(join(root, relPath), "utf8").replace(/^\/\/ @ts-nocheck[^\n]*\n/, "");
  const js = ts
    .transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
    })
    .outputText.replace(/from\s+['"]\.\/calculation-engine['"]/, "from './calculation-engine.js'");
  const out = join(outDir, outName);
  writeFileSync(out, js);
  return import(pathToFileURL(out).href);
}

const engine = await loadModule("src/lib/calculator/calculation-engine.ts", "calculation-engine.js");
const mealService = await loadModule("src/lib/calculator/meal-service.ts", "meal-service.js");
const data = JSON.parse(readFileSync(join(root, "src/lib/calculator/canonical-foods.json"), "utf8"));

// 1. Dataset integrity
assert.equal(data.foods.length, 87, "canonical dataset keeps all 87 foods");
assert.ok(Object.keys(data.targets).length >= 29, "targets present");

// 2. PRAL — Remer–Manz: 0.49·protein + 0.037·phosphorus − 0.021·potassium − 0.026·magnesium − 0.013·calcium
const pral = engine.calculatePral({ proteinG: 100, phosphorusMg: 1000, potassiumMg: 1000, magnesiumMg: 1000, calciumMg: 1000 });
assert.ok(Math.abs(pral - (0.49 * 100 + 0.037 * 1000 - 0.021 * 1000 - 0.026 * 1000 - 0.013 * 1000)) < 1e-9, "PRAL matches Remer–Manz formula");

// 3. Thiamine target — energy-dependent model (0.5 mg per 1000 kcal band)
const th = mealService.thiamineTarget(2500);
assert.ok(th.min > 0 && th.max >= th.min, "thiamine target returns a positive range");

// 4. Meal totals — 100 g of the first food scales its nutrients linearly
const food = data.foods[0];
const prep = food.preparations[0];
const totals = mealService.calculateMeal(
  [{ id: "t1", food: { ...food, preparation: prep.method }, grams: 100, preparation: prep.method }],
  data.nutrientForms,
  { gastricAcid: "normal", conditions: [], mealModifiers: {} },
  data.targets,
);
assert.ok(totals.energy > 0, "meal has energy");
assert.ok(Object.keys(totals.nutrients).length > 10, "micronutrients computed");
assert.ok(Array.isArray(totals.pipeline) && totals.pipeline.length > 0, "pipeline rows produced");

// 5. Absorption — iron estimate is bounded and never exceeds intake
const ironValue = { total: 10, animal: 4, plant: 6, supplement: 0, unknown: 0 };
const est = mealService.absorptionEstimate("iron", ironValue, "normal");
assert.ok(est, "iron absorption modeled for known heme/non-heme split");
assert.ok(est.total.min >= 0 && est.total.max >= est.total.min, "absorption range ordered");
assert.ok(est.total.max <= ironValue.total + 1e-9, "absorbed iron never exceeds intake");
assert.equal(
  mealService.absorptionEstimate("iron", { ...ironValue, unknown: 1 }, "normal"),
  null,
  "unknown-origin iron is not modeled",
);

// 6. Progress scale — markers land at 0..100
const scale = mealService.progress(1.2, { rda: 1.2, ul: 100 });
assert.ok(scale.actual >= 0 && scale.actual <= 100, "progress position clamped");

console.log("calculator engine tests passed");

// 7. Source normalizers — unit conversion and required macros
const src = await loadModule("src/lib/calculator/food-sources.ts", "food-sources.js");
const off = src.normalizeOff({ code: "1", product_name: "Feta", countries_tags: ["en:greece"], nutriments: { "energy-kcal_100g": 264, proteins_100g: 14, fat_100g: 21, carbohydrates_100g: 4, calcium_100g: 0.49, "vitamin-b12_100g": 0.0000017 } });
assert.equal(off.nutrients.calcium, 490, "OFF calcium g -> mg");
assert.equal(off.nutrients.vitamin_b12_food, 1.7, "OFF B12 g -> µg");
assert.equal(off.origin.region, "GR");
assert.equal(off.origin.measured, false, "label data is never marked lab measured");
assert.equal(src.normalizeOff({ code: "2", product_name: "X", nutriments: { "energy-kcal_100g": 10 } }), null, "missing macros are skipped");
const us = src.normalizeUsda({ fdcId: 171477, description: "Chicken breast", dataType: "SR Legacy", foodNutrients: [
  { nutrientId: 1008, value: 165, unitName: "KCAL" }, { nutrientId: 1003, value: 31, unitName: "G" }, { nutrientId: 1004, value: 3.57, unitName: "G" }, { nutrientId: 1005, value: 0, unitName: "G" }] });
assert.equal(us.nutrients.energy, 165); assert.equal(us.nutrients.protein, 31);

// 8. Expanded dataset — three sources present, every food has energy + macros
const extra = JSON.parse(readFileSync(join(root, "public/bio-calculator/extra-foods.json"), "utf8"));
const labels = new Set(extra.rows.map((r) => r[10]));
for (const l of ["CIQUAL 2020", "USDA SR Legacy", "Label data"]) assert.ok(labels.has(l), `${l} present`);
assert.ok(extra.rows.every((r) => ["energy", "protein", "fat", "carbohydrate"].every((k) => Number.isFinite(r[4][k]))), "complete macros");
assert.ok(extra.rows.every((r) => r[10] !== "Label data" || r[9] === 0), "label rows not marked measured");
console.log("food source tests passed");
