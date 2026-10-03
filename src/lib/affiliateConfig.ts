/**
 * Retailer affiliate identifiers.
 *
 * Every value ships with a demo default so all retailer buttons, redirects and
 * cart handoffs keep working before the programmes approve us. Set the matching
 * environment variable to go live with a real identifier — no code change.
 *
 * Read only on the server (redirect / cart routes and the admin status view).
 */

export type AffiliateProgrammeKey =
  | "AMAZON_TAG_US"
  | "AMAZON_TAG_EU"
  | "AMAZON_TAG_UK"
  | "AMAZON_TAG_BR"
  | "AWIN_MERCHANT_ID"
  | "AWIN_PUBLISHER_ID"
  | "LINKWISE_ID"
  | "IHERB_RCODE"
  | "MYPROTEIN_REF"
  | "BULKSUPPLEMENTS_REF";

export type AffiliateProgramme = {
  key: AffiliateProgrammeKey;
  retailer: string;
  label: string;
  /** Demo value used until the real identifier is configured. */
  demo: string;
};

export const AFFILIATE_PROGRAMMES: AffiliateProgramme[] = [
  { key: "AMAZON_TAG_US", retailer: "Amazon", label: "Associates tag — US / global storefronts", demo: "suppcheck-20" },
  { key: "AMAZON_TAG_EU", retailer: "Amazon", label: "Associates tag — EU storefronts", demo: "suppcheck-21" },
  { key: "AMAZON_TAG_UK", retailer: "Amazon", label: "Associates tag — UK storefront", demo: "suppcheck-21" },
  { key: "AMAZON_TAG_BR", retailer: "Amazon", label: "Associates tag — Brazil storefront", demo: "suppcheck-20" },
  { key: "AWIN_MERCHANT_ID", retailer: "Awin network", label: "Advertiser (merchant) ID", demo: "12345" },
  { key: "AWIN_PUBLISHER_ID", retailer: "Awin network", label: "Publisher ID", demo: "suppcheck" },
  { key: "LINKWISE_ID", retailer: "Linkwise network", label: "Publisher ID", demo: "suppcheck-gr" },
  { key: "IHERB_RCODE", retailer: "iHerb", label: "Rewards referral code", demo: "NBO7379" },
  { key: "MYPROTEIN_REF", retailer: "Myprotein", label: "Referral parameter", demo: "suppcheck" },
  { key: "BULKSUPPLEMENTS_REF", retailer: "Bulk Supplements", label: "Referral parameter", demo: "suppcheck" },
];

function programme(key: AffiliateProgrammeKey): AffiliateProgramme {
  return AFFILIATE_PROGRAMMES.find((p) => p.key === key)!;
}

/** Settings-table prefix used for saved affiliate identifiers. */
export const AFFILIATE_SETTING_PREFIX = "affiliate.";

let overrides: Partial<Record<AffiliateProgrammeKey, string>> = {};
let overridesLoadedAt = 0;
const OVERRIDES_TTL_MS = 60_000;

export async function loadAffiliateOverrides(force = false): Promise<void> {
  if (!force && Date.now() - overridesLoadedAt < OVERRIDES_TTL_MS) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("app_settings")
      .select("key, value")
      .like("key", `${AFFILIATE_SETTING_PREFIX}%`);
    const next: Partial<Record<AffiliateProgrammeKey, string>> = {};
    for (const row of data ?? []) {
      const key = row.key.slice(AFFILIATE_SETTING_PREFIX.length) as AffiliateProgrammeKey;
      if (row.value && row.value.trim()) next[key] = row.value.trim();
    }
    overrides = next;
    overridesLoadedAt = Date.now();
  } catch {
    // Keep whatever we already have; demo/env values still produce working links.
  }
}

export function affiliateId(key: AffiliateProgrammeKey): string {
  const saved = overrides[key];
  if (saved && saved.trim()) return saved.trim();
  const configured = process.env[key];
  return configured && configured.trim() ? configured.trim() : programme(key).demo;
}

export function isDemoIdentifier(key: AffiliateProgrammeKey): boolean {
  const value = affiliateId(key);
  return value === programme(key).demo;
}

export function amazonTagFor(country: string): string {
  switch (country.toUpperCase()) {
    case "GB":
      return affiliateId("AMAZON_TAG_UK");
    case "DE":
    case "FR":
    case "IT":
    case "ES":
    case "NL":
      return affiliateId("AMAZON_TAG_EU");
    case "BR":
      return affiliateId("AMAZON_TAG_BR");
    default:
      return affiliateId("AMAZON_TAG_US");
  }
}
