"""
Overlays published composition values (scripts/data/published/*.csv) onto public/bio-calculator/food-profiles.json.
Never overwrites a value measured by USDA/CIQUAL for that exact food (status M from the source); replaces unknowns (U)
and earlier estimates (E). Each CSV row: name_regex, mg_per_100g, basis (fresh|dry), status (M|E), source.
Dry-basis values are scaled to the food's own water content. Writes a corrections log next to the profiles.
Run after build-food-profiles.py: python3 scripts/apply-published-values.py
"""
import csv, json, os, re, glob
ROOT = os.path.join(os.path.dirname(__file__), "..")
BC = os.path.join(ROOT, "public/bio-calculator")
P = os.path.join(BC, "food-profiles.json")
prof = json.load(open(P))
names = {f"fdc-{f['fdcId']}": f["name"] for f in json.load(open(os.path.join(BC, "canonical-foods.json")))["foods"]}
names.update({r[0]: r[1] for r in json.load(open(os.path.join(BC, "extra-foods.json")))["rows"]})
keys = prof["keys"]; wi = keys.index("water")
log = []
for path in sorted(glob.glob(os.path.join(ROOT, "scripts/data/published/*.csv"))):
  key = os.path.splitext(os.path.basename(path))[0]
  ki = keys.index(key)
  for row in csv.DictReader(open(path)):
    rx = re.compile(row["name_regex"], re.I)
    ex = re.compile(row["exclude"], re.I) if row.get("exclude") else None
    only_u = row.get("mode") == "only_unknown"
    if row["source"] not in prof["refs"]: prof["refs"].append(row["source"])
    ref = prof["refs"].index(row["source"])
    for fid, f in prof["foods"].items():
      nm = names.get(fid, "")
      if not rx.search(nm) or (f["k"] == "animal" and key in ("phytate","oxalate","tannin")) or (ex and ex.search(nm)): continue
      st = f["s"][ki]
      if only_u and st != "U" and f["r"][ki] != ref: continue
      if st in ("M", "Z", "B") and f["r"][ki] != ref and not (st == "M" and f["r"][ki] >= 0 and "Noonan" in prof["refs"][f["r"][ki]]): continue
      val = float(row["mg_per_100g"])
      if row["basis"] == "dry":
        w = f["v"][wi]
        if w is None: continue
        val = val * (100 - w) / 100
      val = round(val, 2)
      log.append({"food": names[fid], "id": fid, "nutrient": key, "old": f["v"][ki], "oldStatus": st, "new": val, "status": row["status"], "source": row["source"]})
      f["v"][ki] = val; f["s"] = f["s"][:ki] + row["status"] + f["s"][ki+1:]; f["r"][ki] = ref
json.dump(prof, open(P, "w"), ensure_ascii=False, separators=(",", ":"))
json.dump(log, open(os.path.join(BC, "corrections.json"), "w"), ensure_ascii=False, indent=1)
print(len(log), "values applied")
for l in log: print(f"{l['food'][:55]:55} {l['nutrient']}: {l['old']} ({l['oldStatus']}) -> {l['new']} ({l['status']})")
