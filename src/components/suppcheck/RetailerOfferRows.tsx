import { useEffect, useMemo, useState } from "react";
import { Check, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBasket } from "@/lib/basket";
import { useMarket, useMoney, useT } from "@/lib/market";
import { latestOfferUpdate, priceAsOfShort, type Product } from "@/lib/suppcheck";
import { offersForRegion, useRegion } from "@/lib/region";

export function RetailerOfferRows({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { region } = useRegion();
  const { addOffer } = useBasket();
  const { isConverted } = useMarket();
  const money = useMoney();
  const t = useT();
  const [addedId, setAddedId] = useState<string | null>(null);
  const resolved = offersForRegion(product, region);
  const offers = useMemo(() => [...resolved.offers].sort((a, b) => Number(a.price) - Number(b.price)), [resolved.offers]);

  useEffect(() => {
    if (!addedId) return;
    const timer = window.setTimeout(() => setAddedId(null), 1800);
    return () => window.clearTimeout(timer);
  }, [addedId]);

  if (!offers.length) return <p className="text-xs text-muted-foreground">{t("badge.noOffer")}</p>;

  return (
    <div className="space-y-2">
      {resolved.usedFallback && <p className="rounded-md border border-warning/30 bg-warning/10 px-2.5 py-2 text-xs text-warning-foreground">{t("inventory.global")}</p>}
      {offers.map((offer, index) => {
        const added = addedId === offer.id;
        return (
          <Button key={offer.id} type="button" variant={index === 0 ? "default" : "outline"} className={`min-h-11 w-full justify-between gap-2 whitespace-normal px-3 ${compact ? "text-xs" : "text-sm"}`} onClick={() => { addOffer(product, offer); setAddedId(offer.id); }}>
            <span className="flex min-w-0 items-center gap-2 text-left">{added ? <Check className="size-4 shrink-0" /> : <ShoppingBasket className="size-4 shrink-0" />}<span className="truncate">{added ? `Added to ${offer.merchant_name} Cart!` : offer.merchant_name}</span></span>
            <span className="flex shrink-0 items-center gap-1.5">{index === 0 && !added && <span className="rounded bg-primary-foreground/15 px-1.5 py-0.5 text-[9px] font-semibold">{t("badge.bestDeal")}</span>}<span className="num font-semibold">{money(Number(offer.price), offer.currency)}</span></span>
          </Button>
        );
      })}
      {resolved.usedFallback && offers[0] && <p className="text-[10px] text-muted-foreground">{t("inventory.shipsInternationally")} {offers[0].merchant_name}.</p>}
      {offers.some((offer) => isConverted(offer.currency)) && <p className="text-[10px] text-muted-foreground">{t("price.approx")} {offers[0]?.currency}.</p>}
      <p className="text-[10px] leading-relaxed text-muted-foreground">{priceAsOfShort(latestOfferUpdate(offers))}</p>
    </div>
  );
}