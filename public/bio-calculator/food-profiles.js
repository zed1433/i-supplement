// Site-specific adapter: merges food-profiles.json (built by scripts/build-food-profiles.py) into the
// calculator's foods and routes animal/plant origin into the engine. Engine files are not modified.
const FORM_KEY = { iron_total: 'iron', vitamin_b12_food: 'vitamin_b12' };
const LABELS = { M: 'Measured', Z: 'Measured zero', B: 'Absent by biology', E: 'Estimated', U: 'Not measured' };
export const ANTINUTRIENTS = ['phytate', 'oxalate', 'tannin', 'lectin_load'];

/** Adds every profile value the food does not already carry (existing source values always win). */
export function mergeFoodProfiles(data, profiles) {
  const { keys, units, refs, foods } = profiles;
  for (const key of keys) {
    const nutrientKey = FORM_KEY[key] ?? key;
    if (!data.nutrientForms[key] && data.targets[nutrientKey]) data.nutrientForms[key] = { nutrientKey, origin: 'unknown', label: `Total ${nutrientKey.replaceAll('_', ' ')}` };
  }
  for (const food of data.foods) {
    const p = foods[food.id];
    if (!p) continue;
    const status = {}, ref = {};
    keys.forEach((key, i) => {
      const code = p.s[i];
      status[key] = code; ref[key] = p.r[i] >= 0 ? refs[p.r[i]] : '';
      if (code === 'U' || food.nutrients[key] != null) return;
      food.nutrients[key] = p.v[i];
      food.provenance ??= {};
      food.provenance[key] = { source: ref[key], unit: units[key], amountPer100g: p.v[i], status: LABELS[code] };
    });
    food.profile = { kind: p.k, status, ref };
  }
  return data;
}

/** Copies a meal item so animal foods feed the engine's animal path and plant foods its plant path. */
export function originItem(item, forms) {
  const kind = item.food?.profile?.kind;
  const tag = kind === 'animal' ? 'a' : kind === 'plant' || kind === 'fat_plant' ? 'p' : kind === 'dairy_egg' || kind === 'fat_animal' ? 'd' : null;
  if (!tag) return item;
  const nutrients = {}, provenance = {};
  for (const [key, value] of Object.entries(item.food.nutrients)) {
    const form = forms[key];
    // Milk/egg iron is non-heme: keep it out of the animal (heme) path.
    const origin = tag === 'a' ? 'animal' : tag === 'p' ? 'plant' : key === 'iron_total' ? 'unknown' : 'animal';
    if (!form || form.origin !== 'unknown' || origin === 'unknown') { nutrients[key] = value; if (item.food.provenance?.[key]) provenance[key] = item.food.provenance[key]; continue; }
    const id = `${key}@${origin}`;
    forms[id] ??= { ...form, origin };
    nutrients[id] = value;
    provenance[id] = item.food.provenance?.[key] ?? { unit: 'mg' };
  }
  return { ...item, food: { ...item.food, nutrients, provenance } };
}

/** Meal anti-nutrient load (mg; lectin is a relative index). Unknown values are counted separately, never as zero. */
export function antinutrientTotals(meal) {
  const out = {};
  for (const key of ANTINUTRIENTS) out[key] = { total: 0, unknownFoods: [] };
  for (const item of meal) {
    const grams = Number(item.grams);
    if (!Number.isFinite(grams) || grams <= 0) continue;
    for (const key of ANTINUTRIENTS) {
      const code = item.food?.profile?.status?.[key];
      if (!code || code === 'U') { out[key].unknownFoods.push(item.food?.name ?? 'Unknown food'); continue; }
      out[key].total += (item.food.nutrients[key] ?? 0) * grams / 100;
    }
  }
  return out;
}

export function profileStatus(food, key) {
  const lookup = key === 'iron' ? 'iron_total' : key === 'vitamin_b12' ? 'vitamin_b12_food' : key;
  const code = food?.profile?.status?.[lookup];
  return code ? { code, label: LABELS[code], ref: food.profile.ref[lookup] } : null;
}

export function profileSummary(food) {
  const s = food?.profile?.status;
  if (!s) return null;
  const v = Object.values(s);
  return { measured: v.filter(c => c === 'M' || c === 'Z' || c === 'B').length, estimated: v.filter(c => c === 'E').length, unknown: v.filter(c => c === 'U').length };
}
