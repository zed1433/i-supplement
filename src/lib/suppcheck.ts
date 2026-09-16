import { supabase } from "@/integrations/supabase/client";

export type Brand = {
  id: string;
  name: string;
  country_of_origin: string;
  website_url: string;
};

export type Ingredient = {
  id: string;
  name: string;
  chemical_form: string;
  elemental_ratio: number;
  mechanism_of_action: string;
  target_benefits: string[];
  potential_side_effects: string[];
  contraindications: string[];
  upper_tolerable_limit: string;
};

export type ProductIngredient = {
  id: string;
  gross_amount_mg: number;
  elemental_amount_mg: number;
  percent_daily_value: number;
  bioavailability_score: string;
  ingredients: Ingredient;
};

export type MerchantOffer = {
  id: string;
  merchant_name: string;
  country_flag: string;
  affiliate_network: string;
  price: number;
  currency: string;
  shipping_cost: number;
  estimated_delivery: string;
  affiliate_target_url: string;
  retailer_product_id: string;
  link_verified: boolean;
  link_verified_at: string | null;
  in_stock: boolean;
  ships_to: string[];
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  image_source: string;
  category: string;
  category_path: string[];
  form: string;
  serving_size: string;
  primary_benefit: string;
  verified_advantages: string[];
  trade_offs: string[];
  excipients: string[];
  third_party_certifications: string[];
  brands: Brand;
  product_ingredients: ProductIngredient[];
  merchant_offers: MerchantOffer[];
};

const PRODUCT_SELECT = `
  id, name, slug, image_url, image_source, category, category_path, form, serving_size, primary_benefit,
  verified_advantages, trade_offs, excipients, third_party_certifications,
  brands ( id, name, country_of_origin, website_url ),
  product_ingredients (
    id, gross_amount_mg, elemental_amount_mg, percent_daily_value, bioavailability_score,
    ingredients (
      id, name, chemical_form, elemental_ratio, mechanism_of_action,
      target_benefits, potential_side_effects, contraindications, upper_tolerable_limit
    )
  ),
  merchant_offers (
    id, merchant_name, country_flag, affiliate_network, price, currency,
    shipping_cost, estimated_delivery, affiliate_target_url, retailer_product_id,
    link_verified, link_verified_at, in_stock, ships_to, updated_at
  )
`;

/** Abort a hung request instead of leaving the page on skeletons forever. */
const REQUEST_TIMEOUT_MS = 12_000;
function timeoutSignal(): AbortSignal {
  return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("name")
    .abortSignal(timeoutSignal());
  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .abortSignal(timeoutSignal())
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as Product | null;
}

export const productsQuery = {
  queryKey: ["suppcheck", "products"],
  queryFn: fetchProducts,
  staleTime: 60_000,
  retry: 2,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 4000),
};

export const productQuery = (slug: string) => ({
  queryKey: ["suppcheck", "product", slug],
  queryFn: () => fetchProductBySlug(slug),
  staleTime: 60_000,
  retry: 2,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 4000),
});

/* ---------- derived clinical metrics ---------- */

export function primaryIngredient(p: Product): ProductIngredient | undefined {
  return [...p.product_ingredients].sort(
    (a, b) => b.elemental_amount_mg - a.elemental_amount_mg,
  )[0];
}

export function elementalPerServing(p: Product): number {
  return p.product_ingredients.reduce((sum, pi) => sum + Number(pi.elemental_amount_mg), 0);
}

export function bestOffer(p: Product): MerchantOffer | undefined {
  const stocked = p.merchant_offers.filter((o) => o.in_stock);
  const pool = stocked.length ? stocked : p.merchant_offers;
  return [...pool].sort((a, b) => Number(a.price) - Number(b.price))[0];
}

/** Normalised cost per 100 mg elemental active, assuming a 30-serving container. */
export function costPer100mgElemental(p: Product, servingsPerContainer = 30): number | null {
  const offer = bestOffer(p);
  const elemental = elementalPerServing(p);
  if (!offer || !elemental) return null;
  const totalElementalMg = elemental * servingsPerContainer;
  return (Number(offer.price) / totalElementalMg) * 100;
}

export function chemicalForm(p: Product): string {
  return primaryIngredient(p)?.ingredients.chemical_form ?? "—";
}

export const RISKY_EXCIPIENTS = [
  "magnesium stearate",
  "silicon dioxide",
  "silica",
  "artificial",
  "sucralose",
  "titanium dioxide",
];

export function excipientFlags(p: Product): string[] {
  return p.excipients.filter((e) =>
    RISKY_EXCIPIENTS.some((r) => e.toLowerCase().includes(r)),
  );
}

export function formatPrice(value: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(Number(value));
}

/* ---------- affiliate compliance: price freshness ---------- */

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

export function isPriceStale(updatedAt?: string | null): boolean {
  if (!updatedAt) return true;
  return Date.now() - new Date(updatedAt).getTime() > STALE_AFTER_MS;
}

/** Compact freshness note for dense surfaces, e.g. "Price as of 15 Sep". */
export function priceAsOfShort(updatedAt?: string | null): string {
  if (!updatedAt) return "Price date unavailable — subject to change";
  const d = new Date(updatedAt);
  const label = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(d);
  return `Price as of ${label}${isPriceStale(updatedAt) ? " — may be out of date" : ""}`;
}

/** Full timestamp note required by retailer operating agreements. */
export function priceAsOfLong(updatedAt?: string | null): string {
  if (!updatedAt) return "Price date unavailable — subject to change";
  const d = new Date(updatedAt);
  const label = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(d);
  return `Price as of ${label} — subject to change${
    isPriceStale(updatedAt) ? "; may be out of date" : ""
  }`;
}

export const AFFILIATE_DISCLOSURE =
  "We may earn a commission when you buy through links on this site. Prices and availability are subject to change.";

export const FORM_FILTERS = [
  "Bisglycinate",
  "Glycinate",
  "Lysinate Glycinate (TRAACS)",
  "Malate",
  "L-Threonate",
  "Citrate",
  "Oxide",
  "Taurate",
];

export const CERT_FILTERS = [
  "NSF Certified for Sport",
  "Informed Choice",
  "USP Verified",
  "Non-GMO",
];

export const CERT_EXPLANATIONS: Record<string, string> = {
  "NSF Certified for Sport":
    "Every production lot is screened against 290+ substances banned in competitive sport, plus label-claim potency and heavy metal limits.",
  "Informed Choice":
    "Monthly blind retail sampling and banned-substance screening at an ISO 17025 laboratory.",
  "USP Verified":
    "United States Pharmacopeia audit of identity, potency, dissolution and contaminant limits against the USP monograph.",
  "Non-GMO":
    "Ingredients traced and tested to be free of genetically modified inputs above the 0.9% threshold.",
  None: "No independent third-party verification is published for this product.",
};
