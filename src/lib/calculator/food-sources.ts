/**
 * Normalizes live search results from USDA FoodData Central and Open Food Facts
 * into the calculator's food record shape. Values are copied per 100 g from the
 * source; units are converted only (g -> mg/µg), never estimated.
 */
export type FoodOrigin = {
  region: "US" | "EU" | "GR";
  country: string;
  type: "whole" | "dish" | "branded";
  measured: boolean;
  label: string;
  greek: boolean;
};

export type CalcFood = {
  id: string;
  fdcId?: number;
  name: string;
  category: string;
  preparations: { method: string }[];
  nutrients: Record<string, number>;
  provenance: Record<string, { source: string; evidenceId: string; unit: string; amountPer100g: number }>;
  source: { name: string; official: boolean };
  origin: FoodOrigin;
};

export const NUTRIENT_UNITS: Record<string, string> = {
  energy: "kcal", protein: "g", fat: "g", carbohydrate: "g", fiber: "g", calcium: "mg",
  iron_total: "mg", potassium: "mg", zinc: "mg", vitamin_c: "mg", thiamine: "mg", vitamin_b12_food: "µg",
};
const REQUIRED = ["energy", "protein", "fat", "carbohydrate"];
const USDA_IDS: Record<string, number[]> = {
  energy: [1008, 2047, 2048], protein: [1003], fat: [1004], carbohydrate: [1005], fiber: [1079], calcium: [1087],
  iron_total: [1089], potassium: [1092], zinc: [1095], vitamin_c: [1162], thiamine: [1165], vitamin_b12_food: [1178],
};
// Open Food Facts stores minerals/vitamins in grams per 100 g.
const OFF_FIELDS: Record<string, [string, number]> = {
  energy: ["energy-kcal_100g", 1], protein: ["proteins_100g", 1], fat: ["fat_100g", 1], carbohydrate: ["carbohydrates_100g", 1],
  fiber: ["fiber_100g", 1], calcium: ["calcium_100g", 1000], iron_total: ["iron_100g", 1000], potassium: ["potassium_100g", 1000],
  zinc: ["zinc_100g", 1000], vitamin_c: ["vitamin-c_100g", 1000], thiamine: ["vitamin-b1_100g", 1000], vitamin_b12_food: ["vitamin-b12_100g", 1e6],
};
const round = (n: number) => Math.round(n * 10000) / 10000;

function build(id: string, name: string, category: string, nutrients: Record<string, number>, source: string, evidenceId: string, origin: FoodOrigin, fdcId?: number): CalcFood | null {
  if (!REQUIRED.every((k) => Number.isFinite(nutrients[k]))) return null;
  const provenance: CalcFood["provenance"] = {};
  for (const [k, v] of Object.entries(nutrients)) provenance[k] = { source, evidenceId, unit: NUTRIENT_UNITS[k] ?? "", amountPer100g: v };
  return { id, fdcId, name, category, preparations: [{ method: "As listed" }], nutrients, provenance, source: { name: source, official: origin.measured }, origin };
}

type UsdaFood = { fdcId: number; description: string; dataType?: string; brandOwner?: string; foodCategory?: string; foodNutrients?: { nutrientId?: number; value?: number; unitName?: string }[] };
export function normalizeUsda(f: UsdaFood): CalcFood | null {
  const nutrients: Record<string, number> = {};
  for (const n of f.foodNutrients ?? []) {
    if (typeof n.value !== "number" || n.nutrientId == null) continue;
    for (const [k, ids] of Object.entries(USDA_IDS)) {
      if (!ids.includes(n.nutrientId) || k in nutrients) continue;
      // energy reported in kJ is skipped; only kcal is accepted
      if (k === "energy" && n.unitName && n.unitName.toUpperCase() !== "KCAL") continue;
      nutrients[k] = round(n.value);
    }
  }
  const branded = f.dataType === "Branded";
  const name = branded && f.brandOwner ? `${f.description} · ${f.brandOwner}` : f.description;
  return build(`usda-${f.fdcId}`, name, branded ? "Branded products" : f.foodCategory || "USDA food", nutrients, "USDA FoodData Central", `fdc:${f.fdcId}`,
    { region: "US", country: "United States", type: branded ? "branded" : "whole", measured: !branded, label: branded ? "Label data" : `USDA ${f.dataType ?? ""}`.trim(), greek: false }, f.fdcId);
}

type OffProduct = { code?: string; product_name?: string; brands?: string; countries_tags?: string[]; nutriments?: Record<string, unknown> };
export function normalizeOff(p: OffProduct): CalcFood | null {
  const name = (p.product_name ?? "").trim();
  if (!p.code || !name) return null;
  const nutrients: Record<string, number> = {};
  for (const [k, [field, mult]] of Object.entries(OFF_FIELDS)) {
    const v = p.nutriments?.[field];
    if (typeof v === "number" && Number.isFinite(v)) nutrients[k] = round(v * mult);
  }
  const greek = (p.countries_tags ?? []).includes("en:greece");
  const brand = (p.brands ?? "").split(",")[0]?.trim();
  return build(`off-${p.code}`, brand ? `${name} · ${brand}` : name, "Branded products", nutrients, "Open Food Facts (label)", `off:${p.code}`,
    { region: greek ? "GR" : "EU", country: greek ? "Greece" : "Europe", type: "branded", measured: false, label: "Label data", greek });
}
