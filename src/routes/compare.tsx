import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Check, ExternalLink, Minus } from "lucide-react";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { ProductImage } from "@/components/suppcheck/ProductImage";
import { productImageUrl } from "@/lib/productImages";
import { RetailerActions } from "@/components/suppcheck/RetailerActions";
import {
  bestOffer,
  chemicalForm,
  costPer100mgElemental,
  elementalPerServing,
  excipientFlags,
  formatPrice,
  primaryIngredient,
  productsQuery,
  type Product,
} from "@/lib/suppcheck";
import { productsForRegion, useRegion } from "@/lib/region";

type CompareSearch = { ids?: string };

export const Route = createFileRoute("/compare")({
  validateSearch: (search: Record<string, unknown>): CompareSearch =>
    typeof search["ids"] === "string" ? { ids: search["ids"] } : {},
  head: () => ({
    meta: [
      { title: "Side-by-Side Supplement Comparison — i-Supplement" },
      {
        name: "description",
        content:
          "Contrast elemental yield, normalised cost per 100 mg, chelation integrity, excipient transparency and third-party assays side by side.",
      },
      { property: "og:title", content: "Side-by-Side Supplement Comparison — i-Supplement" },
      {
        property: "og:description",
        content: "Normalised elemental economics and excipient transparency, product by product.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { ids } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: products, isLoading } = useQuery(productsQuery);
  const { region } = useRegion();

  const selectedIds = (ids ?? "").split(",").filter(Boolean).slice(0, 4);
  const all = productsForRegion(products ?? [], region);
  const chosen = selectedIds
    .map((id) => all.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const setIds = (next: string[]) =>
    navigate({ to: ".", search: { ids: next.filter(Boolean).join(",") } });

  const slots = Math.max(chosen.length + (chosen.length < 4 ? 1 : 0), 2);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">Side-by-side comparison engine</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Prices are normalised to cost per 100 mg of elemental active assuming a 30-serving
          container, so gross compound weight cannot disguise a low payload.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {Array.from({ length: slots }).map((_, i) => (
            <select
              key={i}
              value={selectedIds[i] ?? ""}
              onChange={(e) => {
                const next = [...selectedIds];
                if (e.target.value) next[i] = e.target.value;
                else next.splice(i, 1);
                setIds(next);
              }}
              className="min-w-56 rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary/60"
            >
              <option value="">Select a product…</option>
              {all.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brands.name} — {p.name}
                </option>
              ))}
            </select>
          ))}
        </div>

        {isLoading && (
          <div className="mt-8 h-96 animate-pulse rounded-lg border border-border bg-surface" />
        )}

        {!isLoading && chosen.length < 2 && (
          <p className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Pick at least two products above, or select them from the{" "}
            <Link to="/" className="text-primary underline-offset-4 hover:underline">
              catalog
            </Link>
            .
          </p>
        )}

        {chosen.length >= 2 && (
          <div className="mt-8 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-52 border-b border-r border-border bg-surface-raised p-3 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Metric
                  </th>
                  {chosen.map((p) => (
                    <th
                      key={p.id}
                      className="border-b border-r border-border bg-surface-raised p-3 text-left align-top last:border-r-0"
                    >
                      <ProductImage
                        src={productImageUrl(p)}
                        alt={`${p.brands.name} ${p.name}`}
                        brand={p.brands.name}
                        className="mb-2 aspect-square w-16"
                      />
                      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {p.brands.name}
                      </p>
                      <Link
                        to="/products/$slug"
                        params={{ slug: p.slug }}
                        className="mt-1 block font-semibold leading-snug hover:text-primary"
                      >
                        {p.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row
                  label="Primary form & elemental yield"
                  cells={chosen.map((p) => (
                    <span key={p.id}>
                      <span className="block">{chemicalForm(p)}</span>
                      <span className="num text-base font-semibold text-primary">
                        {elementalPerServing(p)} mg
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        per {p.serving_size}
                      </span>
                    </span>
                  ))}
                />
                <Row
                  label="Cost per 100 mg elemental"
                  cells={chosen.map((p) => {
                    const v = costPer100mgElemental(p);
                    return (
                      <span key={p.id} className="num text-base font-semibold">
                        {v ? `€${v.toFixed(3)}` : "—"}
                      </span>
                    );
                  })}
                />
                <Row
                  label="Chelation integrity / carrier"
                  cells={chosen.map((p) => (
                    <span key={p.id} className="text-xs leading-relaxed text-muted-foreground">
                      {primaryIngredient(p)?.ingredients.mechanism_of_action.split(".")[0]}.
                      <span className="mt-1 block text-foreground">
                        Bioavailability: {primaryIngredient(p)?.bioavailability_score}
                      </span>
                    </span>
                  ))}
                />
                <Row
                  label="Excipient transparency"
                  cells={chosen.map((p) => {
                    const flags = excipientFlags(p);
                    return (
                      <span key={p.id}>
                        {flags.length === 0 ? (
                          <span className="flex items-center gap-1.5 text-primary">
                            <Check className="size-4" /> No flagged flow agents
                          </span>
                        ) : (
                          <span className="flex items-start gap-1.5 text-warning">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            {flags.join(", ")}
                          </span>
                        )}
                        <span className="mt-1 block text-xs text-muted-foreground">
                          Full list: {p.excipients.join(", ") || "none declared"}
                        </span>
                      </span>
                    );
                  })}
                />
                <Row
                  label="3rd-party heavy metal & potency assays"
                  cells={chosen.map((p) => (
                    <span key={p.id} className="flex flex-wrap gap-1">
                      {p.third_party_certifications.length ? (
                        p.third_party_certifications.map((c) => (
                          <span
                            key={c}
                            className="rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
                          >
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Minus className="size-3.5" /> None published
                        </span>
                      )}
                    </span>
                  ))}
                />
                <Row
                  label="Lowest live merchant price"
                  cells={chosen.map((p) => {
                    const offer = p.merchant_offers
                      .filter((candidate) => candidate.in_stock && candidate.link_verified)
                      .sort((a, b) => Number(a.price) - Number(b.price))[0];
                    if (!offer) return <span key={p.id}>—</span>;
                    return (
                      <span key={p.id}>
                        <span className="num block text-base font-semibold">
                          {formatPrice(offer.price, offer.currency)}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {offer.merchant_name} · {offer.country_flag}
                        </span>
                        <span className="mt-1 block text-[10px] text-muted-foreground">
                          {priceAsOfShort(offer.updated_at)}
                        </span>
                        <a
                          href={`/api/affiliate/redirect/${offer.id}`}
                          rel="nofollow sponsored"
                          target="_blank"
                          className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                        >
                          View on {offer.merchant_name} <ExternalLink className="size-3.5" />
                        </a>
                      </span>
                    );
                  })}
                />
                <Row
                  label="Add by retailer"
                  cells={chosen.map((p) => <RetailerActions key={p.id} product={p} compact />)}
                />
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function Row({ label, cells }: { label: string; cells: React.ReactNode[] }) {
  return (
    <tr className="align-top">
      <th className="border-b border-r border-border bg-surface p-3 text-left text-xs font-medium text-muted-foreground">
        {label}
      </th>
      {cells.map((cell, i) => (
        <td key={i} className="border-b border-r border-border bg-background p-3 last:border-r-0">
          {cell}
        </td>
      ))}
    </tr>
  );
}
