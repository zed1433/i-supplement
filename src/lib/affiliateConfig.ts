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
  { key: "IHERB_RCODE", retailer: "iHerb", label: "Rewards referral code", demo: "isupplement" },
  { key: "MYPROTEIN_REF", retailer: "Myprotein", label: "Referral parameter", demo: "suppcheck" },
  { key: "BULKSUPPLEMENTS_REF", retailer: "Bulk Supplements", label: "Referral parameter", demo: "suppcheck" },
];

function programme(key: AffiliateProgrammeKey): AffiliateProgramme {
  return AFFILIATE_PROGRAMMES.find((p) => p.key === key)!;
}

/** Configured identifier, falling back to the demo value. Server-side only. */
export function affiliateId(key: AffiliateProgrammeKey): string {
  const configured = process.env[key];
  return configured && configured.trim() ? configured.trim() : programme(key).demo;
}

/** True while the programme still runs on its demo identifier. */
export function isDemoIdentifier(key: AffiliateProgrammeKey): boolean {
  const configured = process.env[key];
  return !configured || !configured.trim() || configured.trim() === programme(key).demo;
}

/** Amazon Associates tag for a shopper country. */
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
