"""
Builds public/bio-calculator/food-profiles.json: one complete nutrient + anti-nutrient profile
for EVERY calculator food (87 canonical USDA foods + all rows of extra-foods.json).

Every value carries a status code, so a missing number is never presented as a real zero:
  M = measured           value published by the source (USDA / CIQUAL / label)
  Z = measured zero      source reported 0 or "traces"
  B = absent by biology  e.g. phytate/oxalate in animal foods, creatine/heme iron in plants
  E = estimated          borrowed from the closest lab-measured food (reference recorded)
  U = unknown            no reliable value; counted as 0 by the calculator but flagged

Inputs (download into /tmp/fd first, see build-extra-foods.py):
  FoodData Central Foundation + SR Legacy JSON, CIQUAL 2020 pickled as ciq.pkl
  scripts/data/legacy-supabase/*.csv  (the owner's earlier calculator database, reference tables only)
Run: PYTHONPATH=/tmp/pylib python3 scripts/build-food-profiles.py
"""
import csv, json, os, re
from collections import Counter

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = "/tmp/fd"
LEG = os.path.join(ROOT, "scripts/data/legacy-supabase")
OUT = os.path.join(ROOT, "public/bio-calculator/food-profiles.json")

# Profile keys. Units follow the calculator's targets (copper in µg!).
KEYS = [
  ("energy", "kcal"), ("protein", "g"), ("fat", "g"), ("carbohydrate", "g"), ("fiber", "g"), ("water", "g"),
  ("calcium", "mg"), ("iron_total", "mg"), ("magnesium", "mg"), ("phosphorus", "mg"), ("potassium", "mg"),
  ("sodium", "mg"), ("chloride", "mg"), ("zinc", "mg"), ("copper", "µg"), ("manganese", "mg"), ("selenium", "µg"),
  ("iodine", "µg"), ("chromium", "µg"), ("molybdenum", "µg"), ("fluoride", "mg"),
  ("vitamin_a", "µg"), ("vitamin_d", "µg"), ("vitamin_e", "mg"), ("vitamin_k", "µg"), ("vitamin_c", "mg"),
  ("thiamine", "mg"), ("riboflavin", "mg"), ("niacin", "mg"), ("pantothenic_acid", "mg"), ("vitamin_b6", "mg"),
  ("biotin", "µg"), ("folate", "µg"), ("vitamin_b12_food", "µg"), ("choline", "mg"),
  ("omega3_ala", "g"), ("omega3_epa", "g"), ("omega3_dha", "g"),
  ("creatine", "mg"), ("taurine", "mg"),
  ("phytate", "mg"), ("oxalate", "mg"), ("tannin", "mg"), ("lectin_load", "index"), ("heme_fraction", "ratio"),
]
UNITS = dict(KEYS)
ORDER = [k for k, _ in KEYS]
ANTI = ("phytate", "oxalate", "tannin", "lectin_load")

# ---------- USDA ----------
# key -> list of (nutrient id, multiplier) in priority order
USDA_IDS = {
  "energy": [(1008, 1), (2047, 1), (2048, 1)], "protein": [(1003, 1)], "fat": [(1004, 1)], "carbohydrate": [(1005, 1)],
  "fiber": [(1079, 1)], "water": [(1051, 1)], "calcium": [(1087, 1)], "iron_total": [(1089, 1)], "magnesium": [(1090, 1)],
  "phosphorus": [(1091, 1)], "potassium": [(1092, 1)], "sodium": [(1093, 1)], "chloride": [(1088, 1)], "zinc": [(1095, 1)],
  "copper": [(1098, 1000)], "manganese": [(1101, 1)], "selenium": [(1103, 1)], "iodine": [(1100, 1)],
  "chromium": [(1096, 1)], "molybdenum": [(1102, 1)], "fluoride": [(1099, 0.001)],
  "vitamin_a": [(1106, 1)], "vitamin_d": [(1114, 1)], "vitamin_e": [(1109, 1)], "vitamin_k": [(1185, 1)],
  "vitamin_c": [(1162, 1)], "thiamine": [(1165, 1)], "riboflavin": [(1166, 1)], "niacin": [(1167, 1)],
  "pantothenic_acid": [(1170, 1)], "vitamin_b6": [(1175, 1)], "biotin": [(1176, 1)], "folate": [(1190, 1), (1177, 1)],
  "vitamin_b12_food": [(1178, 1)], "choline": [(1180, 1)],
  "omega3_ala": [(1404, 1), (1270, 1)], "omega3_epa": [(1278, 1)], "omega3_dha": [(1272, 1)],
}

def usda_profile(food):
  by = {}
  for n in food.get("foodNutrients", []):
    nid = (n.get("nutrient") or {}).get("id") or n.get("nutrientId")
    amt = n.get("amount")
    if amt is None: continue
    by[nid] = float(amt)
  out = {}
  for key, ids in USDA_IDS.items():
    for nid, mult in ids:
      if nid in by:
        out[key] = round(by[nid] * mult, 5)
        break
  return out

usda = {}
for path, k in ((f"{SRC}/FoodData_Central_foundation_food_json_2025-04-24.json", "FoundationFoods"),
                (f"{SRC}/FoodData_Central_sr_legacy_food_json_2018-04.json", "SRLegacyFoods")):
  for f in json.load(open(path))[k]:
    usda[f["fdcId"]] = (f, f.get("foodCategory", {}).get("description", ""))

# ---------- CIQUAL ----------
import pandas as pd
CIQ_COLS = {
  "energy": [("Energy, Regulation EU No 1169/2011 (kcal/100g)", 1), ("Energy, N x Jones' factor, with fibres (kcal/100g)", 1)],
  "protein": [("Protein (g/100g)", 1)], "fat": [("Fat (g/100g)", 1)], "carbohydrate": [("Carbohydrate (g/100g)", 1)],
  "fiber": [("Fibres (g/100g)", 1)], "water": [("Water (g/100g)", 1)], "calcium": [("Calcium (mg/100g)", 1)],
  "iron_total": [("Iron (mg/100g)", 1)], "magnesium": [("Magnesium (mg/100g)", 1)], "phosphorus": [("Phosphorus (mg/100g)", 1)],
  "potassium": [("Potassium (mg/100g)", 1)], "sodium": [("Sodium (mg/100g)", 1)], "chloride": [("Chloride (mg/100g)", 1)],
  "zinc": [("Zinc (mg/100g)", 1)], "copper": [("Copper (mg/100g)", 1000)], "manganese": [("Manganese (mg/100g)", 1)],
  "selenium": [("Selenium (µg/100g)", 1)], "iodine": [("Iodine (µg/100g)", 1)],
  "vitamin_d": [("Vitamin D (µg/100g)", 1)], "vitamin_e": [("Vitamin E (mg/100g)", 1)], "vitamin_c": [("Vitamin C (mg/100g)", 1)],
  "thiamine": [("Vitamin B1 or Thiamin (mg/100g)", 1)], "riboflavin": [("Vitamin B2 or Riboflavin (mg/100g)", 1)],
  "niacin": [("Vitamin B3 or Niacin (mg/100g)", 1)], "pantothenic_acid": [("Vitamin B5 or Pantothenic acid (mg/100g)", 1)],
  "vitamin_b6": [("Vitamin B6 (mg/100g)", 1)], "folate": [("Vitamin B9 or Folate (µg/100g)", 1)],
  "vitamin_b12_food": [("Vitamin B12 (µg/100g)", 1)],
  "omega3_ala": [("FA 18:3 c9,c12,c15 (n-3) (g/100g)", 1)], "omega3_epa": [("FA 20:5 5c,8c,11c,14c,17c (n-3) EPA (g/100g)", 1)],
  "omega3_dha": [("FA 22:6 4c,7c,10c,13c,16c,19c (n-3) DHA (g/100g)", 1)],
}

def ciq_val(v):
  """Returns (value, status) or None. '<x' (below detection limit) is reported as unknown, never guessed."""
  if v is None or (isinstance(v, float) and v != v): return None
  s = str(v).strip().replace(",", ".")
  if s in ("-", "", "nan"): return None
  if s.lower() == "traces": return (0.0, "Z")
  if s.startswith("<"): return None
  try:
    x = round(float(s), 5)
    return (x, "Z" if x == 0 else "M")
  except ValueError:
    return None

ciq = {}
for _, row in pd.read_pickle(f"{SRC}/ciq.pkl").iterrows():
  vals, st = {}, {}
  for key, cols in CIQ_COLS.items():
    for col, mult in cols:
      r = ciq_val(row[col])
      if r is not None:
        vals[key], st[key] = round(r[0] * mult, 5), r[1]
        break
  # Vitamin A as RAE: retinol + beta-carotene / 12 (IOM 2001). Only when both parts are reported.
  ret, bc = ciq_val(row["Retinol (µg/100g)"]), ciq_val(row["Beta-carotene (µg/100g)"])
  if ret is not None and bc is not None:
    vals["vitamin_a"] = round(ret[0] + bc[0] / 12, 3); st["vitamin_a"] = "Z" if vals["vitamin_a"] == 0 else "M"
  k1, k2 = ciq_val(row["Vitamin K1 (µg/100g)"]), ciq_val(row["Vitamin K2 (µg/100g)"])
  if k1 is not None:
    vals["vitamin_k"] = round(k1[0] + (k2[0] if k2 else 0), 3); st["vitamin_k"] = "Z" if vals["vitamin_k"] == 0 else "M"
  ciq[int(row["alim_code"])] = (vals, st, str(row["alim_grp_nom_eng"]), str(row["alim_ssgrp_nom_eng"]))

# ---------- Owner's legacy database (88 foods with anti-nutrients) ----------
leg_water = {}
for r in csv.DictReader(open(f"{LEG}/food_micronutrients.csv")):
  if r["nutrient_name"] == "Water":
    try: leg_water[r["food_id"]] = float(r["amount_per_100g"])
    except ValueError: pass
legacy = {}
for r in csv.DictReader(open(f"{LEG}/foods.csv")):
  legacy[r["name"]] = r

def fnum(x):
  try: return float(x)
  except (TypeError, ValueError): return 0.0

# Keyword (must start the food name) -> legacy reference food. Raw / plain foods only.
PLANT_REF = [
  (r"spinach", "Spinach (Raw)"), (r"potato(es)?\b(?!.*sweet)", "Potato (White, with skin, Raw)"), (r"almonds?", "Almonds (Raw)"),
  (r"avocados?", "Avocado"), (r"oats?\b|cereals?, oats", "Oats (Rolled, Dry)"), (r"oranges?\b", "Orange"),
  (r"cabbage", "Cabbage (Green, Raw)"), (r"sesame seeds?", "Sesame Seeds (Whole)"), (r"rice, brown|brown rice", "Brown Rice (Uncooked)"),
  (r"rhubarb", "Rhubarb (Raw)"), (r"onions?\b", "Onion (Yellow, Raw)"), (r"lentils?", "Lentils (Dry)"), (r"garlic", "Garlic (Raw)"),
  (r"soybeans?", "Soybeans (Dry)"), (r"pumpkin seeds?|seeds, pumpkin", "Pumpkin Seeds (Pepitas)"),
  (r"brussels sprouts", "Brussels Sprouts (Raw)"), (r"bananas?", "Banana"), (r"beets?\b(?!.*greens)|beetroot", "Beetroot (Raw)"),
  (r"cauliflower", "Cauliflower (Raw)"), (r"beans, kidney|kidney beans?|red kidney bean", "Kidney Beans (Dry)"),
  (r"chard|swiss chard", "Swiss Chard (Raw)"), (r"broccoli", "Broccoli (Raw)"), (r"sweet ?potato", "Sweet Potato (Raw)"),
  (r"collards?", "Collard Greens (Raw)"), (r"kale", "Kale (Raw)"), (r"carrots?", "Carrot (Raw)"), (r"beet greens", "Beet Greens (Raw)"),
  (r"strawberr", "Strawberries"), (r"blueberr", "Blueberries"),
]
PLANT_REF = [(re.compile(r"^(" + p + r")", re.I), n) for p, n in PLANT_REF]
MIXED = re.compile(r"\b(with|soup|sauce|salad|pie|cake|bread|juice|milk|oil|butter|flour|cookie|biscuit|chips|candied|jam|pudding|frozen dessert|baby|prepared|canned in syrup|sweetened|dessert|drink|beverage|spread|paste)\b", re.I)

# ---------- Published animal-food values (raw muscle / milk) ----------
# Creatine: Balsom PD, Söderlund K, Ekblom B. Sports Med 1994;18(4):268-280, Table I (g/kg raw) -> mg/100 g.
# Taurine: Laidlaw SA, Grosvenor M, Kopple JD. JPEN 1990;14(2):183-188 (mg/100 g raw edible portion).
LIT = "Balsom 1994 (creatine); Laidlaw 1990 (taurine)"
ANIMAL_LIT = [
  # (regex on name, category hint regex, creatine mg/100g or None, taurine mg/100g or None, label)
  (r"herring", None, 825, None, "herring"),
  (r"salmon", None, 450, None, "salmon"),
  (r"tuna", None, 400, None, "tuna"),
  (r"\bcod\b|fish, cod", None, 300, 31.0, "cod"),
  (r"plaice", None, 200, None, "plaice"),
  (r"mussel", None, None, 655.0, "mussels"),
  (r"oyster", None, None, 396.0, "oysters"),
  (r"chicken.*(breast|light)|(breast|light).*chicken", None, None, 17.8, "chicken light meat"),
  (r"chicken.*(thigh|leg|drumstick|dark)|(thigh|leg|drumstick|dark).*chicken", None, None, 169.4, "chicken dark meat"),
  (r"turkey.*(breast|light)|(breast|light).*turkey", None, None, 29.6, "turkey light meat"),
  (r"turkey.*(thigh|leg|drumstick|dark)|(thigh|leg|drumstick|dark).*turkey", None, None, 306.0, "turkey dark meat"),
  (r"^beef\b|^beef,", r"beef", 450, 43.1, "beef muscle"),
  (r"^pork\b|^pork,", r"pork", 500, 61.2, "pork muscle"),
  (r"^lamb\b|^lamb,", r"lamb", None, 43.8, "lamb muscle"),
  (r"^milk, (whole|reduced|lowfat|nonfat|fluid)|^(whole|semi-skimmed|skimmed) milk|^cow milk|^milk,? (cow|whole|semi)", None, 10, None, "cow's milk"),
]
ANIMAL_LIT = [(re.compile(a, re.I), re.compile(b, re.I) if b else None, c, t, l) for a, b, c, t, l in ANIMAL_LIT]
ORGAN = re.compile(r"liver|kidney|heart|tongue|brain|tripe|sweetbread|marrow|lung|spleen|giblet|gizzard|blood|sausage|ham|bacon|salami|jerky|cured|smoked|dried|frankfurter|bologna|luncheon|nugget|breaded|patty", re.I)
RAW = re.compile(r"\braw\b", re.I)

# ---------- Food-kind classification ----------
USDA_ANIMAL = {"Finfish and Shellfish Products", "Poultry Products", "Beef Products", "Pork Products", "Lamb, Veal, and Game Products",
               "Dairy and Egg Products", "Sausages and Luncheon Meats"}
USDA_PLANT = {"Vegetables and Vegetable Products", "Fruits and Fruit Juices", "Legumes and Legume Products", "Nut and Seed Products",
              "Cereal Grains and Pasta", "Spices and Herbs", "Breakfast Cereals"}
CIQ_ANIMAL = {"meat, egg and fish", "milk and milk products"}
CIQ_PLANT = {"fruits, vegetables, legumes and nuts", "cereal products"}
DAIRY_EGG = re.compile(r"milk|cheese|yog|egg|cream|butter|kefir|whey|curd|quark|ghee|fromage|skyr", re.I)
PURE_FAT = re.compile(r"^(oil|oils)\b|\boil,|\boil\b$| oil\b|^fat, |lard|tallow|ghee|shortening", re.I)
NO_B12_EXCEPT = re.compile(r"seaweed|algae|nori|spirulina|chlorella|mushroom|tempeh|fermented|fortified|nutritional yeast|yeast", re.I)
NO_VITD_EXCEPT = re.compile(r"mushroom|fortified|yeast", re.I)

def kind(name, src, cat, sub=""):
  if src == "usda":
    if cat in USDA_ANIMAL: return "dairy_egg" if cat == "Dairy and Egg Products" and DAIRY_EGG.search(name) else "animal"
    if cat == "Fats and Oils": return "fat_plant" if not re.search(r"lard|tallow|butter|fish|beef|pork|chicken", name, re.I) else "fat_animal"
    if cat in USDA_PLANT: return "plant"
  if src == "ciqual":
    if cat in CIQ_ANIMAL: return "dairy_egg" if (cat == "milk and milk products" or re.search(r"egg", sub, re.I)) else "animal"
    if cat in CIQ_PLANT: return "plant"
    if cat == "fats and oils": return "fat_plant" if re.search(r"vegetable|oil|margarine", sub + " " + name, re.I) and not re.search(r"butter|lard|fish|animal", sub + " " + name, re.I) else "fat_animal"
  return "mixed"

# ---------- Profile builder ----------
stats_src = {}

def build(vals, st, name, k, measured_src):
  """vals/st: measured values + statuses from the primary source. Returns {key: [value, status, refIndex]}"""
  p = {}
  for key in ORDER:
    if key in vals:
      p[key] = [vals[key], st.get(key, "Z" if vals[key] == 0 else "M"), measured_src]
  def setb(key, v=0.0, ref="Absent by biology"):
    if key not in p: p[key] = [v, "B", ref]
  # Biological absences
  if k in ("animal", "dairy_egg", "fat_animal"):
    for key in ANTI: setb(key, ref="Not present in animal foods")
    setb("fiber", ref="Not present in animal foods")
  if k in ("plant", "fat_plant"):
    setb("creatine", ref="Not synthesised by plants"); setb("taurine", ref="Negligible in plants (Laidlaw 1990)")
    setb("heme_fraction", ref="Plants contain no heme iron")
    if not NO_B12_EXCEPT.search(name): setb("vitamin_b12_food", ref="Plants do not synthesise B12")
    if not NO_VITD_EXCEPT.search(name): setb("vitamin_d", ref="Not present in plants (except UV-exposed mushrooms)")
    setb("omega3_epa", ref="Not present in land plants"); setb("omega3_dha", ref="Not present in land plants")
  if k == "dairy_egg":
    setb("heme_fraction", ref="Milk and eggs contain no myoglobin/hemoglobin iron")
  if k == "fat_plant":
    for key in ("phytate", "oxalate", "lectin_load"): setb(key, ref="Removed by oil extraction")
  if k == "fat_animal":
    setb("creatine", ref="Rendered fat contains no muscle creatine"); setb("taurine", ref="Rendered fat contains no taurine")
  # Plant anti-nutrients from the owner's database (estimated, scaled by dry matter)
  if k == "plant" and not MIXED.search(name):
    for rx, ref in PLANT_REF:
      if rx.search(name):
        lr = legacy[ref]; w_ref = leg_water.get(lr["id"]); w_t = vals.get("water")
        if w_ref is None or w_t is None or w_ref >= 99: break
        scale = (100 - w_t) / (100 - w_ref)
        for key, col in (("phytate", "phytate_mg_per_100g"), ("oxalate", "oxalate_mg_per_100g"), ("tannin", "tannin_content"), ("lectin_load", "lectin_trypsin_load")):
          v = fnum(lr[col])
          # A zero for a plant in the legacy table means "not filled in", not "measured zero" -> stays unknown.
          if v > 0 and key not in p: p[key] = [round(v * scale, 2), "E", f"My database: {ref} (scaled by dry matter ×{scale:.2f})"]
        break
  # Creatine / taurine: published raw-muscle values for the same food type
  if k in ("animal", "dairy_egg") and (RAW.search(name) or k == "dairy_egg") and not ORGAN.search(name):
    for rx, cat_rx, cr, ta, label in ANIMAL_LIT:
      if rx.search(name):
        if cr is not None and "creatine" not in p: p["creatine"] = [cr, "E", f"Balsom 1994, {label} (raw)"]
        if ta is not None and "taurine" not in p: p["taurine"] = [ta, "E", f"Laidlaw 1990, {label} (raw)"]
        break
  # Heme fraction for muscle meat / fish is not measured per food: left unknown (engine default 40 % applies).
  for key in ORDER:
    if key not in p: p[key] = [0.0, "U", ""]
  return p

profiles = {}
refs, ref_index = [], {}
def ref_id(s):
  if s not in ref_index: ref_index[s] = len(refs); refs.append(s)
  return ref_index[s]

def add(fid, name, prof, kind_):
  vals, sts, rfs = [], "", []
  for key in ORDER:
    v, s, r = prof[key]
    vals.append(None if s == "U" else (round(v, 4) if isinstance(v, float) else v)); sts += s; rfs.append(ref_id(r) if r else -1)
  profiles[fid] = {"k": kind_, "v": vals, "s": sts, "r": rfs}

canon = json.load(open(os.path.join(ROOT, "public/bio-calculator/canonical-foods.json")))
for f in canon["foods"]:
  vals = usda_profile({"foodNutrients": [{"nutrient": {"id": n["nutrientId"]}, "amount": n["amount"]} for n in f["fdcNutrients"]]})
  cat = usda.get(f["fdcId"], (None, ""))[1]
  k = kind(f["name"], "usda", cat)
  add(f["id"], f["name"], build(vals, {}, f["name"], k, "USDA FoodData Central fdc:%s" % f["fdcId"]), k)

extra = json.load(open(os.path.join(ROOT, "public/bio-calculator/extra-foods.json")))
for row in extra["rows"]:
  fid, name, category, prep, nutrients, source = row[:6]
  if fid.startswith("usda-"):
    fdc = int(fid[5:]); f, cat = usda.get(fdc, (None, ""))
    vals = usda_profile(f) if f else dict(nutrients)
    k = kind(name, "usda", cat)
    add(fid, name, build(vals, {}, name, k, f"USDA FoodData Central fdc:{fdc}"), k)
  elif fid.startswith("ciqual-"):
    code = int(fid[7:]); vals, st, grp, sub = ciq.get(code, (dict(nutrients), {}, "", ""))
    k = kind(name, "ciqual", grp, sub)
    add(fid, name, build(vals, st, name, k, f"ANSES-CIQUAL 2020 code {code}"), k)
  else:  # Open Food Facts label data: only what is printed on the pack
    vals = {key: v for key, v in nutrients.items() if key in UNITS}
    add(fid, name, build(vals, {}, name, "mixed", "Open Food Facts label"), "mixed")

out = {"schemaVersion": 1, "generated": "2026-10-17", "keys": ORDER, "units": UNITS,
       "status": {"M": "Measured", "Z": "Measured zero", "B": "Absent by biology", "E": "Estimated", "U": "Unknown"},
       "notes": {"lectin_load": "Relative lectin / trypsin-inhibitor index from the owner's database (no SI unit).",
                 "heme_fraction": "Share of iron present as heme iron (0–1)."},
       "refs": refs, "foods": profiles}
json.dump(out, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))

# Coverage report
rep = {key: Counter() for key in ORDER}
for p in profiles.values():
  for key, s in zip(ORDER, p["s"]): rep[key][s] += 1
lines = ["| Nutrient | Measured | Measured zero | Absent by biology | Estimated | Unknown |", "|---|---|---|---|---|---|"]
for key in ORDER:
  c = rep[key]; lines.append(f"| {key} | {c['M']} | {c['Z']} | {c['B']} | {c['E']} | {c['U']} |")
open("/tmp/coverage.md", "w").write(f"Foods: {len(profiles)}\n\n" + "\n".join(lines) + "\n")
print(len(profiles), "foods", os.path.getsize(OUT), "bytes")
print(Counter(p["k"] for p in profiles.values()))
