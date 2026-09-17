import { chemicalForm, elementalPerServing, primaryIngredient, type Product } from "@/lib/suppcheck";

/**
 * The five staple categories that get their own comparison landing page.
 * Products are matched from existing catalogue data — no schema change.
 */
export type StaplePath =
  | "/compare/creatine-monohydrate"
  | "/compare/whey-protein-isolate"
  | "/compare/magnesium-glycinate-malate"
  | "/compare/vitamin-d3-k2"
  | "/compare/omega-3-fish-oil";

export type Staple = {
  path: StaplePath;
  /** Short label for navigation strips. */
  nav: string;
  h1: string;
  title: string;
  description: string;
  /** Two-sentence buying guide shown above the table. */
  guide: string;
  doseLabel: string;
  dose: (product: Product) => string;
  matches: (product: Product) => boolean;
};

function text(product: Product): string {
  return `${product.category} ${product.name} ${product.category_path.join(" ")} ${chemicalForm(product)}`.toLowerCase();
}

function elementalLabel(product: Product, nutrient: string): string {
  const mg = elementalPerServing(product);
  if (!Number.isFinite(mg) || mg <= 0) return "—";
  return `${Math.round(mg)} mg ${nutrient}`;
}

function gramsLabel(product: Product, nutrient: string): string {
  const mg = elementalPerServing(product);
  if (!Number.isFinite(mg) || mg <= 0) return product.serving_size || "—";
  return `${(mg / 1000).toFixed(mg >= 1000 ? 1 : 2)} g ${nutrient}`;
}

export const STAPLES: Staple[] = [
  {
    path: "/compare/creatine-monohydrate",
    nav: "Creatine",
    h1: "Compare creatine monohydrate and Creapure prices",
    title: "Compare Creatine Monohydrate & Creapure Prices in Europe | i-Supplement",
    description:
      "Compare creatine monohydrate and Creapure powders by grams per serving, cost per 100 g and live prices at iHerb, Amazon, Myprotein and Bulk.",
    guide:
      "Creatine monohydrate is the only form with a deep evidence base, so the real decision is purity and price per gram rather than a fancier-sounding form. Look for Creapure-branded or micronised monohydrate, a 3–5 g daily serving, and judge value on cost per 100 g instead of the sticker price of the tub.",
    doseLabel: "Creatine per serving",
    dose: (p) => gramsLabel(p, "creatine"),
    matches: (p) => /creatine|creapure/.test(text(p)),
  },
  {
    path: "/compare/whey-protein-isolate",
    nav: "Whey isolate",
    h1: "Compare whey protein isolate prices",
    title: "Compare Whey Protein Isolate Prices in Europe | i-Supplement",
    description:
      "Compare whey protein isolate powders by protein per serving, cost per 100 g and live prices at Myprotein, Bulk, iHerb and Amazon.",
    guide:
      "Isolate is filtered further than concentrate, so it carries more protein and less lactose and fat per scoop — check the grams of protein per serving, not just the scoop size. Divide the price by the protein you actually get: a cheaper tub with 70% protein usually costs more per real gram than a 90% isolate.",
    doseLabel: "Protein per serving",
    dose: (p) => gramsLabel(p, "protein"),
    matches: (p) => /whey|isolate|protein powder/.test(text(p)),
  },
  {
    path: "/compare/magnesium-glycinate-malate",
    nav: "Magnesium",
    h1: "Compare magnesium glycinate and malate prices",
    title: "Compare Magnesium Glycinate & Malate Prices in Europe | i-Supplement",
    description:
      "Compare magnesium glycinate, bisglycinate and malate by elemental magnesium per serving, cost per serving and live retailer prices.",
    guide:
      "Labels often quote the weight of the whole magnesium compound, so the number that matters is the elemental magnesium per serving — glycinate and malate deliver less elemental weight per capsule than oxide but are far better absorbed and gentler on the gut. Compare elemental milligrams alongside cost per serving, and expect to take two to four capsules to reach a typical 300–400 mg daily intake.",
    doseLabel: "Elemental magnesium",
    dose: (p) => elementalLabel(p, "elemental"),
    matches: (p) => /magnesium/.test(text(p)),
  },
  {
    path: "/compare/vitamin-d3-k2",
    nav: "Vitamin D3 + K2",
    h1: "Compare vitamin D3 and K2 (MK-7) prices",
    title: "Compare Vitamin D3 + K2 (MK-7) Prices in Europe | i-Supplement",
    description:
      "Compare vitamin D3 and K2 MK-7 supplements by IU and microgram dose per serving, cost per serving and live retailer prices.",
    guide:
      "Vitamin D3 is commonly paired with K2 as MK-7, and the two figures to read are the IU of D3 and the micrograms of MK-7 per serving. D3 is fat-soluble, so a softgel or oil-based capsule taken with a meal is the practical choice, and higher IU is not automatically better value once you compare cost per serving.",
    doseLabel: "Dose per serving",
    dose: (p) => {
      const ing = primaryIngredient(p);
      const mg = elementalPerServing(p);
      if (!ing || !Number.isFinite(mg) || mg <= 0) return p.serving_size || "—";
      const mcg = mg * 1000;
      return /d3|cholecalciferol/.test(`${ing.ingredients.name} ${p.name}`.toLowerCase())
        ? `${Math.round(mcg * 40)} IU D3 (${Math.round(mcg)} mcg)`
        : `${Math.round(mcg)} mcg ${ing.ingredients.chemical_form || "K2"}`;
    },
    matches: (p) => /vitamin d|cholecalciferol|vitamin k|mk-7|menaquinone/.test(text(p)),
  },
  {
    path: "/compare/omega-3-fish-oil",
    nav: "Omega-3",
    h1: "Compare high EPA/DHA omega-3 fish oil prices",
    title: "Compare Omega-3 Fish Oil (High EPA/DHA) Prices in Europe | i-Supplement",
    description:
      "Compare omega-3 fish and algal oils by combined EPA and DHA per serving, cost per serving and live prices at iHerb, Amazon and more.",
    guide:
      "The headline “1000 mg fish oil” is the weight of the oil, not the active fraction — what counts is the combined EPA and DHA per serving, which is often only a third of it. Compare concentrated triglyceride-form oils on cost per gram of EPA+DHA, and check for a published purity or oxidation test if you are sensitive to fishy aftertaste.",
    doseLabel: "EPA + DHA per serving",
    dose: (p) => elementalLabel(p, "EPA + DHA"),
    matches: (p) => /omega|fish oil|epa|dha|krill|algal/.test(text(p)),
  },
];

export function stapleByPath(path: StaplePath): Staple {
  return STAPLES.find((staple) => staple.path === path)!;
}
