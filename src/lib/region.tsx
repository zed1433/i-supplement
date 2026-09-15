import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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
const COOKIE_KEY = "isupplement_region";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function isRegion(value: string | null): value is RegionCode {
  return Boolean(value && REGIONS.some((region) => region.code === value));
}

function cookieRegion(): RegionCode | null {
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${COOKIE_KEY}=`));
  const value = match?.split("=")[1] ?? null;
  return isRegion(value) ? value : null;
}

function localeRegion(locale: string): RegionCode {
  const upper = locale.toUpperCase();
  if (upper.endsWith("-US")) return "US";
  if (upper.endsWith("-GB")) return "UK";
  if (upper.endsWith("-DE")) return "DE";
  if (upper.endsWith("-GR") || upper.startsWith("EL")) return "GR";
  const european = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "ES", "FI", "FR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"];
  return european.some((country) => upper.endsWith(`-${country}`)) ? "EU" : "ALL";
}

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

type Ctx = {
  region: RegionCode;
  suggestedRegion: RegionCode;
  setRegion: (r: RegionCode) => void;
  confirmRegion: (r?: RegionCode) => void;
  dismissPrompt: () => void;
  showPrompt: boolean;
  ready: boolean;
};
const RegionContext = createContext<Ctx>({ region: "ALL", suggestedRegion: "ALL", setRegion: () => {}, confirmRegion: () => {}, dismissPrompt: () => {}, showPrompt: false, ready: false });

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<RegionCode>("ALL");
  const [suggestedRegion, setSuggestedRegion] = useState<RegionCode>("ALL");
  const [showPrompt, setShowPrompt] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = cookieRegion() ?? window.localStorage.getItem(STORAGE_KEY);
    if (isRegion(saved)) {
      setRegionState(saved);
    } else {
      const inferred = localeRegion(navigator.languages?.[0] ?? navigator.language ?? "");
      setSuggestedRegion(inferred);
      setRegionState(inferred);
      setShowPrompt(true);
    }
    setReady(true);
  }, []);

  const persistRegion = useCallback((next: RegionCode) => {
    setRegionState(next);
    setSuggestedRegion(next);
    setShowPrompt(false);
    document.cookie = `${COOKIE_KEY}=${next}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Keep the choice in memory when browser storage is unavailable. */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      region,
      suggestedRegion,
      ready,
      setRegion: persistRegion,
      confirmRegion: (next = suggestedRegion) => persistRegion(next),
      dismissPrompt: () => setShowPrompt(false),
      showPrompt,
    }),
    [persistRegion, ready, region, showPrompt, suggestedRegion],
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  return useContext(RegionContext);
}

export function regionLabel(code: RegionCode): string {
  return REGIONS.find((r) => r.code === code)?.label ?? "Show every shop";
}
