import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MerchantOffer, Product } from "@/lib/suppcheck";

export type RegionCode = "ALL" | "GR" | "DE" | "EU" | "UK" | "US";

export const REGIONS: { code: RegionCode; label: string }[] = [
  { code: "GR", label: "Greece" },
  { code: "DE", label: "Germany" },
  { code: "EU", label: "Rest of the EU" },
  { code: "UK", label: "United Kingdom" },
  { code: "US", label: "United States" },
  { code: "ALL", label: "Show every shop" },
];

const EU_REGIONS: RegionCode[] = ["GR", "DE", "EU"];
const STORAGE_KEY = "isupplement.region";

/** Does this offer deliver to the shopper's region? */
export function offerShipsTo(offer: Pick<MerchantOffer, "ships_to">, region: RegionCode): boolean {
  if (region === "ALL") return true;
  const list = offer.ships_to ?? ["GLOBAL"];
  if (list.length === 0 || list.includes("GLOBAL")) return true;
  if (list.includes(region)) return true;
  if (list.includes("EU") && EU_REGIONS.includes(region)) return true;
  return false;
}

/** Product with only the offers that deliver to the region; null when none do. */
export function productForRegion(product: Product, region: RegionCode): Product | null {
  const offers = product.merchant_offers.filter((o) => offerShipsTo(o, region));
  if (!offers.length) return null;
  return { ...product, merchant_offers: offers };
}

export function productsForRegion(products: Product[], region: RegionCode): Product[] {
  return products
    .map((p) => productForRegion(p, region))
    .filter((p): p is Product => p !== null);
}

type Ctx = { region: RegionCode; setRegion: (r: RegionCode) => void; ready: boolean };
const RegionContext = createContext<Ctx>({ region: "ALL", setRegion: () => {}, ready: false });

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<RegionCode>("ALL");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as RegionCode | null;
    if (saved && REGIONS.some((r) => r.code === saved)) setRegionState(saved);
    setReady(true);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      region,
      ready,
      setRegion: (r) => {
        setRegionState(r);
        try {
          window.localStorage.setItem(STORAGE_KEY, r);
        } catch {
          /* storage unavailable — keep the choice in memory only */
        }
      },
    }),
    [region, ready],
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  return useContext(RegionContext);
}

export function regionLabel(code: RegionCode): string {
  return REGIONS.find((r) => r.code === code)?.label ?? "Show every shop";
}
