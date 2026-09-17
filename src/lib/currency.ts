/**
 * Lightweight FX conversion. Rates are expressed per 1 USD and refreshed once a
 * day from a free public endpoint; the built-in table is used as a fallback so
 * prices always render, even offline.
 */

export type CurrencyCode = "USD" | "EUR" | "GBP" | "BRL" | "ZAR" | "NGN";

export const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  BRL: 5.45,
  ZAR: 18.4,
  NGN: 1550,
  CHF: 0.88,
  SEK: 10.5,
  DKK: 6.85,
  PLN: 3.95,
  CAD: 1.36,
  AUD: 1.52,
};

const CACHE_KEY = "isupplement.fxrates.v1";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const ENDPOINT = "https://open.er-api.com/v6/latest/USD";

type CachedRates = { fetchedAt: number; rates: Record<string, number> };

function readCache(): CachedRates | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRates;
    if (!parsed?.rates || typeof parsed.fetchedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Returns cached rates immediately and refreshes them in the background. */
export async function loadRates(): Promise<Record<string, number>> {
  const cached = readCache();
  if (cached && Date.now() - cached.fetchedAt < MAX_AGE_MS) return cached.rates;
  try {
    const response = await fetch(ENDPOINT, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error("rates unavailable");
    const payload = (await response.json()) as { rates?: Record<string, number> };
    if (!payload.rates || typeof payload.rates["EUR"] !== "number") throw new Error("bad payload");
    const rates = { ...FALLBACK_RATES, ...payload.rates, USD: 1 };
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), rates }));
    } catch {
      /* storage unavailable — keep rates in memory only */
    }
    return rates;
  } catch {
    return cached?.rates ?? FALLBACK_RATES;
  }
}

/** Convert an amount between two currencies using USD-based rates. */
export function convert(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number | null {
  const fromRate = rates[from.toUpperCase()];
  const toRate = rates[to.toUpperCase()];
  if (!fromRate || !toRate) return null;
  return (Number(amount) / fromRate) * toRate;
}

const ZERO_DECIMAL = new Set(["NGN", "JPY", "KRW"]);

/** Locale-correct money formatting, e.g. "$19.99", "€18,50", "R$ 98,50". */
export function formatMoney(amount: number, currency: string, locale: string): string {
  const code = currency.toUpperCase();
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: ZERO_DECIMAL.has(code) ? 0 : 2,
      minimumFractionDigits: ZERO_DECIMAL.has(code) ? 0 : 2,
    }).format(Number(amount));
  } catch {
    return `${code} ${Number(amount).toFixed(2)}`;
  }
}
