// Maps product slugs to bundled illustrative packshots.
// A real retailer image on the product record always wins over these.

const modules = import.meta.glob("../assets/products/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function asset(name: string): string {
  const entry = Object.entries(modules).find(([path]) =>
    path.endsWith(`/${name}.png`),
  );
  return entry ? entry[1] : "";
}

const SLUG_TO_ASSET: Record<string, string> = {
  "bulksupplements-creatine-1kg": "bulksupplements-creatine",
  "cgn-lactobif-30b": "cgn-lactobif",
  "cgn-omega-800": "cgn-omega800",
  "cgn-vitamin-d3-5000": "cgn-d3-5000",
  "doctors-best-magnesium-lysinate-glycinate": "doctors-best-magnesium",
  "doctors-best-meriva-500": "doctors-best-curcumin",
  "garden-of-life-collagen-560": "gol-collagen",
  "garden-of-life-probiotic-50b": "gol-probiotics",
  "jarrow-ksm66-ashwagandha": "jarrow-ksm66",
  "jarrow-methyl-b12-1000": "jarrow-b12",
  "jarrow-mk7-90": "jarrow-mk7",
  "life-extension-neuro-mag-threonate": "life-extension-neuro-mag",
  "nordic-naturals-ultimate-omega": "nordic-ultimate-omega",
  "now-foods-c1000-rosehips": "now-c1000",
  "now-foods-calcium-citrate": "now-calcium",
  "now-foods-magnesium-citrate": "now-magnesium-citrate",
  "now-foods-vitamin-d3-5000": "now-d3-5000",
  "now-foods-zinc-picolinate-50": "now-zinc",
  "nutricost-algal-dha": "nutricost-algal-dha",
  "nutricost-creatine-500": "nutricost-creatine",
  "nutricost-ksm66-600": "nutricost-ksm66",
  "optimum-nutrition-creatine-600": "on-creatine",
  "pure-encapsulations-magnesium-glycinate": "pure-magnesium-glycinate",
  "seeking-health-magnesium-malate": "seeking-magnesium-malate",
  "solgar-calcium-citrate-d3": "solgar-calcium-d3",
  "solgar-gentle-iron-25": "solgar-gentle-iron",
  "solgar-methylcobalamin-1000": "solgar-methyl-b12",
  "solgar-vitamin-c-1000": "solgar-vitamin-c",
  "solgar-vitamin-d3-4000": "solgar-vitamin-d3",
  "solgar-zinc-picolinate-22": "solgar-zinc",
  "sports-research-collagen-454": "sports-research-collagen",
  "sports-research-k2-mk7": "sports-research-k2",
  "sports-research-omega3-triple": "sports-research-omega3",
  "thorne-basic-nutrients-2day": "thorne-basic-nutrients",
  "thorne-iron-bisglycinate-25": "thorne-iron",
  "thorne-magnesium-bisglycinate": "thorne-magnesium",
  "thorne-meriva-500": "thorne-meriva",
  "thorne-zinc-bisglycinate-15": "thorne-zinc",
};

export function fallbackProductImage(slug: string): string {
  const name = SLUG_TO_ASSET[slug];
  return name ? asset(name) : "";
}

export function productImageUrl(product: {
  slug: string;
  image_url?: string | null;
}): string {
  return product.image_url?.trim() || fallbackProductImage(product.slug);
}

export function isIllustrativeImage(product: {
  slug: string;
  image_url?: string | null;
}): boolean {
  return !product.image_url?.trim() && !!fallbackProductImage(product.slug);
}
