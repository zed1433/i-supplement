import { Globe } from "lucide-react";
import { LANGUAGE_LABELS, type LanguageCode } from "@/lib/i18n";
import { MARKETS, useMarket, type MarketCode } from "@/lib/market";

/** Header control: country/currency plus the languages available in that market. */
export function MarketSelector() {
  const { market, language, setMarket, setLanguage } = useMarket();

  return (
    <div className="flex items-center gap-1" data-testid="market-selector">
      <Globe className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <label>
        <span className="sr-only">Country and currency</span>
        <select
          value={market.code}
          onChange={(event) => setMarket(event.target.value as MarketCode)}
          className="h-11 max-w-[11rem] rounded-md border border-border bg-background px-2 text-xs text-foreground transition-colors hover:border-primary"
        >
          {MARKETS.map((option) => (
            <option key={option.code} value={option.code}>
              {`${option.flag} ${option.currency} (${option.currencySymbol}) · ${option.label}`}
            </option>
          ))}
        </select>
      </label>
      {market.languages.length > 1 ? (
        <label>
          <span className="sr-only">Language</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as LanguageCode)}
            className="h-11 max-w-[7.5rem] rounded-md border border-border bg-background px-2 text-xs text-foreground transition-colors hover:border-primary"
          >
            {market.languages.map((code) => (
              <option key={code} value={code}>
                {LANGUAGE_LABELS[code]}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {LANGUAGE_LABELS[language]}
        </span>
      )}
    </div>
  );
}
