import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, Check, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/suppcheck/ProductImage";
import { ProductQuickView } from "@/components/suppcheck/ProductQuickView";
import { productImageUrl } from "@/lib/productImages";
import { useBasket } from "@/lib/basket";
import { chemicalForm, elementalPerServing, formatPrice, priceAsOfShort, type Product } from "@/lib/suppcheck";

type Props = { product: Product; products: Product[]; selected: boolean; selectionFull: boolean; onToggle: (id: string) => void };

export function ProductCard({ product, products, selected, selectionFull, onToggle }: Props) {
  const { addOffer, hasOffer } = useBasket();
  const eligibleOffers = product.merchant_offers.filter((offer) => offer.in_stock && offer.link_verified);
  const currencyCounts = eligibleOffers.reduce<Record<string, number>>((counts, offer) => {
    counts[offer.currency] = (counts[offer.currency] ?? 0) + 1;
    return counts;
  }, {});
  const comparisonCurrency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const offers = eligibleOffers
    .filter((offer) => offer.currency === comparisonCurrency)
    .sort((a, b) => Number(a.price) - Number(b.price));
  const cheapest = offers[0];
  const elemental = elementalPerServing(product);
  const unitCost = cheapest && elemental ? (Number(cheapest.price) / (elemental * 30)) * 100 : null;
  const category = (product.category_path[2] ?? product.category).toUpperCase();

  return (
    <article className={`group flex h-full flex-col rounded-lg border bg-surface p-3 transition-shadow hover:shadow-md ${selected ? "border-primary ring-2 ring-primary/15" : "border-border"}`}>
      <div className="relative">
        <Link to="/products/$slug" params={{ slug: product.slug }} aria-label={`View ${product.name}`}>
          <ProductImage src={productImageUrl(product)} alt={`${product.brands.name} ${product.name}`} brand={product.brands.name} className="aspect-square w-full" />
        </Link>
        <Button type="button" onClick={() => onToggle(product.id)} disabled={!selected && selectionFull} aria-pressed={selected} aria-label={selected ? "Remove from comparison" : "Add to comparison"} size="icon" variant={selected ? "default" : "outline"} className="absolute right-2 top-2 size-11 shadow-sm">
          <Check />
        </Button>
      </div>

      <p className="mt-3 text-[10px] font-semibold uppercase text-primary">{category}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{product.brands.name} · {chemicalForm(product)}</p>
      <Link to="/products/$slug" params={{ slug: product.slug }} className="mt-1 line-clamp-2 min-h-11 font-display text-sm font-semibold leading-snug hover:text-primary sm:text-base">
        {product.name}
      </Link>

      <div className="mt-3 rounded-md border border-border bg-background p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">BEST {comparisonCurrency ?? ""} PRICE</span>
          <span className="num text-base font-semibold text-primary">{cheapest ? formatPrice(cheapest.price, cheapest.currency) : "Unavailable"}</span>
        </div>
        {cheapest && <p className="mt-1 text-[11px] text-muted-foreground">{cheapest.merchant_name} · {priceAsOfShort(cheapest.updated_at)}</p>}
        {offers.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-2 text-[11px] text-muted-foreground">
            {offers.slice(1, 3).map((offer) => <span key={offer.id}>{offer.merchant_name} <strong className="num font-medium text-foreground">{formatPrice(offer.price, offer.currency)}</strong></span>)}
          </div>
        )}
        {currencyCounts && Object.keys(currencyCounts).length > 1 && <p className="mt-1 text-[10px] text-muted-foreground">Other currencies shown separately on details</p>}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Unit value</span>
        <strong className="num font-semibold">{unitCost && cheapest ? `${formatPrice(unitCost, cheapest.currency)} / 100 mg` : "Not available"}</strong>
      </div>
      {product.third_party_certifications.length > 0 && <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary"><BadgeCheck className="size-3.5" /> Third-party verified</p>}

      <div className="mt-auto grid grid-cols-[1fr_auto_auto] gap-2 pt-3">
        {cheapest ? (
          <Button type="button" onClick={() => addOffer(product, cheapest)} variant={hasOffer(cheapest.id) ? "secondary" : "default"} className="min-w-0 px-2 text-xs">
            {hasOffer(cheapest.id) ? <Check /> : <ShoppingBasket />} {hasOffer(cheapest.id) ? "Added" : "Add best price"}
          </Button>
        ) : <Button disabled className="px-2 text-xs">Unavailable</Button>}
        <ProductQuickView product={product} products={products} />
        <Button asChild variant="outline" size="icon"><Link to="/products/$slug" params={{ slug: product.slug }} aria-label={`Details for ${product.name}`}><ArrowUpRight /></Link></Button>
      </div>
    </article>
  );
}