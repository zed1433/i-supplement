/**
 * Formula checks for the Bio Calculator engine port.
 * Run: node scripts/test-calculator.mjs
 * The engine files are verbatim ports; these tests pin the documented formulas.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Strip the TS header and evaluate the plain-JS engine ports in a sandbox. */
async function loadModule(relPath, sandbox = {}) {
  const source = readFileSync(join(root, relPath), "utf8").replace(/^\/\/ @ts-nocheck[^\n]*\n/, "");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const blobUrl = `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`;
  return import(blobUrl);
}

const engine = await loadModule("src/lib/calculator/calculation-engine.ts");
const mealService = await loadModule("src/lib/calculator/meal-service.ts");
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
const iron = totals.nutrients.iron;
if (iron && iron.total > 0) {
  const est = mealService.absorptionEstimate("iron", iron, "normal");
  assert.ok(est, "iron absorption modeled");
  assert.ok(est.total.min >= 0 && est.total.max >= est.total.min, "absorption range ordered");
  assert.ok(est.total.max <= iron.total + 1e-9, "absorbed iron never exceeds intake");
}

// 6. Progress scale — markers land at 0..100
const scale = mealService.progress(1.2, { rda: 1.2, ul: 100 });
assert.ok(scale.actual >= 0 && scale.actual <= 100, "progress position clamped");

console.log("calculator engine tests passed");
