import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Apple,
  Calculator as CalculatorIcon,
  FlaskConical,
  HeartPulse,
  Plus,
  Target,
  Trash2,
  Pill,
} from "lucide-react";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CONDITION_CATALOG,
  CONDITION_STATE_OPTIONS,
  SUPPLEMENT_FORMS,
  absorptionEstimate,
  absorptionSummary,
  calculateMeal,
  calculatePral,
  foodEntities,
  loadWorkspace,
  nutrientCatalogueLink,
  progressScale,
  saveWorkspace,
  thiamineTarget,
  type CanonicalData,
  type ConditionSelection,
  type Food,
  type MealItem,
  type SupplementEntry,
  type WorkspaceState,
} from "@/lib/calculator";

export const Route = createFileRoute("/calculator")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Nutrition Calculator — Macros, Micronutrients & Absorption | i-Supplement" },
      {
        name: "description",
        content:
          "Build a meal from USDA reference foods and see calories, macros, micronutrients against official targets, plus modeled iron, B12 and zinc absorption — then compare supplements that fill the gaps.",
      },
      { property: "og:title", content: "Nutrition Calculator | i-Supplement" },
      {
        property: "og:description",
        content:
          "Calculate calories, macros and micronutrients from real foods, with evidence-bounded absorption estimates and supplement comparison links.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalculatorPage,
});

const fmt = (n: number, unit: string) =>
  Number.isFinite(n) ? `${n < 10 ? n.toFixed(2) : n.toFixed(1)} ${unit}` : "unavailable";

function CalculatorPage() {
  const [data, setData] = useState<CanonicalData | null>(null);
  const [state, setState] = useState<WorkspaceState>(() => ({
    meal: [],
    supplements: [],
    settings: { gastricAcid: "normal", energyKcal: 2500, conditions: [] },
  }));

  useEffect(() => {
    setState(loadWorkspace());
    let cancelled = false;
    import("@/lib/calculator/canonical-foods.json").then((module) => {
      if (!cancelled) setData(module.default as unknown as CanonicalData);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveWorkspace(state);
  }, [state]);

  const totals = useMemo(() => {
    if (!data) return null;
    const forms = { ...data.nutrientForms };
    const items = [...state.meal];
    state.supplements.forEach((s, index) => {
      const key = `user_supplement_${index}`;
      forms[key] = { nutrientKey: s.nutrient, origin: "supplement", foodBound: false, label: s.name };
      items.push({
        id: key,
        grams: 100,
        preparation: "Supplement",
        food: {
          id: key,
          name: s.name,
          category: "Supplement",
          preparations: [],
          nutrients: { [key]: s.amount },
          provenance: { [key]: { unit: s.unit } },
        },
      });
    });
    return calculateMeal(items, forms, state.settings, data.targets);
  }, [data, state]);

  if (!data || !totals) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-20 text-muted-foreground sm:px-6">
          <CalculatorIcon className="size-5 animate-pulse" />
          Loading the nutrition calculator…
        </div>
      </div>
    );
  }

  const update = (next: Partial<WorkspaceState>) => setState((s) => ({ ...s, ...next }));
  const updateSettings = (next: Partial<WorkspaceState["settings"]>) =>
    setState((s) => ({ ...s, settings: { ...s.settings, ...next } }));

  return (
    <div className="min-h-screen bg-background pb-28">
      <SiteHeader />
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <CalculatorIcon className="size-4" />
            Nutrition calculator
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            What does your food actually give you?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Build a meal from USDA reference foods and see calories, macros and micronutrients against
            official intake targets — with evidence-bounded absorption estimates for iron, B12 and zinc.
            Where a gap shows up, we link you to supplements worth comparing.
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="mt-8">
          <TabsList className="flex h-auto flex-wrap justify-start">
            <TabsTrigger value="dashboard" className="gap-1.5">
              <Activity className="size-3.5" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="builder" className="gap-1.5">
              <Apple className="size-3.5" /> Build meal
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-1.5">
              <FlaskConical className="size-3.5" /> Analysis
            </TabsTrigger>
            <TabsTrigger value="supplements" className="gap-1.5">
              <Pill className="size-3.5" /> Supplements
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-1.5">
              <HeartPulse className="size-3.5" /> Health context
            </TabsTrigger>
            <TabsTrigger value="targets" className="gap-1.5">
              <Target className="size-3.5" /> Targets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard data={data} totals={totals} state={state} />
          </TabsContent>
          <TabsContent value="builder">
            <MealBuilder data={data} meal={state.meal} onChange={(meal) => update({ meal })} />
          </TabsContent>
          <TabsContent value="analysis">
            <Analysis data={data} totals={totals} state={state} />
          </TabsContent>
          <TabsContent value="supplements">
            <Supplements
              supplements={state.supplements}
              onChange={(supplements) => update({ supplements })}
            />
          </TabsContent>
          <TabsContent value="health">
            <HealthContext settings={state.settings} onChange={updateSettings} />
          </TabsContent>
          <TabsContent value="targets">
            <Targets data={data} energyKcal={state.settings.energyKcal} />
          </TabsContent>
        </Tabs>

        <p className="mt-10 max-w-3xl border-l-2 border-primary pl-3 text-xs leading-relaxed text-muted-foreground">
          This tool estimates meal composition from reference data. It does not diagnose, measure blood
          levels, or replace advice from your clinician. Absorption figures are population-model ranges,
          not personal measurements.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

function Dashboard({
  data,
  totals,
  state,
}: {
  data: CanonicalData;
  totals: ReturnType<typeof calculateMeal>;
  state: WorkspaceState;
}) {
  const macros: { label: string; value: string }[] = [
    { label: "Energy", value: fmt(totals.energy, "kcal") },
    { label: "Protein", value: fmt(totals.protein, "g") },
    { label: "Fat", value: fmt(totals.fat, "g") },
    { label: "Carbohydrate", value: fmt(totals.carbohydrate, "g") },
  ];

  const nutrientKeys = Object.keys(data.targets);
  const phos = totals.nutrients["phosphorus"]?.total ?? 0;
  const pral =
    totals.protein > 0 || phos > 0
      ? calculatePral({
          proteinG: totals.protein,
          phosphorusMg: phos,
          potassiumMg: totals.nutrients["potassium"]?.total ?? 0,
          magnesiumMg: totals.nutrients["magnesium"]?.total ?? 0,
          calciumMg: totals.nutrients["calcium"]?.total ?? 0,
        })
      : null;

  return (
    <div className="mt-6 space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {macros.map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
            <p className="num mt-1 text-xl font-semibold">{m.value}</p>
          </div>
        ))}
      </div>

      {pral !== null && (
        <p className="text-xs text-muted-foreground">
          Potential renal acid load (PRAL, Remer–Manz model):{" "}
          <span className="num font-semibold text-foreground">{pral.toFixed(1)} mEq</span> — negative
          values are more base-forming.
        </p>
      )}

      {state.meal.length === 0 && state.supplements.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          Your meal is empty. Open <strong className="text-foreground">Build meal</strong> and add foods
          to see your numbers here.
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Micronutrients vs targets
          </h2>
          {nutrientKeys.map((key) => {
            const target = data.targets[key]!;
            const n = totals.nutrients[key];
            const actual = n?.total ?? 0;
            const scale = progressScale(actual, target as unknown as Record<string, number | undefined>);
            const link = nutrientCatalogueLink(key);
            const reference = target.rda ?? target.ai ?? target.optimalMin;
            const pct = reference ? Math.round((actual / reference) * 100) : null;
            return (
              <div key={key} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">{target.displayName ?? key}</p>
                  <p className="num text-sm text-muted-foreground">
                    {fmt(actual, target.unit)}
                    {reference !== undefined && (
                      <>
                        {" "}
                        / {fmt(reference, target.unit)}
                        {pct !== null && (
                          <span
                            className={`ml-2 font-semibold ${pct >= 100 ? "text-primary" : "text-foreground"}`}
                          >
                            {pct}%
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
                <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, scale.actual)}%` }}
                  />
                  {Object.entries(scale.markers).map(([marker, pos]) =>
                    pos <= 100 ? (
                      <span
                        key={marker}
                        title={marker.toUpperCase()}
                        className="absolute top-0 h-full w-px bg-foreground/40"
                        style={{ left: `${pos}%` }}
                      />
                    ) : null,
                  )}
                </div>
                {pct !== null && pct < 100 && (
                  <Link
                    to={link.to}
                    className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    {link.label} →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Meal builder ---------------- */

function MealBuilder({
  data,
  meal,
  onChange,
}: {
  data: CanonicalData;
  meal: MealItem[];
  onChange: (meal: MealItem[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [grams, setGrams] = useState("100");
  const [prep, setPrep] = useState("");

  const entities = useMemo(() => foodEntities(data.foods), [data]);
  const categories = useMemo(
    () => ["All", ...new Set(entities.map((e) => e.category))].sort(),
    [entities],
  );
  const matches = entities
    .filter(
      (e) =>
        (category === "All" || e.category === category) &&
        e.name.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 30);
  const chosen = entities.find((e) => e.id === selectedId) ?? matches[0];
  const variant = chosen?.variants[0];
  const preparations = variant?.preparations?.length
    ? variant.preparations.map((p) => p.method)
    : variant
      ? [variant.preparation]
      : [];
  const effectivePrep = preparations.includes(prep) ? prep : (preparations[0] ?? "As listed");

  const add = () => {
    const g = Number(grams);
    if (!variant || !Number.isFinite(g) || g <= 0) return;
    onChange([
      ...meal,
      { id: crypto.randomUUID(), food: variant, grams: g, preparation: effectivePrep },
    ]);
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          1 · Choose a food
        </p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search food, e.g. chicken breast"
          className="mt-3 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Food category"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto">
          {matches.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => setSelectedId(e.id)}
                className={`min-h-11 w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  chosen?.id === e.id
                    ? "bg-primary/10 font-medium text-primary"
                    : "hover:bg-secondary"
                }`}
              >
                {e.name}
                <span className="ml-2 text-xs text-muted-foreground">{e.category}</span>
              </button>
            </li>
          ))}
          {matches.length === 0 && (
            <li className="px-3 py-4 text-sm text-muted-foreground">No foods match that search.</li>
          )}
        </ul>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            2 · Preparation & 3 · amount
          </p>
          {chosen && variant ? (
            <>
              <p className="mt-3 text-sm font-medium">{chosen.name}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <select
                  value={effectivePrep}
                  onChange={(e) => setPrep(e.target.value)}
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm"
                  aria-label="Preparation"
                >
                  {preparations.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <input
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  inputMode="decimal"
                  placeholder="Grams"
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  aria-label="Amount in grams"
                />
              </div>
              <Button onClick={add} className="mt-3 w-full gap-1.5">
                <Plus className="size-4" /> Add to meal
              </Button>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Pick a food on the left first.</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your meal ({meal.length})
          </p>
          {meal.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nothing added yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {meal.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <span>
                    {item.food.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.grams} g · {item.preparation}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${item.food.name}`}
                    onClick={() => onChange(meal.filter((x) => x.id !== item.id))}
                    className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Analysis ---------------- */

function Analysis({
  data,
  totals,
  state,
}: {
  data: CanonicalData;
  totals: ReturnType<typeof calculateMeal>;
  state: WorkspaceState;
}) {
  const rows = totals.pipeline;
  if (rows.length === 0) {
    return (
      <p className="mt-6 rounded-lg border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
        Add foods or supplements first — the per-nutrient analysis will appear here.
      </p>
    );
  }
  return (
    <div className="mt-6 space-y-4">
      {rows.map((row) => {
        const target = data.targets[row.nutrientKey];
        const n = totals.nutrients[row.nutrientKey];
        const estimate = n ? absorptionEstimate(row.nutrientKey, n, state.settings.gastricAcid) : null;
        return (
          <details key={row.nutrientKey} className="rounded-lg border border-border bg-surface p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              {target?.displayName ?? row.nutrientKey}
              <span className="num ml-2 font-normal text-muted-foreground">
                {fmt(row.grossIntake.value, row.unit)}
              </span>
            </summary>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(row.sources).map(([origin, amount]) => (
                  <span key={origin} className="rounded-full bg-secondary px-2.5 py-1">
                    {origin}: <span className="num">{fmt(amount, row.unit)}</span>
                  </span>
                ))}
              </div>
              {estimate ? (
                <div className="rounded-md border border-border bg-background p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Modeled absorption
                  </p>
                  <p className="num mt-1 text-sm">
                    {estimate.total.min.toFixed(2)}–{estimate.total.max.toFixed(2)} {estimate.unit}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {estimate.sources.map(([label, amount, range]) => (
                      <li key={label}>
                        {label}: {fmt(amount, estimate.unit)} → absorbs {range.min.toFixed(2)}–
                        {range.max.toFixed(2)} {estimate.unit}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted-foreground">{estimate.assumption}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {absorptionSummary(row.nutrientKey, n!, estimate.unit)}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {row.absorption.reason ?? "Quantitative absorption is not modeled for this nutrient."}
                </p>
              )}
              {row.mealInteractions.observations.length > 0 && (
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {row.mealInteractions.observations.map((o, i) => (
                    <li key={i}>• {o.effect}</li>
                  ))}
                </ul>
              )}
              {row.conditionEffects.length > 0 && (
                <div className="rounded-md border border-border bg-background p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Your health context
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                    {row.conditionEffects.map((e) => (
                      <li key={e.mechanismId}>• {e.assumption}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}

/* ---------------- Supplements ---------------- */

function Supplements({
  supplements,
  onChange,
}: {
  supplements: SupplementEntry[];
  onChange: (s: SupplementEntry[]) => void;
}) {
  const [formId, setFormId] = useState(SUPPLEMENT_FORMS[0]?.supplementFormId ?? "");
  const [dose, setDose] = useState("");
  const form = SUPPLEMENT_FORMS.find((f) => f.supplementFormId === formId) ?? SUPPLEMENT_FORMS[0];

  const add = () => {
    const amount = Number(dose);
    if (!form || !Number.isFinite(amount) || amount <= 0) return;
    onChange([
      ...supplements,
      { name: form.name, nutrient: form.nutrientId, amount, unit: form.defaultUnit },
    ]);
    setDose("");
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Add a supplement you take
        </p>
        <select
          value={form?.supplementFormId}
          onChange={(e) => setFormId(e.target.value)}
          className="mt-3 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Supplement form"
        >
          {SUPPLEMENT_FORMS.map((f) => (
            <option key={f.supplementFormId} value={f.supplementFormId}>
              {f.name} ({f.chemicalForm})
            </option>
          ))}
        </select>
        {form && (
          <p className="mt-2 text-xs text-muted-foreground">
            Typical labeled dose: {form.typicalDoseMin}–{form.typicalDoseMax} {form.defaultUnit}. Enter
            the labeled nutrient amount — compound mass is not inferred.
          </p>
        )}
        <div className="mt-3 flex gap-2">
          <input
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            inputMode="decimal"
            placeholder={`Dose in ${form?.defaultUnit ?? "mg"}`}
            className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-label="Dose"
          />
          <Button onClick={add} className="gap-1.5">
            <Plus className="size-4" /> Add
          </Button>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Your stack ({supplements.length})
        </p>
        {supplements.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No supplements added.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {supplements.map((s, i) => (
              <li
                key={`${s.name}-${i}`}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <span>
                  {s.name}
                  <span className="num ml-2 text-xs text-muted-foreground">
                    {s.amount} {s.unit}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${s.name}`}
                  onClick={() => onChange(supplements.filter((_, j) => j !== i))}
                  className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- Health context ---------------- */

function HealthContext({
  settings,
  onChange,
}: {
  settings: WorkspaceState["settings"];
  onChange: (next: Partial<WorkspaceState["settings"]>) => void;
}) {
  const selectedIds = settings.conditions.map((c) => c.id);
  const toggle = (id: string) => {
    const next: ConditionSelection[] = selectedIds.includes(id)
      ? settings.conditions.filter((c) => c.id !== id)
      : [...settings.conditions, { id, state: CONDITION_STATE_OPTIONS[id]?.[0]?.[0] ?? null }];
    onChange({ conditions: next });
  };
  const setCondState = (id: string, state: string) =>
    onChange({
      conditions: settings.conditions.map((c) => (c.id === id ? { ...c, state } : c)),
    });

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block rounded-lg border border-border bg-surface p-4 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Gastric acid
          </span>
          <select
            value={settings.gastricAcid}
            onChange={(e) => onChange({ gastricAcid: e.target.value as "normal" | "low" })}
            className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="normal">Normal</option>
            <option value="low">Low / acid-suppressing medication</option>
          </select>
        </label>
        <label className="block rounded-lg border border-border bg-surface p-4 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Daily energy (kcal) — sets your thiamine target
          </span>
          <input
            value={settings.energyKcal}
            onChange={(e) => onChange({ energyKcal: Number(e.target.value) || 0 })}
            inputMode="numeric"
            className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Clinically documented conditions
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Conditions adjust which mechanisms are shown — they never apply generic multipliers or change
          official references. Select only states documented by your clinician.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CONDITION_CATALOG.map((condition) => {
            const selected = settings.conditions.find((c) => c.id === condition.id);
            const options = CONDITION_STATE_OPTIONS[condition.id] ?? [];
            return (
              <div
                key={condition.id}
                className={`rounded-lg border p-4 text-sm transition-colors ${
                  selected ? "border-primary/50 bg-primary/5" : "border-border bg-surface"
                }`}
              >
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => toggle(condition.id)}
                    className="mt-1 size-4"
                  />
                  <span>
                    <span className="font-medium">{condition.name}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {condition.description}
                    </span>
                  </span>
                </label>
                {selected && options.length > 0 && (
                  <select
                    value={selected.state ?? options[0]![0]}
                    onChange={(e) => setCondState(condition.id, e.target.value)}
                    className="mt-3 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    aria-label={`${condition.name} state`}
                  >
                    {options.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Targets ---------------- */

function Targets({ data, energyKcal }: { data: CanonicalData; energyKcal: number }) {
  const thiamine = thiamineTarget(energyKcal || 2500);
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Nutrient</th>
            <th className="px-4 py-3 font-medium">RDA / AI</th>
            <th className="px-4 py-3 font-medium">Upper limit</th>
            <th className="px-4 py-3 font-medium">Reference</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data.targets).map(([key, t]) => (
            <tr key={key} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium">{t.displayName ?? key}</td>
              <td className="num px-4 py-3">
                {t.rda !== undefined
                  ? fmt(t.rda, t.unit)
                  : t.ai !== undefined
                    ? `${fmt(t.ai, t.unit)} (AI)`
                    : "—"}
                {key === "thiamine" && (
                  <span className="block text-xs text-muted-foreground">
                    Energy-adjusted for you: {thiamine.min}–{thiamine.max} mg
                  </span>
                )}
              </td>
              <td className="num px-4 py-3">{t.ul !== undefined ? fmt(t.ul, t.unit) : "—"}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {t.referenceSystem ?? t.source ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
