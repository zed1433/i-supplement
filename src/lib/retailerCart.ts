import type { BasketItem } from "@/lib/basket";
import type { Market } from "@/lib/market";

export type RetailerKind = "amazon" | "iherb" | "myprotein" | "bulk" | "other";

export function retailerKind(name: string, network = ""): RetailerKind {
  const value = `${name} ${network}`.toLowerCase();
  if (value.includes("amazon")) return "amazon";
  if (value.includes("iherb")) return "iherb";
  if (value.includes("myprotein")) return "myprotein";
  if (value.includes("bulk")) return "bulk";
  return "other";
}

export function retailerGroupKey(item: Pick<BasketItem, "merchantName" | "affiliateNetwork">): string {
  const kind = retailerKind(item.merchantName, item.affiliateNetwork);
  return kind === "other" ? item.merchantName.trim().toLowerCase() : kind;
}

/** Returns a grouped handoff only when every item has the retailer identifier it requires. */
export function multiCartUrl(items: BasketItem[], market: Market, tracking = false): string | null {
  if (!items.length || items.some((item) => !item.retailerProductId.trim())) return null;
  const first = items[0];
  if (!first) return null;
  const kind = retailerKind(first.merchantName, first.affiliateNetwork);
  if (items.some((item) => retailerKind(item.merchantName, item.affiliateNetwork) !== kind)) return null;
  if (kind === "amazon") {
    const params = new URLSearchParams({
      offers: items.map((item) => item.offerId).join(","),
      quantities: items.map((item) => String(Math.max(1, item.quantity))).join(","),
      country: market.country,
      currency: market.currency,
    });
    if (!tracking) params.set("nt", "1");
    return `/api/affiliate/cart?${params.toString()}`;
  }
  // iHerb, Myprotein and Bulk require account-specific rewards/campaign configuration.
  // Individual verified links remain the safe handoff until those values are configured.
  return null;
}