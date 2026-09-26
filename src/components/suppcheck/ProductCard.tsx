import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/suppcheck/ProductImage";
import { ProductCardGallery } from "@/components/suppcheck/ProductGallery";
import { ProductQuickView } from "@/components/suppcheck/ProductQuickView";
import { productImageUrl } from "@/lib/productImages";
import { offersForRegion, useRegion } from "@/lib/region";
import { chemicalForm, primaryIngredient, valueMetric, type Product } from "@/lib/suppcheck";
import { useMoney, useT } from "@/lib/market";
import { RetailerOfferRows } from "@/components/suppcheck/RetailerOfferRows";

type Props = { product: Product; products: Product[]; selected: boolean; selectionFull: boolean; onToggle: (id: string) => void };

export function ProductCard({ product, products, selected, selectionFull, onToggle }: Props) {
  const money = useMoney();
  const t = useT();
  const { region } = useRegion();
  const eligibleOffers = offersForRegion(product, region).offers;
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
      <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 sm:block">
        <div className="relative">
          {product.product_images?.length > 1 ? <ProductCardGallery product={product} /> : <Link to="/products/$slug" params={{ slug: product.slug }} aria-label={`View ${product.name}`} className="block"><ProductImage src={productImageUrl(product)} alt={`${product.brands.name} ${product.name}`} brand={product.brands.name} className="aspect-square w-full" /></Link>}
          <Button type="button" onClick={() => onToggle(product.id)} disabled={!selected && selectionFull} aria-pressed={selected} aria-label={selected ? "Remove from comparison" : "Add to comparison"} size="icon" variant={selected ? "default" : "outline"} className="absolute right-1 top-1 size-9 shadow-sm sm:right-2 sm:top-2 sm:size-11">
            <Check />
          </Button>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase text-primary sm:mt-3">{category}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{product.brands.name}</p>
          <Link to="/products/$slug" params={{ slug: product.slug }} className="mt-1 block font-display text-base font-semibold leading-snug hover:text-primary sm:line-clamp-2 sm:min-h-11">
            {product.name}
          </Link>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-border bg-surface-raised px-2 py-1 text-[10px] text-muted-foreground">{chemicalForm(product)} · {primaryIngredient(product)?.bioavailability_score ?? product.form}</span>
        {product.total_servings ? <span className="rounded-full border border-border bg-surface-raised px-2 py-1 text-[10px] text-muted-foreground">{product.total_servings} {t("badge.servings")}</span> : null}
        {product.third_party_certifications.length > 0 ? <span className="flex items-center gap-1 rounded-full border border-primary/25 bg-accent px-2 py-1 text-[10px] font-medium text-accent-foreground"><BadgeCheck className="size-3" /> {t("badge.labTested")}</span> : null}
      </div>

      <div className="mt-3 rounded-md border border-border bg-background p-2.5">
        <p className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">Purchase options</p>
        <RetailerOfferRows product={product} compact />
        {currencyCounts && Object.keys(currencyCounts).length > 1 && <p className="mt-1 text-[10px] text-muted-foreground">Other currencies shown separately on details</p>}
      </div>

      {metric ? <div className="mt-2 flex flex-wrap gap-1.5 rounded-md bg-surface-raised px-2 py-1.5 text-[10px] text-muted-foreground"><strong className="num font-medium text-foreground">{money(metric.primaryValue, metric.currency)}</strong> {metric.primaryLabel.toLowerCase()}{metric.secondaryLabel && metric.secondaryValue != null ? <><span>·</span><strong className="num font-medium text-foreground">{money(metric.secondaryValue, metric.currency)}</strong> {metric.secondaryLabel.toLowerCase()}</> : null}</div> : null}

      <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
        <ProductQuickView product={product} products={products} />
        <Button asChild variant="outline" size="icon" className="w-full px-2"><Link to="/products/$slug" params={{ slug: product.slug }} aria-label={`Details for ${product.name}`} title="Full details"><span className="sm:hidden">Full details</span><ArrowUpRight /></Link></Button>
      </div>
    </article>
  );
}