import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, Beaker, Check } from "lucide-react";
import {
  bestOffer,
  chemicalForm,
  costPer100mgElemental,
  elementalPerServing,
  formatPrice,
  type Product,
} from "@/lib/suppcheck";
import { RetailerActions } from "@/components/suppcheck/RetailerActions";
import { Button } from "@/components/ui/button";

type Props = {
  product: Product;
  selected: boolean;
  selectionFull: boolean;
  onToggle: (id: string) => void;
};

export function ProductCard({ product, selected, selectionFull, onToggle }: Props) {
  const offer = bestOffer(product);
  const elemental = elementalPerServing(product);
  const normalized = costPer100mgElemental(product);
  const certified = product.third_party_certifications.filter((c) => c !== "Non-GMO");

  return (
    <article
      className={`group relative flex flex-col rounded-lg border bg-surface p-4 transition-colors ${
        selected ? "border-primary/70 bg-accent/40" : "border-border hover:border-border-strong"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {product.brands.name} · {product.brands.country_of_origin}
          </p>
          <h3 className="mt-1 text-base font-semibold leading-snug">{product.name}</h3>
        </div>
        <Button
          type="button"
          onClick={() => onToggle(product.id)}
          disabled={!selected && selectionFull}
          aria-pressed={selected}
          aria-label={selected ? "Remove from comparison" : "Add to comparison"}
          size="icon"
          variant="outline"
          className={`size-7 shrink-0 ${
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border-strong text-transparent hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-30"
          }`}
        >
          <Check className="size-4" />
        </Button>
      </div>

      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
        {product.category_path.join(" › ")}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded border border-border bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
          {chemicalForm(product)}
        </span>
        <span className="rounded border border-border bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
          {product.form}
        </span>
        {certified.map((c) => (
          <span
            key={c}
            className="flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
          >
            <BadgeCheck className="size-3" />
            {c}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
        <div className="bg-surface-raised px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Elemental / serving
          </p>
          <p className="num mt-0.5 text-lg font-semibold text-primary">{elemental} mg</p>
        </div>
        <div className="bg-surface-raised px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Cost / 100 mg
          </p>
          <p className="num mt-0.5 text-lg font-semibold">
            {normalized ? `€${normalized.toFixed(3)}` : "—"}
          </p>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
        <Beaker className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
        {product.primary_benefit}
      </p>

      <RetailerActions product={product} compact />

      <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">From</p>
          <p className="num text-base font-semibold">
            {offer ? formatPrice(offer.price, offer.currency) : "—"}
            <span className="ml-1 font-sans text-xs font-normal text-muted-foreground">
              {offer ? `at ${offer.merchant_name}` : ""}
            </span>
          </p>
        </div>
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          View details
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
