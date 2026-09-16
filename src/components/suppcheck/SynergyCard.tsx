import { Link } from "@tanstack/react-router";
import { AlertTriangle, Check, ShoppingBasket, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/suppcheck/ProductImage";
import { useBasket } from "@/lib/basket";
import { productImageUrl } from "@/lib/productImages";
import { useRegion } from "@/lib/region";
import { resolveSynergies } from "@/lib/synergies";
import { formatPrice, type Product } from "@/lib/suppcheck";

export function SynergyCard({ product, products }: { product: Product; products: Product[] }) {
  const { region } = useRegion();
  const { addOffer, hasOffer } = useBasket();
  const result = resolveSynergies(product, products, region);

  return (
    <section className="rounded-lg border border-primary/20 bg-primary/5 p-4" aria-labelledby={`synergy-${product.id}`}>
      <h2 id={`synergy-${product.id}`} className="flex items-start gap-2 text-base font-semibold text-foreground">
        <Zap className="mt-0.5 size-5 shrink-0 fill-primary/20 text-primary" />
        Essential Co-factors &amp; Synergistic Pairings
      </h2>

      {result.pairings.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {result.pairings.map((pairing) => {
            const added = pairing.offer ? hasOffer(pairing.offer.id) : false;
            const partnerProduct = pairing.product;
            const partnerOffer = pairing.offer;
            return (
              <article key={`${pairing.badge}-${pairing.name}`} className="flex flex-col rounded-md border border-primary/20 bg-surface p-3">
                <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3">
                  {partnerProduct ? (
                    <ProductImage src={productImageUrl(partnerProduct)} alt={partnerProduct.name} brand={partnerProduct.brands.name} className="size-16" />
                  ) : <div className="size-16 rounded-md bg-surface-raised" aria-hidden="true" />}
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-accent px-2 py-1 text-[10px] font-semibold uppercase text-accent-foreground">
                      {pairing.badge}
                    </span>
                    <h3 className="mt-2 text-sm font-semibold text-foreground">{pairing.name}</h3>
                  </div>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{pairing.explanation}</p>
                <div className="mt-auto pt-3">
                  {partnerProduct && partnerOffer ? (
                    <Button
                      type="button"
                      size="sm"
                      variant={added ? "secondary" : "default"}
                      className="w-full whitespace-normal px-3 text-center leading-tight"
                      onClick={() => addOffer(partnerProduct, partnerOffer)}
                    >
                      {added ? <Check /> : <ShoppingBasket />}
                       {added ? "Added to Basket" : `+ Add ${partnerProduct.name} — ${formatPrice(partnerOffer.price, partnerOffer.currency)}`}
                    </Button>
                  ) : partnerProduct ? (
                    <Button asChild type="button" size="sm" variant="outline" className="w-full whitespace-normal px-3 text-center leading-tight">
                      <Link to="/products/$slug" params={{ slug: partnerProduct.slug }}>
                        View {partnerProduct.name}
                      </Link>
                    </Button>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">No matching catalogue product yet.</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">No essential co-factor is currently mapped for this supplement.</p>
      )}

      {result.caution && (
        <p className="mt-3 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs leading-relaxed text-warning-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <span><strong>Timing note:</strong> {result.caution}</span>
        </p>
      )}
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Nutrient pairings based on clinical absorption data. Consult your healthcare professional.
      </p>
    </section>
  );
}