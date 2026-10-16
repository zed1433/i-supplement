/**
 * Typed boundary over the verbatim Bio Calculator engine port.
 * The engine files in this folder are copied as written from
 * github.com/18387093agg/bio-calculatorChatgpt — do not change formulas here.
 */
import {
  CONDITION_CATALOG as RAW_CONDITIONS,
  calculatePral as rawPral,
} from "./calculation-engine";
import {
  calculateMeal as rawCalculateMeal,
  absorptionEstimate as rawAbsorptionEstimate,
  absorptionSummary as rawAbsorptionSummary,
  progress as rawProgress,
  thiamineTarget as rawThiamineTarget,
} from "./meal-service";
import { SUPPLEMENT_FORMS as RAW_SUPPLEMENT_FORMS, foodEntities as rawFoodEntities } from "./catalogs";

export interface FoodPreparation {
  method: string;
  basis?: string;
  yield?: { min: number; max: number; evidenceId?: string } | null;
  retention?: Record<string, unknown>;
  evidenceId?: string;
}

export interface Food {
  id: string;
  fdcId?: number;
  name: string;
  category: string;
  preparations: FoodPreparation[];
  nutrients: Record<string, number>;
  provenance?: Record<string, { unit?: string }>;
}

export interface NutrientForm {
  nutrientKey: string;
  origin: string;
  chemicalForm?: string;
  foodBound?: boolean;
  label?: string;
}

export interface NutrientTarget {
  rda?: number;
  ai?: number;
  ear?: number;
  ul?: number;
  optimalMin?: number;
  optimalMax?: number;
  unit: string;
  category?: string;
  displayName?: string;
  model?: string;
  explanation?: string;
  referenceSystem?: string;
  source?: string;
}

export interface CanonicalData {
  nutrientForms: Record<string, NutrientForm>;
  foods: Food[];
  targets: Record<string, NutrientTarget>;
}

export interface MealItem {
  id: string;
  food: Food;
  grams: number;
  preparation: string;
}

export interface SupplementEntry {
  name: string;
  nutrient: string;
  amount: number;
  unit: string;
}

export interface ConditionSelection {
  id: string;
  state: string | null;
}

export interface CalculatorSettings {
  gastricAcid: "normal" | "low";
  energyKcal: number;
  conditions: ConditionSelection[];
}

export interface SupplementForm {
  supplementFormId: string;
  nutrientId: string;
  name: string;
  chemicalForm: string;
  category: string;
  defaultUnit: string;
  supportedUnits: string[];
  typicalDoseMin: number;
  typicalDoseMax: number;
  notes?: string;
}

export interface ConditionEffect {
  mechanismId: string;
  stage: string;
  nutrients: string[];
  type: string;
  quantitative: boolean;
  evidenceClass: string;
  confidence: string;
  source: string;
  applicableStates: string[];
  assumption: string;
}

export interface Condition {
  id: string;
  name: string;
  description: string;
  inputs: string[];
  effects: ConditionEffect[];
}

export interface NutrientTotal {
  total: number;
  animal: number;
  plant: number;
  supplement: number;
  unknown: number;
  contributions: unknown[];
  absorbed: { min: number; max: number; unit?: string } | null;
  unavailableReasons: string[];
}

export interface PipelineRow {
  nutrientKey: string;
  unit: string;
  grossIntake: { status: string; value: number; unit: string };
  absorption: { status: string; min?: number; max?: number; reason?: string };
  mealInteractions: { status: string; observations: { effect: string; evidenceId?: string }[] };
  conditionEffects: ConditionEffect[];
  targetComparison: { status: string; actual?: number; target?: NutrientTarget };
  sources: Record<string, number>;
}

export interface MealTotals {
  energy: number;
  protein: number;
  fat: number;
  carbohydrate: number;
  nutrients: Record<string, NutrientTotal>;
  pipeline: PipelineRow[];
}

export const CONDITION_CATALOG = RAW_CONDITIONS as Condition[];
export const SUPPLEMENT_FORMS = RAW_SUPPLEMENT_FORMS as SupplementForm[];

/** Human-readable state options per condition, ported from the original app. */
export const CONDITION_STATE_OPTIONS: Record<string, [string, string][]> = {
  hypochlorhydria: [
    ["suspected", "Suspected (qualitative only)"],
    ["documented", "Documented hypochlorhydria"],
    ["achlorhydria", "Documented achlorhydria"],
    ["acid_suppression", "Acid-suppressing medication context"],
  ],
  celiac_disease: [
    ["active_untreated", "Active / untreated"],
    ["treated_adherent", "Treated / adherent gluten-free diet"],
  ],
  crohn_disease: [
    ["active_ileal", "Active disease with ileal involvement"],
    ["active_nonileal", "Active disease without reported ileal involvement"],
    ["remission_ileal", "Remission with ileal involvement"],
    ["remission_nonileal", "Remission without reported ileal involvement"],
  ],
  ulcerative_colitis: [
    ["active", "Active disease"],
    ["remission", "Remission"],
  ],
  pancreatic_exocrine_insufficiency: [
    ["documented_without_pert", "Documented PEI — no enzyme replacement context"],
    ["documented_with_pert", "Documented PEI — enzyme replacement context"],
  ],
  bariatric_bypass: [
    ["rygb", "Roux-en-Y gastric bypass (RYGB)"],
    ["sleeve_gastrectomy", "Sleeve gastrectomy (SG)"],
    ["bpd_ds", "Biliopancreatic diversion / duodenal switch (BPD/DS)"],
  ],
  gastrectomy: [
    ["partial", "Partial gastrectomy"],
    ["total", "Total gastrectomy"],
  ],
  ileal_resection: [["documented_resection", "Documented ileal resection"]],
  chronic_liver_disease: [
    ["stable_noncholestatic", "Documented stable non-cholestatic liver disease"],
    ["decompensated_noncholestatic", "Documented decompensated non-cholestatic liver disease"],
    ["cholestatic", "Documented cholestatic liver disease"],
  ],
  chronic_kidney_disease: [
    ["stage_1_2_nondialysis", "Documented CKD stages 1–2 — not receiving dialysis"],
    ["stage_3_5_nondialysis", "Documented CKD stages 3–5 — not receiving dialysis"],
    ["hemodialysis", "Documented CKD — hemodialysis"],
    ["peritoneal_dialysis", "Documented CKD — peritoneal dialysis"],
  ],
  short_bowel_syndrome: [
    ["jejunostomy_no_colon", "Documented SBS — jejunostomy, no colon continuity"],
    ["jejunocolonic_no_terminal_ileum", "Documented SBS — colon continuity, no terminal ileum"],
    ["jejunoileocolonic_terminal_ileum", "Documented SBS — colon and terminal ileum in continuity"],
    ["intestinal_failure_nutrition_support", "Documented intestinal failure / nutrition support"],
  ],
};

export function calculateMeal(
  items: MealItem[],
  nutrientForms: Record<string, NutrientForm>,
  context: { gastricAcid: string; conditions?: ConditionSelection[]; mealModifiers?: Record<string, unknown> },
  targets: Record<string, NutrientTarget>,
): MealTotals {
  return rawCalculateMeal(items, nutrientForms, context, targets) as MealTotals;
}

export function absorptionEstimate(
  key: string,
  value: NutrientTotal,
  gastricAcid: string,
): {
  status: string;
  unit: string;
  sources: [string, number, { min: number; max: number }][];
  total: { min: number; max: number };
  assumption: string;
} | null {
  return rawAbsorptionEstimate(key, value, gastricAcid) as {
    status: string;
    unit: string;
    sources: [string, number, { min: number; max: number }][];
    total: { min: number; max: number };
    assumption: string;
  } | null;
}

export const absorptionSummary = rawAbsorptionSummary as (key: string, value: NutrientTotal, unit: string) => string;
export const progressScale = rawProgress as (
  actual: number,
  target: Record<string, number | undefined>,
) => { scale: number; actual: number; markers: Record<string, number> };
export const thiamineTarget = rawThiamineTarget as (energyKcal: number) => { min: number; max: number; modelKey: string };
export const calculatePral = rawPral as (input: {
  proteinG: number;
  phosphorusMg: number;
  potassiumMg: number;
  magnesiumMg: number;
  calciumMg: number;
}) => number;
export const foodEntities = rawFoodEntities as (
  foods: Food[],
) => { id: string; name: string; category: string; variants: (Food & { preparation: string })[] }[];

/** Where a nutrient result links to in the catalogue. */
export function nutrientCatalogueLink(key: string): { to: string; label: string } {
  switch (key) {
    case "magnesium":
      return { to: "/compare/magnesium-glycinate-malate", label: "Compare magnesium supplements" };
    case "vitamin_d":
    case "vitamin_k":
      return { to: "/compare/vitamin-d3-k2", label: "Compare vitamin D3 + K2 supplements" };
    default:
      return { to: `/?q=${encodeURIComponent(key.replace(/_/g, " "))}`, label: "Search the catalogue" };
  }
}

const STORAGE_KEY = "bio-calculator.workspace.v1";

export interface WorkspaceState {
  meal: MealItem[];
  supplements: SupplementEntry[];
  settings: CalculatorSettings;
}

export const DEFAULT_SETTINGS: CalculatorSettings = { gastricAcid: "normal", energyKcal: 2500, conditions: [] };

export function loadWorkspace(): WorkspaceState {
  const fallback: WorkspaceState = { meal: [], supplements: [], settings: DEFAULT_SETTINGS };
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      meal: Array.isArray(parsed.meal) ? parsed.meal : [],
      supplements: Array.isArray(parsed.supplements) ? parsed.supplements : [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return fallback;
  }
}

export function saveWorkspace(state: WorkspaceState): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* blocked storage keeps the in-memory workspace */
  }
}
