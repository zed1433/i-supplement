import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, Check, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/suppcheck/ProductImage";
import { ProductQuickView } from "@/components/suppcheck/ProductQuickView";
import { productImageUrl } from "@/lib/productImages";
import { useBasket } from "@/lib/basket";
import { offerShipsTo, useRegion } from "@/lib/region";
import { chemicalForm, formatPrice, priceAsOfShort, primaryIngredient, valueMetric, type Product } from "@/lib/suppcheck";

type Props = { product: Product; products: Product[]; selected: boolean; selectionFull: boolean; onToggle: (id: string) => void };

export function ProductCard({ product, products, selected, selectionFull, onToggle }: Props) {
  const { addOffer, hasOffer } = useBasket();
  const { region } = useRegion();
  const eligibleOffers = product.merchant_offers.filter((offer) => offer.in_stock && offer.link_verified && offerShipsTo(offer, region));
  const currencyCounts = eligibleOffers.reduce<Record<string, number>>((counts, offer) => {
    counts[offer.currency] = (counts[offer.currency] ?? 0) + 1;
    return counts;
  }, {});
  const comparisonCurrency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const offers = eligibleOffers
    .filter((offer) => offer.currency === comparisonCurrency)
    .sort((a, b) => Number(a.price) - Number(b.price));
  const cheapest = offers[0];
  const metric = valueMetric(product, cheapest);
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
      <p className="mt-1 text-[11px] text-muted-foreground">{product.brands.name}</p>
      <Link to="/products/$slug" params={{ slug: product.slug }} className="mt-1 line-clamp-2 min-h-11 font-display text-sm font-semibold leading-snug hover:text-primary sm:text-base">
        {product.name}
      </Link>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-border bg-surface-raised px-2 py-1 text-[10px] text-muted-foreground">{chemicalForm(product)} · {primaryIngredient(product)?.bioavailability_score ?? product.form}</span>
        {product.total_servings ? <span className="rounded-full border border-border bg-surface-raised px-2 py-1 text-[10px] text-muted-foreground">{product.total_servings} servings</span> : null}
        {product.third_party_certifications.length > 0 ? <span className="flex items-center gap-1 rounded-full border border-primary/25 bg-accent px-2 py-1 text-[10px] font-medium text-accent-foreground"><BadgeCheck className="size-3" /> Lab tested</span> : null}
      </div>

      <div className="mt-3 rounded-md border border-border bg-background p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${cheapest ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{cheapest ? "BEST DEAL" : "NO ACTIVE OFFER"}</span>
          <span className="num text-base font-semibold text-primary">{cheapest ? formatPrice(cheapest.price, cheapest.currency) : "Unavailable"}</span>
        </div>
        {cheapest && <p className="mt-1 text-[10px] text-muted-foreground">{priceAsOfShort(cheapest.updated_at)}</p>}
        <div className="mt-2 grid grid-cols-1 gap-1.5 border-t border-border pt-2 sm:grid-cols-2">
          {offers.slice(0, 3).map((offer, index) => <div key={offer.id} className={`flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-[11px] ${index === 0 ? "border-primary/30 bg-accent" : "border-border bg-surface"}`}><span className="truncate">{offer.merchant_name}</span><strong className="num shrink-0 font-semibold text-foreground">{formatPrice(offer.price, offer.currency)}</strong></div>)}
        </div>
        {currencyCounts && Object.keys(currencyCounts).length > 1 && <p className="mt-1 text-[10px] text-muted-foreground">Other currencies shown separately on details</p>}
      </div>

      {metric ? <div className="mt-2 flex flex-wrap gap-1.5 rounded-md bg-surface-raised px-2 py-1.5 text-[10px] text-muted-foreground"><strong className="num font-medium text-foreground">{formatPrice(metric.primaryValue, metric.currency)}</strong> {metric.primaryLabel.toLowerCase()}{metric.secondaryLabel && metric.secondaryValue != null ? <><span>·</span><strong className="num font-medium text-foreground">{formatPrice(metric.secondaryValue, metric.currency)}</strong> {metric.secondaryLabel.toLowerCase()}</> : null}</div> : null}

      <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
        {cheapest ? (
          <Button type="button" onClick={() => addOffer(product, cheapest)} variant={hasOffer(cheapest.id) ? "secondary" : "default"} className="col-span-2 min-w-0 px-2 text-xs">
            {hasOffer(cheapest.id) ? <Check /> : <ShoppingBasket />} {hasOffer(cheapest.id) ? "Saved to Universal Cart" : "Add to Universal Cart"}
          </Button>
        ) : <Button disabled className="col-span-2 px-2 text-xs">Unavailable</Button>}
        <ProductQuickView product={product} products={products} />
        <Button asChild variant="outline" size="icon" className="w-full"><Link to="/products/$slug" params={{ slug: product.slug }} aria-label={`Details for ${product.name}`} title="Full details"><ArrowUpRight /></Link></Button>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">Groups your selected offers by retailer, then sends you to each retailer checkout through affiliate links.</p>
    </article>
  );
}