import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { marketAffiliateParams, useMarket } from "@/lib/market";

export const CONSENT_STORAGE_KEY = "isupplement_consent_v1";
/** Bump when the banner wording changes so visitors are asked again. */
export const CONSENT_VERSION = 1;

export type ConsentCategory = "necessary" | "preferences" | "affiliate" | "analytics";

export type ConsentState = {
  necessary: true;
  preferences: boolean;
  affiliate: boolean;
  analytics: boolean;
  decidedAt: string;
  version: number;
};

/**
 * Synchronous check used by the region and market stores, which must decide
 * whether they may write a preference cookie before React context is ready.
 */
export function preferencesAllowed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    return parsed.version === CONSENT_VERSION && Boolean(parsed.preferences);
  } catch {
    return false;
  }
}

const ACCEPT_ALL: Omit<ConsentState, "decidedAt"> = {
  necessary: true,
  preferences: true,
  affiliate: true,
  analytics: true,
};

const REJECT_ALL: Omit<ConsentState, "decidedAt"> = {
  necessary: true,
  preferences: false,
  affiliate: false,
  analytics: false,
};

type ConsentContextValue = {
  consent: ConsentState | null;
  ready: boolean;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  save: (choices: { preferences: boolean; affiliate: boolean; analytics: boolean }) => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function read(): ConsentState | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      necessary: true,
      preferences: Boolean(parsed.preferences),
      affiliate: Boolean(parsed.affiliate),
      analytics: Boolean(parsed.analytics),
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    setConsent(read());
    setReady(true);
  }, []);

  const persist = useCallback((next: Omit<ConsentState, "decidedAt">) => {
    const value: ConsentState = { ...next, necessary: true, decidedAt: new Date().toISOString() };
    setConsent(value);
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
    } catch {
      /* storage unavailable — choice applies for this session only */
    }
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      ready,
      panelOpen,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
      acceptAll: () => {
        persist(ACCEPT_ALL);
        setPanelOpen(false);
      },
      rejectNonEssential: () => {
        persist(REJECT_ALL);
        setPanelOpen(false);
      },
      save: (choices) => {
        persist({ necessary: true, ...choices });
        setPanelOpen(false);
      },
    }),
    [consent, ready, panelOpen, persist],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used inside ConsentProvider");
  return ctx;
}

/**
 * Affiliate redirect URL for an offer. When the visitor has not consented to
 * affiliate measurement, the link carries `nt=1` so the redirect omits the
 * per-click reference.
 */
export function useAffiliateHref() {
  const { consent } = useConsent();
  const { market } = useMarket();
  const tracking = consent?.affiliate ?? false;
  return useCallback(
    (offerId: string) => {
      const params = new URLSearchParams(marketAffiliateParams(market));
      if (!tracking) params.set("nt", "1");
      return `/api/affiliate/redirect/${offerId}?${params.toString()}`;
    },
    [market, tracking],
  );
}
