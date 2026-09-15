import { Check, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBasket } from "@/lib/basket";
import { formatPrice, type Product } from "@/lib/suppcheck";
import { offerShipsTo, useRegion } from "@/lib/region";

export function RetailerActions({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addOffer, hasOffer } = useBasket();
  const { region } = useRegion();
  const offers = product.merchant_offers.filter(
    (offer) => offer.in_stock && offer.link_verified && offerShipsTo(offer, region),
  );

  if (!offers.length) return null;

  return (
    <div className={compact ? "mt-3 space-y-1.5" : "flex flex-wrap gap-2"}>
      {offers.map((offer) => {
        const added = hasOffer(offer.id);
        return (
          <Button
            key={offer.id}
            type="button"
            size="sm"
            variant={added ? "secondary" : "outline"}
            onClick={() => addOffer(product, offer)}
            className={compact ? "w-full justify-between" : ""}
            aria-label={`Add ${product.name} from ${offer.merchant_name} to basket`}
          >
            <span className="flex items-center gap-1.5">
              {added ? <Check /> : <ShoppingBasket />}
              {offer.merchant_name}
            </span>
            <span className="num">{formatPrice(offer.price, offer.currency)}</span>
          </Button>
        );
      })}
    </div>
  );
}