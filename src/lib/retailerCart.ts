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

export type MultiCart = {
  /** Grouped handoff URL, or null when the retailer has no verified multi-item cart. */
  url: string | null;
  /** Items the grouped cart will carry. */
  included: BasketItem[];
  /** Items that must be opened individually (missing retailer product ID). */
  excluded: BasketItem[];
};

/**
 * Amazon supports a verified multi-item cart handoff for every item that has a
 * retailer product ID (ASIN). Items without one are handed back so the caller can
 * still offer their individual links. Other retailers publish no supported
 * multi-item cart URL, so they fall back to individual links entirely.
 */
export function multiCart(items: BasketItem[], market: Market, tracking = false): MultiCart {
  const first = items[0];
  if (!first) return { url: null, included: [], excluded: [] };
  const kind = retailerKind(first.merchantName, first.affiliateNetwork);
  if (kind !== "amazon" || items.some((item) => retailerKind(item.merchantName, item.affiliateNetwork) !== kind)) {
    return { url: null, included: [], excluded: items };
  }

  const included = items.filter((item) => item.retailerProductId.trim());
  const excluded = items.filter((item) => !item.retailerProductId.trim());
  if (!included.length) return { url: null, included: [], excluded: items };

  const params = new URLSearchParams({
    offers: included.map((item) => item.offerId).join(","),
    quantities: included.map((item) => String(Math.max(1, item.quantity))).join(","),
    country: market.country,
    currency: market.currency,
  });
  if (!tracking) params.set("nt", "1");
  return { url: `/api/affiliate/cart?${params.toString()}`, included, excluded };
}

/** Backwards-compatible helper: grouped URL only when it carries every item. */
export function multiCartUrl(items: BasketItem[], market: Market, tracking = false): string | null {
  const cart = multiCart(items, market, tracking);
  return cart.excluded.length ? null : cart.url;
}
