"""
Builds public/bio-calculator/extra-foods.json from official composition tables.
Inputs (download into /tmp/fd first):
  - USDA FoodData Central Foundation Foods JSON + SR Legacy JSON (public domain)
  - ANSES-CIQUAL 2020 English .xls (Etalab Open Licence) -> pickled as ciq.pkl
  - Open Food Facts search pages o*.json (ODbL, label data)
Every value is copied from the source per 100 g; nothing is estimated.
Run: PYTHONPATH=/tmp/pylib python3 scripts/build-extra-foods.py
"""
import json, glob, re, os

SRC = "/tmp/fd"
OUT = os.path.join(os.path.dirname(__file__), "..", "public/bio-calculator/extra-foods.json")
canon = json.load(open(os.path.join(os.path.dirname(__file__), "..", "public/bio-calculator/canonical-foods.json")))
canon_fdc = {f["fdcId"] for f in canon["foods"]}

# engine nutrient key -> (USDA nutrient ids, unit)
USDA = {"energy": ([1008, 2047, 2048], "kcal"), "protein": ([1003], "g"), "fat": ([1004], "g"),
        "carbohydrate": ([1005], "g"), "fiber": ([1079], "g"), "calcium": ([1087], "mg"),
        "iron_total": ([1089], "mg"), "potassium": ([1092], "mg"), "zinc": ([1095], "mg"),
        "vitamin_c": ([1162], "mg"), "thiamine": ([1165], "mg"), "vitamin_b12_food": ([1178], "µg")}
REQUIRED = ("energy", "protein", "fat", "carbohydrate")
GREEK = re.compile(r"\b(greek|greece|moussaka|tzatziki|taramasalata|feta|kefalotyri|kasseri|halloumi|dolma|vine leaves|souvlaki|gyros|pita|pitta|hummus|houmous|baklava|olive|spanakopita|tabbouleh|aubergine caviar|stuffed tomato|stuffed pepper|lentil soup|chickpea|fava|octopus|squid|sardine|anchov|mullet|sea bream|sea bass|halva|sesame|tahini|ouzo|retsina|oregano|yoghurt, greek)\b", re.I)

def rec(id_, name, category, nutrients, prov_src, evidence, units, origin, prep="As listed", extra=None):
    r = {"id": id_, "name": name, "category": category,
         "preparations": [{"method": prep, "basis": prep, "yield": None, "retention": {}, "evidenceId": evidence}],
         "nutrients": nutrients,
         "provenance": {k: {"source": prov_src, "evidenceId": evidence, "unit": units[k], "amountPer100g": v} for k, v in nutrients.items()},
         "source": {"name": prov_src, "official": origin["measured"]}, "origin": origin}
    if extra: r.update(extra)
    return r

UNITS = {k: u for k, (_, u) in USDA.items()}
foods = []

def usda_foods(path, key, dtype, keep):
    data = json.load(open(path))[key]
    for f in data:
        if f["fdcId"] in canon_fdc or not keep(f): continue
        by = {}
        for n in f["foodNutrients"]:
            nid = n.get("nutrient", {}).get("id"); amt = n.get("amount")
            if amt is None: continue
            for k, (ids, _) in USDA.items():
                if nid in ids and k not in by: by[k] = round(float(amt), 4)
        if not all(k in by for k in REQUIRED): continue
        cat = f.get("foodCategory", {}).get("description", "USDA food")
        foods.append(rec(f"usda-{f['fdcId']}", f["description"], cat, by, "USDA FoodData Central", f"fdc:{f['fdcId']}", UNITS,
            {"region": "US", "country": "United States", "type": "whole", "measured": True, "label": f"USDA {dtype}", "greek": bool(GREEK.search(f['description']))},
            extra={"fdcId": f["fdcId"], "dataType": dtype}))

WHOLE = {"Vegetables and Vegetable Products", "Fruits and Fruit Juices", "Legumes and Legume Products", "Nut and Seed Products",
         "Finfish and Shellfish Products", "Poultry Products", "Beef Products", "Pork Products", "Lamb, Veal, and Game Products",
         "Dairy and Egg Products", "Cereal Grains and Pasta", "Spices and Herbs", "Fats and Oils"}
usda_foods(f"{SRC}/FoodData_Central_foundation_food_json_2025-04-24.json", "FoundationFoods", "Foundation", lambda f: True)
usda_foods(f"{SRC}/FoodData_Central_sr_legacy_food_json_2018-04.json", "SRLegacyFoods", "SR Legacy",
    lambda f: f.get("foodCategory", {}).get("description") in WHOLE and f["description"].count(",") <= 3
              and not re.search(r"[A-Z]{4,}|babyfood|infant", f["description"]))

# CIQUAL
import pandas as pd
CIQ = {"energy": ("Energy, Regulation EU No 1169/2011 (kcal/100g)", "kcal"), "protein": ("Protein (g/100g)", "g"),
       "fat": ("Fat (g/100g)", "g"), "carbohydrate": ("Carbohydrate (g/100g)", "g"), "fiber": ("Fibres (g/100g)", "g"),
       "calcium": ("Calcium (mg/100g)", "mg"), "iron_total": ("Iron (mg/100g)", "mg"), "potassium": ("Potassium (mg/100g)", "mg"),
       "zinc": ("Zinc (mg/100g)", "mg"), "vitamin_c": ("Vitamin C (mg/100g)", "mg"),
       "thiamine": ("Vitamin B1 or Thiamin (mg/100g)", "mg"), "vitamin_b12_food": ("Vitamin B12 (µg/100g)", "µg")}

def ciq_val(v):
    if v is None or (isinstance(v, float) and v != v): return None
    s = str(v).strip().replace(",", ".")
    if s in ("-", ""): return None
    if s.lower() == "traces": return 0.0
    if s.startswith("<"): return None  # below detection limit: not reported, never guessed
    try: return round(float(s), 4)
    except ValueError: return None

df = pd.read_pickle(f"{SRC}/ciq.pkl")
for _, row in df.iterrows():
    grp = str(row["alim_grp_nom_eng"])
    if grp in ("baby food", "nan"): continue
    by = {}
    for k, (col, _) in CIQ.items():
        v = ciq_val(row[col])
        if v is not None: by[k] = v
    if not all(k in by for k in REQUIRED): continue
    name = str(row["alim_nom_eng"]).strip()
    sub = str(row["alim_ssgrp_nom_eng"]).strip()
    cat = (sub if sub != "nan" and sub != "-" else grp).capitalize()
    code = int(row["alim_code"])
    foods.append(rec(f"ciqual-{code}", name, cat, by, "ANSES-CIQUAL 2020", f"ciqual:{code}", UNITS,
        {"region": "EU", "country": "France", "type": "dish" if grp == "starters and dishes" else "whole", "measured": True,
         "label": "CIQUAL 2020", "greek": bool(GREEK.search(name))}))

# Open Food Facts (label data, g -> unit)
OFF = {"energy": ("energy-kcal_100g", 1), "protein": ("proteins_100g", 1), "fat": ("fat_100g", 1), "carbohydrate": ("carbohydrates_100g", 1),
       "fiber": ("fiber_100g", 1), "calcium": ("calcium_100g", 1000), "iron_total": ("iron_100g", 1000), "potassium": ("potassium_100g", 1000),
       "zinc": ("zinc_100g", 1000), "vitamin_c": ("vitamin-c_100g", 1000), "thiamine": ("vitamin-b1_100g", 1000), "vitamin_b12_food": ("vitamin-b12_100g", 1e6)}
seen = set()
for p in sorted(glob.glob(f"{SRC}/o*.json")):
    try: prods = json.load(open(p))["products"]
    except Exception: continue
    for pr in prods:
        code = pr.get("code"); name = (pr.get("product_name") or pr.get("product_name_el") or "").strip()
        if not code or not name or code in seen: continue
        n = pr.get("nutriments", {}); by = {}
        for k, (col, mult) in OFF.items():
            v = n.get(col)
            if isinstance(v, (int, float)): by[k] = round(v * mult, 4)
        if not all(k in by for k in REQUIRED): continue
        seen.add(code)
        brand = (pr.get("brands") or "").split(",")[0].strip()
        foods.append(rec(f"off-{code}", f"{name}{' · ' + brand if brand else ''}", "Branded products", by, "Open Food Facts (label)", f"off:{code}", UNITS,
            {"region": "GR", "country": "Greece", "type": "branded", "measured": False, "label": "Label data", "greek": True}))

out = {"schemaVersion": 1, "generated": "2026-10-17",
       "licences": {"USDA FoodData Central": "Public domain (CC0)", "ANSES-CIQUAL 2020": "Etalab Open Licence 2.0 — ANSES, Ciqual French food composition table",
                    "Open Food Facts": "Open Database License (ODbL) — label values entered by contributors"},
       "units": UNITS,
       # compact rows, expanded by app.js: [id, name, category, preparation, nutrients, source, region, country, type, measured, label, greek, fdcId]
       "rows": [[f["id"], f["name"], f["category"], f["preparations"][0]["method"], f["nutrients"], f["source"]["name"],
                 f["origin"]["region"], f["origin"]["country"], f["origin"]["type"], int(f["origin"]["measured"]), f["origin"]["label"],
                 int(f["origin"]["greek"]), f.get("fdcId")] for f in foods]}
json.dump(out, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
from collections import Counter
print(len(foods), Counter(f["origin"]["label"] for f in foods), sum(f["origin"]["greek"] for f in foods), os.path.getsize(OUT))
