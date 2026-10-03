import { parseCsv } from "@/lib/csv";

export type CatalogGroup = "Vitamins & Minerals" | "Performance & Protein" | "Nootropics & Focus" | "Longevity";

export type ImportRow = {
  brand: string;
  product_name: string;
  category: string;
  form: string;
  serving_size: string;
  pricing_basis: "per_serving" | "bulk_powder" | null;
  total_servings: number | null;
  net_weight_grams: number | null;
  serving_weight_grams: number | null;
  catalog_group: CatalogGroup | null;
  merchant_name: string;
  country_flag: string;
  affiliate_network: string;
  price: number;
  currency: string;
  url: string;
  retailer_product_id: string;
  image_url: string;
  certifications: string[];
  verified: boolean;
};

export const EXPECTED = [
  "brand", "product_name", "category", "form", "serving_size", "pricing_basis", "total_servings",
  "net_weight_grams", "serving_weight_grams", "catalog_group", "merchant_name", "country_flag",
  "affiliate_network", "price", "currency", "url", "retailer_product_id", "image_url", "certifications",
];

/** Alternative header names (e.g. iHerb exports) → canonical field. */
const ALIASES: Record<string, string> = {
  title: "product_name", name: "product_name", product: "product_name",
  product_url: "url", link: "url", affiliate_url: "url",
  item_id: "retailer_product_id", asin: "retailer_product_id",
  portion_size: "serving_size", servings: "total_servings",
  source: "merchant_name", merchant: "merchant_name", retailer: "merchant_name",
  image: "image_url", image_link: "image_url",
};

const CATEGORY_RULES: [RegExp, string, CatalogGroup][] = [
  [/creatine/i, "Creatine", "Performance & Protein"],
  [/whey|protein/i, "Protein", "Performance & Protein"],
  [/collagen/i, "Collagen", "Performance & Protein"],
  [/bcaa|amino|glutamine|beta-alanine|citrulline|arginine/i, "Amino Acids", "Performance & Protein"],
  [/multi ?vitamin|multiple|one daily|daily multi/i, "Multivitamin", "Vitamins & Minerals"],
  [/vitamin a\b|retinol|beta[- ]carotene/i, "Vitamin A", "Vitamins & Minerals"],
  [/b-?complex/i, "Vitamin B Complex", "Vitamins & Minerals"],
  [/b-?12|methylcobalamin|cyanocobalamin/i, "Vitamin B12", "Vitamins & Minerals"],
  [/folate|folic|b-?9/i, "Vitamin B9 (Folate)", "Vitamins & Minerals"],
  [/biotin/i, "Vitamin B7 (Biotin)", "Vitamins & Minerals"],
  [/b-?6|p-5-p|pyridox/i, "Vitamin B6 (P-5-P)", "Vitamins & Minerals"],
  [/niacin|b-?3\b/i, "Vitamin B3 (Niacin)", "Vitamins & Minerals"],
  [/riboflavin|b-?2\b/i, "Vitamin B2 (Riboflavin)", "Vitamins & Minerals"],
  [/thiamin|benfotiamine|b-?1\b/i, "Vitamin B1 (Thiamine)", "Vitamins & Minerals"],
  [/vitamin c|ascorb/i, "Vitamin C", "Vitamins & Minerals"],
  [/d3|vitamin d/i, "Vitamin D3", "Vitamins & Minerals"],
  [/vitamin e|tocopherol/i, "Vitamin E", "Vitamins & Minerals"],
  [/k2|vitamin k/i, "Vitamin K", "Vitamins & Minerals"],
  [/magnesium/i, "Magnesium", "Vitamins & Minerals"],
  [/zinc/i, "Zinc", "Vitamins & Minerals"],
  [/iron\b|ferrous/i, "Iron", "Vitamins & Minerals"],
  [/calcium/i, "Calcium", "Vitamins & Minerals"],
  [/selenium/i, "Selenium", "Vitamins & Minerals"],
  [/iodine|kelp/i, "Iodine", "Vitamins & Minerals"],
  [/potassium/i, "Potassium", "Vitamins & Minerals"],
  [/omega|fish oil|krill|dha|epa/i, "Omega-3", "Longevity"],
  [/probiotic|lactobac|bifido/i, "Probiotics", "Longevity"],
  [/curcumin|turmeric/i, "Curcumin", "Longevity"],
  [/coq10|ubiquinol/i, "CoQ10", "Longevity"],
  [/nmn|resveratrol|nad/i, "NAD+ & Resveratrol", "Longevity"],
  [/ashwagandha/i, "Ashwagandha", "Longevity"],
  [/theanine|ginkgo|bacopa|lion'?s mane|rhodiola|gaba|melatonin|5-htp/i, "Nootropics", "Nootropics & Focus"],
];

export function guessCategory(title: string): { category: string; group: CatalogGroup | null } {
  for (const [re, category, group] of CATEGORY_RULES) if (re.test(title)) return { category, group };
  return { category: "Other", group: null };
}

export function guessForm(title: string): string {
  const t = title.toLowerCase();
  if (/softgel/.test(t)) return "Softgels";
  if (/gumm/.test(t)) return "Gummies";
  if (/tablet|caplet|lozenge/.test(t)) return "Tablets";
  if (/powder|\b\d+(\.\d+)?\s*(g|kg|lb|oz)\b(?!.*caps)/.test(t)) return "Powder";
  if (/liquid|drops|\bml\b|fl oz|spray/.test(t)) return "Liquid";
  return "Capsules";
}

/** "Nutricost, L-Theanine, 200 mg, 120 Capsules" → "L-Theanine, 200 mg" */
export function cleanTitle(title: string, brand: string): string {
  let parts = title.split(",").map((p) => p.trim()).filter(Boolean);
  if (brand && parts[0]?.toLowerCase() === brand.toLowerCase()) parts = parts.slice(1);
  if (parts.length > 1 && /^\d[\d.,]*\s*(capsules?|veg(gie|etarian)? ?caps|softgels?|tablets?|gummies|count|lozenges)/i.test(parts.at(-1) ?? ""))
    parts = parts.slice(0, -1);
  return parts.join(", ") || title;
}

function weightGrams(title: string): number | null {
  const m = title.match(/(\d+(?:\.\d+)?)\s*(kg|g|lb|lbs|oz)\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2]!.toLowerCase();
  return unit === "kg" ? n * 1000 : unit === "g" ? n : unit.startsWith("lb") ? n * 453.6 : n * 28.35;
}

const RCODE = "NBO7379";
function withRcode(url: string): string {
  if (!/iherb\.com/i.test(url) || /[?&]rcode=/i.test(url)) return url;
  return url + (url.includes("?") ? "&" : "?") + `rcode=${RCODE}`;
}

export type ParseResult = { rows: ImportRow[]; recognised: string[]; ignored: string[]; skipped: string[] };

export function parseImport(text: string): ParseResult {
  const table = parseCsv(text.replace(/^\ufeff/, ""));
  if (table.length < 2) return { rows: [], recognised: [], ignored: [], skipped: [] };
  const raw = (table[0] ?? []).map((h) => h.trim().toLowerCase().replace(/^\ufeff/, "").replace(/\s+/g, "_"));
  const header = raw.map((h) => (EXPECTED.includes(h) ? h : ALIASES[h] ?? ""));
  const recognised = raw.filter((_, i) => header[i]);
  const ignored = raw.filter((_, i) => !header[i]);
  const rows: ImportRow[] = [];
  const skipped: string[] = [];

  table.slice(1).forEach((cells, idx) => {
    const get = (k: string) => {
      const i = header.indexOf(k);
      return i >= 0 ? (cells[i] ?? "").trim() : "";
    };
    const rawTitle = get("product_name");
    const brand = get("brand");
    const url = get("url");
    const price = Number(get("price").replace(",", "."));
    if (!rawTitle || !brand || !/^https?:\/\//.test(url) || !(price > 0)) {
      skipped.push(`Row ${idx + 2}: ${rawTitle || "(no name)"} — missing ${!rawTitle ? "name" : !brand ? "brand" : !url ? "link" : "price"}`);
      return;
    }
    const merchant = get("merchant_name") || "Unknown";
    const isIherb = /iherb/i.test(merchant) || /iherb\.com/i.test(url);
    const guess = guessCategory(rawTitle);
    const form = get("form") || guessForm(rawTitle);
    const net = Number(get("net_weight_grams")) || (form === "Powder" ? weightGrams(rawTitle) : null);
    const group = get("catalog_group");
    rows.push({
      brand: brand.slice(0, 120),
      product_name: cleanTitle(rawTitle, brand).slice(0, 200),
      category: get("category") || guess.category,
      form,
      serving_size: get("serving_size").slice(0, 60),
      pricing_basis: get("pricing_basis") === "bulk_powder" || (form === "Powder" && net) ? "bulk_powder" : get("pricing_basis") === "per_serving" || Number(get("total_servings")) ? "per_serving" : null,
      total_servings: Number(get("total_servings")) || null,
      net_weight_grams: net,
      serving_weight_grams: Number(get("serving_weight_grams")) || null,
      catalog_group: (["Vitamins & Minerals", "Performance & Protein", "Nootropics & Focus", "Longevity"].includes(group) ? group : guess.group) as CatalogGroup | null,
      merchant_name: isIherb ? "iHerb" : merchant,
      country_flag: get("country_flag"),
      affiliate_network: isIherb ? "direct" : get("affiliate_network") || "direct",
      price,
      currency: get("currency") || "EUR",
      url: withRcode(url),
      retailer_product_id: get("retailer_product_id").slice(0, 120),
      image_url: get("image_url"),
      certifications: get("certifications").split(",").map((c) => c.trim()).filter(Boolean)
        .filter((c, i, a) => a.findIndex((x) => x.toLowerCase().replace(/-/g, " ") === c.toLowerCase().replace(/-/g, " ")) === i).slice(0, 30),
      verified: isIherb,
    });
  });
  return { rows, recognised, ignored, skipped };
}
