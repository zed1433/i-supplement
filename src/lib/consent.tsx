import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const CONSENT_STORAGE_KEY = "isupplement_consent_v1";

export type ConsentCategory = "necessary" | "preferences" | "affiliate" | "analytics";

export type ConsentState = {
  necessary: true;
  preferences: boolean;
  affiliate: boolean;
  analytics: boolean;
  decidedAt: string;
};

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
