import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FALLBACK_RATES, convert, formatMoney, loadRates } from "@/lib/currency";
import { translate, type LanguageCode, type TranslationKey } from "@/lib/i18n";
import { useRegion, type RegionCode } from "@/lib/region";

export type MarketCode = "US" | "EU" | "UK" | "BR" | "ZA" | "NG";

export type Market = {
  code: MarketCode;
  country: string;
  label: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  languages: LanguageCode[];
  region: RegionCode;
  amazonDomain: string;
  amazonTag: string;
  iherbCountry: string;
};

export const MARKETS: Market[] = [
  { code: "US", country: "US", label: "United States", flag: "🇺🇸", currency: "USD", currencySymbol: "$", locale: "en-US", languages: ["en", "es"], region: "US", amazonDomain: "www.amazon.com", amazonTag: "suppcheck-20", iherbCountry: "US" },
  { code: "EU", country: "DE", label: "Europe", flag: "🇪🇺", currency: "EUR", currencySymbol: "€", locale: "de-DE", languages: ["en", "de", "fr", "es"], region: "EU", amazonDomain: "www.amazon.de", amazonTag: "suppcheck-21", iherbCountry: "DE" },
  { code: "UK", country: "GB", label: "United Kingdom", flag: "🇬🇧", currency: "GBP", currencySymbol: "£", locale: "en-GB", languages: ["en"], region: "UK", amazonDomain: "www.amazon.co.uk", amazonTag: "suppcheck-21", iherbCountry: "GB" },
  { code: "BR", country: "BR", label: "Brazil", flag: "🇧🇷", currency: "BRL", currencySymbol: "R$", locale: "pt-BR", languages: ["pt", "en", "es"], region: "BR", amazonDomain: "www.amazon.com.br", amazonTag: "suppcheck-20", iherbCountry: "BR" },
  { code: "ZA", country: "ZA", label: "South Africa", flag: "🇿🇦", currency: "ZAR", currencySymbol: "R", locale: "en-ZA", languages: ["en"], region: "ZA", amazonDomain: "www.amazon.com", amazonTag: "suppcheck-20", iherbCountry: "ZA" },
  { code: "NG", country: "NG", label: "Nigeria", flag: "🇳🇬", currency: "NGN", currencySymbol: "₦", locale: "en-NG", languages: ["en"], region: "NG", amazonDomain: "www.amazon.com", amazonTag: "suppcheck-20", iherbCountry: "NG" },
];

export const DEFAULT_MARKET = MARKETS[0]!;

export function marketByCode(code: string | null | undefined): Market | undefined {
  return MARKETS.find((m) => m.code === code);
}

const STORAGE_KEY = "isupplement.market.v1";
const COOKIE_KEY = "isupplement_market";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type Saved = { market: MarketCode; language: LanguageCode };

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${COOKIE_KEY}=`));
  return match?.split("=")[1] ?? null;
}

function readSaved(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? null;
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Saved>;
      const market = marketByCode(parsed.market);
      if (market) {
        const language = market.languages.includes(parsed.language as LanguageCode)
          ? (parsed.language as LanguageCode)
          : market.languages[0]!;
        return { market: market.code, language };
      }
    }
  } catch {
    /* fall through to the cookie */
  }
  const cookie = marketByCode(readCookie());
  return cookie ? { market: cookie.code, language: cookie.languages[0]! } : null;
}

/** Guess the market from the browser locale on the very first visit. */
function inferMarket(): Market {
  if (typeof navigator === "undefined") return DEFAULT_MARKET;
  const locale = (navigator.languages?.[0] ?? navigator.language ?? "en-US").toUpperCase();
  const country = locale.split("-")[1] ?? "";
  const direct = MARKETS.find((m) => m.country === country);
  if (direct) return direct;
  if (country === "GB") return marketByCode("UK")!;
  const eu = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "ES", "FI", "FR", "GR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK", "DE"];
  if (eu.includes(country)) return marketByCode("EU")!;
  if (locale.startsWith("PT")) return marketByCode("BR")!;
  return DEFAULT_MARKET;
}

function inferLanguage(market: Market): LanguageCode {
  if (typeof navigator === "undefined") return market.languages[0]!;
  const tag = (navigator.languages?.[0] ?? navigator.language ?? "en").slice(0, 2).toLowerCase() as LanguageCode;
  return market.languages.includes(tag) ? tag : market.languages[0]!;
}

type MarketContextValue = {
  market: Market;
  language: LanguageCode;
  ready: boolean;
  rates: Record<string, number>;
  setMarket: (code: MarketCode) => void;
  setLanguage: (code: LanguageCode) => void;
  /** Convert an offer price into the shopper's currency and format it. */
  money: (amount: number, currency?: string) => string;
  /** True when the displayed amount was converted from another currency. */
  isConverted: (currency?: string) => boolean;
  t: (key: TranslationKey) => string;
};

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const { setRegion } = useRegion();
  const [market, setMarketState] = useState<Market>(DEFAULT_MARKET);
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = readSaved();
    if (saved) {
      const m = marketByCode(saved.market)!;
      setMarketState(m);
      setLanguageState(saved.language);
    } else {
      const inferred = inferMarket();
      setMarketState(inferred);
      setLanguageState(inferLanguage(inferred));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    let active = true;
    loadRates().then((next) => {
      if (active) setRates(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(
    (nextMarket: Market, nextLanguage: LanguageCode) => {
      setMarketState(nextMarket);
      setLanguageState(nextLanguage);
      // ePrivacy: only remember the market across visits with preference consent.
      if (!preferencesAllowed()) {
        setRegion(nextMarket.region);
        return;
      }
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ market: nextMarket.code, language: nextLanguage } satisfies Saved),
        );
      } catch {
        /* storage unavailable — choice applies for this session only */
      }
      document.cookie = `${COOKIE_KEY}=${nextMarket.code}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
      setRegion(nextMarket.region);
    },
    [setRegion],
  );

  const value = useMemo<MarketContextValue>(() => {
    const money = (amount: number, currency = market.currency) => {
      const source = (currency || market.currency).toUpperCase();
      if (source === market.currency) return formatMoney(amount, market.currency, market.locale);
      const converted = convert(amount, source, market.currency, rates);
      if (converted === null) return formatMoney(amount, source, market.locale);
      return formatMoney(converted, market.currency, market.locale);
    };
    return {
      market,
      language,
      ready,
      rates,
      setMarket: (code) => {
        // Switching market adopts that market's primary language; the shopper
        // can still pick another language from the neighbouring control.
        const next = marketByCode(code) ?? DEFAULT_MARKET;
        persist(next, next.languages[0]!);
      },
      setLanguage: (code) => persist(market, market.languages.includes(code) ? code : market.languages[0]!),
      money,
      isConverted: (currency) =>
        Boolean(currency) && currency?.toUpperCase() !== market.currency,
      t: (key) => translate(language, key),
    };
  }, [language, market, persist, rates, ready]);

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

const FALLBACK_VALUE: MarketContextValue = {
  market: DEFAULT_MARKET,
  language: "en",
  ready: false,
  rates: FALLBACK_RATES,
  setMarket: () => {},
  setLanguage: () => {},
  money: (amount, currency = DEFAULT_MARKET.currency) =>
    formatMoney(amount, currency, DEFAULT_MARKET.locale),
  isConverted: () => false,
  t: (key) => translate("en", key),
};

export function useMarket(): MarketContextValue {
  return useContext(MarketContext) ?? FALLBACK_VALUE;
}

/** Shorthand for components that only need formatted money. */
export function useMoney() {
  return useMarket().money;
}

/** Shorthand for components that only need translated copy. */
export function useT() {
  return useMarket().t;
}

/** Query parameters appended to affiliate redirects for geo handoff. */
export function marketAffiliateParams(market: Market): string {
  return `country=${market.country}&currency=${market.currency}`;
}
