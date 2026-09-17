import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Search } from "lucide-react";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { StapleNav } from "@/components/suppcheck/StapleNav";
import { ProductCard } from "@/components/suppcheck/ProductCard";
import { ProductImage } from "@/components/suppcheck/ProductImage";
import { RankingDisclosure } from "@/components/suppcheck/RankingDisclosure";
import { productImageUrl } from "@/lib/productImages";
import { offersForRegion, productsForRegion, useRegion } from "@/lib/region";
import { useAffiliateHref } from "@/lib/consent";
import { useMoney } from "@/lib/market";
import {
  MEDICAL_DISCLAIMER,
  PRICE_AUTHORITY_NOTE,
  latestOfferUpdate,
  priceAsOfShort,
  valueMetric,
  type MerchantOffer,
  type Product,
} from "@/lib/suppcheck";
import type { Staple } from "@/lib/staples";

type SortKey = "value" | "price" | "name";

export function StapleComparison({ staple }: { staple: Staple }) {
  const { data: products, isLoading } = useQuery({
    queryKey: ["suppcheck", "products"],
    queryFn: async () => (await import("@/lib/suppcheck")).fetchProducts(),
    staleTime: 60_000,
  });
  const { region } = useRegion();
  const money = useMoney();
  const affiliateHref = useAffiliateHref();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("value");
  const [testedOnly, setTestedOnly] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const cheapest = (product: Product): MerchantOffer | undefined =>
    [...offersForRegion(product, region).offers].sort((a, b) => Number(a.price) - Number(b.price))[0];

  const rows = useMemo(() => {
    const regional = productsForRegion(products ?? [], region).filter(staple.matches);
    const q = search.trim().toLowerCase();
    const list = regional.filter((p) => {
      const matchesSearch =
        !q || `${p.name} ${p.brands.name} ${p.form}`.toLowerCase().includes(q);
      const matchesTested = !testedOnly || p.third_party_certifications.length > 0;
      return matchesSearch && matchesTested;
    });
    return list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "price")
        return (Number(cheapest(a)?.price) || Infinity) - (Number(cheapest(b)?.price) || Infinity);
      return (
        (valueMetric(a, cheapest(a))?.primaryValue ?? Infinity) -
        (valueMetric(b, cheapest(b))?.primaryValue ?? Infinity)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, region, search, sort, testedOnly, staple]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id].slice(0, 4)));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <p className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Catalogue</Link> › {staple.nav}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{staple.h1}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{staple.guide}</p>
        <StapleNav className="mt-5" />
        <RankingDisclosure className="mt-4 max-w-3xl" />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${staple.nav.toLowerCase()} products`}
              aria-label={`Search ${staple.nav} products`}
              className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            aria-label="Sort products"
            className="h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="value">Best value first</option>
            <option value="price">Cheapest first</option>
            <option value="name">A–Z</option>
          </select>
          <label className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={testedOnly} onChange={(event) => setTestedOnly(event.target.checked)} className="size-4" />
            Lab-tested only
          </label>
          {selected.length >= 2 && (
            <Link
              to="/compare"
              search={{ ids: selected.join(",") }}
              className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Compare {selected.length} side by side
            </Link>
          )}
        </div>

        {isLoading && <div className="mt-8 h-72 animate-pulse rounded-lg border border-border bg-surface" />}

        {!isLoading && rows.length === 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-sm font-medium">We are still verifying offers in this category.</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Verified retailer prices for {staple.nav.toLowerCase()} will appear here as soon as they pass our link and stock checks.
            </p>
            <Link to="/" className="mt-4 inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-medium hover:border-primary hover:text-primary">
              Browse the full catalogue
            </Link>
          </div>
        )}

        {rows.length > 0 && (
          <>
            {/* Phone: the standard product cards */}
            <div className="mt-6 grid grid-cols-1 gap-3 md:hidden">
              {rows.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  products={rows}
                  selected={selected.includes(product.id)}
                  selectionFull={selected.length >= 4}
                  onToggle={toggle}
                />
              ))}
            </div>

            {/* Desktop: scannable comparison table */}
            <div className="mt-6 hidden overflow-x-auto rounded-lg border border-border md:block">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead className="sticky top-16 z-10">
                  <tr className="bg-surface-raised text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="border-b border-border p-3">Product</th>
                    <th className="border-b border-border p-3">Form</th>
                    <th className="border-b border-border p-3">{staple.doseLabel}</th>
                    <th className="border-b border-border p-3">Value</th>
                    <th className="border-b border-border p-3">Retailer offers</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((product) => {
                    const resolved = offersForRegion(product, region);
                    const offers = [...resolved.offers].sort((a, b) => Number(a.price) - Number(b.price));
                    const metric = valueMetric(product, offers[0]);
                    return (
                      <tr key={product.id} className="align-top">
                        <td className="border-b border-border p-3">
                          <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-3">
                            <ProductImage
                              src={productImageUrl(product)}
                              alt={`${product.brands.name} ${product.name}`}
                              brand={product.brands.name}
                              className="aspect-square w-14"
                            />
                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{product.brands.name}</p>
                              <Link to="/products/$slug" params={{ slug: product.slug }} className="block font-semibold leading-snug hover:text-primary">
                                {product.name}
                              </Link>
                              {product.third_party_certifications.length > 0 && (
                                <p className="mt-1 text-[11px] text-primary">{product.third_party_certifications.join(" · ")}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-border p-3 capitalize text-muted-foreground">{product.form}</td>
                        <td className="border-b border-border p-3">
                          <span className="num font-semibold">{staple.dose(product)}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">per {product.serving_size || "serving"}</span>
                        </td>
                        <td className="border-b border-border p-3">
                          {metric ? (
                            <>
                              <span className="num block font-semibold">{money(metric.primaryValue, metric.currency)}</span>
                              <span className="block text-xs text-muted-foreground">{metric.primaryLabel}</span>
                              {metric.secondaryLabel && metric.secondaryValue != null && (
                                <span className="mt-1 block text-xs text-muted-foreground">
                                  {money(metric.secondaryValue, metric.currency)} {metric.secondaryLabel}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="border-b border-border p-3">
                          {offers.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No verified offer right now</span>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {offers.slice(0, 4).map((offer, index) => (
                                <div key={offer.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-2.5 py-2">
                                  <span className="min-w-0">
                                    <span className="block truncate text-xs font-semibold">{offer.merchant_name}</span>
                                    <span className="block text-[10px] text-muted-foreground">
                                      {offer.in_stock ? "In stock" : "Out of stock"}
                                      {index === 0 ? " · Best price" : ""}
                                    </span>
                                  </span>
                                  <span className="flex shrink-0 items-center gap-2">
                                    <span className="num text-sm font-semibold">{money(Number(offer.price), offer.currency)}</span>
                                    <a
                                      href={affiliateHref(offer.id)}
                                      rel="sponsored nofollow"
                                      target="_blank"
                                      className="inline-flex min-h-9 items-center gap-1 rounded-md bg-primary px-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                                    >
                                      Check price <ExternalLink className="size-3" />
                                    </a>
                                  </span>
                                </div>
                              ))}
                              <p className="text-[10px] text-muted-foreground">{priceAsOfShort(latestOfferUpdate(offers))}</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">{PRICE_AUTHORITY_NOTE}</p>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">{MEDICAL_DISCLAIMER}</p>
      </main>
    </div>
  );
}
