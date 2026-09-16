import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Eye } from "lucide-react";
import { ProductImage } from "@/components/suppcheck/ProductImage";
import { RetailerActions } from "@/components/suppcheck/RetailerActions";
import { SynergyCard } from "@/components/suppcheck/SynergyCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { productImageUrl } from "@/lib/productImages";
import { offerShipsTo, useRegion } from "@/lib/region";
import { AFFILIATE_DISCLOSURE, chemicalForm, elementalPerServing, formatPrice, priceAsOfShort, type Product } from "@/lib/suppcheck";

export function ProductQuickView({ product, products }: { product: Product; products: Product[] }) {
  const { region } = useRegion();
  const offers = product.merchant_offers
    .filter((offer) => offer.in_stock && offer.link_verified && offerShipsTo(offer, region))
    .sort((a, b) => Number(a.price) - Number(b.price));
  const best = offers[0];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label={`Quick view ${product.name}`} title="Quick view">
          <Eye />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="pr-8">
          <SheetTitle>{product.name}</SheetTitle>
          <SheetDescription>{product.brands.name} · {chemicalForm(product)}</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4">
            <ProductImage src={productImageUrl(product)} alt={`${product.brands.name} ${product.name}`} brand={product.brands.name} className="aspect-square w-full" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase text-primary">{product.category}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.primary_benefit}</p>
              <p className="num mt-2 text-xs text-foreground">{elementalPerServing(product)} mg elemental per serving</p>
            </div>
          </div>

          <section className="rounded-md border border-border bg-surface-raised p-3" aria-label="Best retailer price">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Best regional price</span>
              <strong className="num text-lg text-primary">{best ? formatPrice(best.price, best.currency) : "Unavailable"}</strong>
            </div>
            {best ? (
              <>
                <p className="mt-1 text-xs text-muted-foreground">{best.merchant_name} · {priceAsOfShort(best.updated_at)}</p>
                <RetailerActions product={product} compact />
              </>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">No verified offers currently ship to your selected region.</p>
            )}
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{AFFILIATE_DISCLOSURE}</p>
          </section>

          <SynergyCard product={product} products={products} />

          <Button asChild variant="outline" className="w-full">
            <Link to="/products/$slug" params={{ slug: product.slug }}>
              Full clinical breakdown <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}