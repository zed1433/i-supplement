import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  ChevronDown,
  CircleSlash,
  ExternalLink,
  Info,
  PackageCheck,
  ThumbsUp,
  Truck,
} from "lucide-react";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { ProductImage } from "@/components/suppcheck/ProductImage";
import { isIllustrativeImage, productImageUrl } from "@/lib/productImages";
import { RetailerActions } from "@/components/suppcheck/RetailerActions";
import { SynergyCard } from "@/components/suppcheck/SynergyCard";
import { Button } from "@/components/ui/button";
import {
  AFFILIATE_DISCLOSURE,
  CERT_EXPLANATIONS,
  chemicalForm,
  priceAsOfLong,
  elementalPerServing,
    primaryIngredient,
  productQuery,
  productsQuery,
  valueMetric,
  type Product,
} from "@/lib/suppcheck";
import { useMoney } from "@/lib/market";
import { offerShipsTo, useRegion, type RegionCode } from "@/lib/region";
import { useAffiliateHref } from "@/lib/consent";

export const Route = createFileRoute("/products/$slug")({
  staticData: { sitemap: true },
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productQuery(params.slug)),
      context.queryClient.ensureQueryData(productsQuery),
    ]),
  head: ({ params }) => {
    const readable = params.slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
    const title = `${readable} — Clinical Breakdown | i-Supplement`;
    const description = `Elemental yield, carrier molecule, excipients, tolerance profile and live multi-retailer pricing for ${readable}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const affiliateHref = useAffiliateHref();
  const { slug } = Route.useParams();
  const money = useMoney();
  const { data: product, isLoading } = useQuery(productQuery(slug));
  const { data: allProducts } = useQuery(productsQuery);
  const { region } = useRegion();
  const [openMechanism, setOpenMechanism] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="h-96 animate-pulse rounded-lg border border-border bg-surface" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  const pi = primaryIngredient(product);
  const ingredient = pi?.ingredients;
  const offers = product.merchant_offers
    .filter((o) => o.in_stock && o.link_verified && offerShipsTo(o, region))
    .sort((a, b) => Number(a.price) - Number(b.price));
  const metric = valueMetric(product, offers[0]);
  const alternatives = (allProducts ?? []).filter(
    (p) => p.id !== product.id && p.category === product.category,
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <SiteHeader />

      <section className="grid-noise border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Link
            to="/"
            className="text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
          >
            ← Catalog
          </Link>
          <div className="mt-6 grid gap-8 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start">
            <div>
              <ProductImage
                src={productImageUrl(product)}
                alt={`${product.brands.name} ${product.name}`}
                brand={product.brands.name}
                className="aspect-square w-full"
                eager
              />
              {isIllustrativeImage(product) && (
                <p className="mt-1 text-center text-[10px] text-muted-foreground">
                  Illustrative image — retailer photo will replace it
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                {product.brands.name} · {product.brands.country_of_origin}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{product.category_path.join(" › ")}</p>
              <h1 className="mt-2 max-w-3xl text-3xl font-semibold sm:text-4xl">{product.name}</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {product.form} · {product.serving_size} · {chemicalForm(product)} ·{" "}
                <span className="num text-foreground">{elementalPerServing(product)} mg</span> elemental
                per serving
                {metric && (
                  <>
                    {" "}
                    · <span className="num text-foreground">{money(metric.primaryValue, metric.currency)}</span> {metric.primaryLabel.toLowerCase()}
                  </>
                )}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {(product.third_party_certifications.length
                  ? product.third_party_certifications
                  : ["None"]
                ).map((cert) => (
                  <span
                    key={cert}
                    title={CERT_EXPLANATIONS[cert] ?? "Third-party programme."}
                    className="group relative flex cursor-help items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs text-primary"
                  >
                    <BadgeCheck className="size-3.5" />
                    {cert}
                    <span className="pointer-events-none absolute left-0 top-full z-30 mt-2 w-72 rounded-md border border-border bg-popover p-3 text-xs leading-relaxed text-popover-foreground opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                      {CERT_EXPLANATIONS[cert] ?? "Third-party programme."}
                    </span>
                  </span>
                ))}
              </div>
              <div className="mt-5"><RetailerActions product={product} /></div>
              <div className="mt-5"><SynergyCard product={product} products={allProducts ?? []} /></div>
            </div>
          </div>
        </div>
      </section>

      {/* At a glance */}
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <div className="grid gap-4 rounded-lg border border-border bg-surface p-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">What it is</p>
            <p className="mt-1 text-sm leading-relaxed">{product.primary_benefit}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Who it suits</p>
            <p className="mt-1 text-sm leading-relaxed">{ingredient?.target_benefits.slice(0, 3).join(", ") || "General wellness support"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Best price today</p>
            <p className="mt-1 text-sm">
              {(() => {
                const cheapest = offers[0];
                return cheapest ? (
                  <>
                    <span className="num font-semibold text-primary">{money(cheapest.price, cheapest.currency)}</span>{" "}
                    at {cheapest.merchant_name} <span className="text-muted-foreground">({cheapest.country_flag})</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">No offers ship to your region</span>
                );
              })()}
            </p>
          </div>
        </div>

        {/* Advantages / trade-offs */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ThumbsUp className="size-4" /> Verified clinical advantages
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-foreground/90">
              {product.verified_advantages.map((a) => (
                <li key={a} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-warning">
              <AlertTriangle className="size-4" /> Trade-offs & compromises
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-foreground/90">
              {product.trade_offs.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Merchant table */}
        <section>
          <h2 className="text-lg font-semibold">Multi-store price comparison</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-surface-raised text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="p-3">Merchant</th>
                  <th className="p-3">Base price</th>
                  <th className="p-3">Shipping</th>
                  <th className="p-3">Delivery</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.id} className="border-t border-border bg-surface/40">
                    <td className="p-3 font-medium">
                      {o.merchant_name}
                      <span className="ml-2 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {o.country_flag}
                      </span>
                    </td>
                    <td className="num p-3 font-semibold">{money(o.price, o.currency)}</td>
                    <td className="num p-3 text-muted-foreground">
                      {Number(o.shipping_cost) === 0
                        ? "Free"
                        : money(o.shipping_cost, o.currency)}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Truck className="size-3.5" />
                        {o.estimated_delivery}
                      </span>
                    </td>
                    <td className="p-3">
                      {o.in_stock ? (
                        <span className="flex items-center gap-1.5 text-primary">
                          <PackageCheck className="size-3.5" /> In stock
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <CircleSlash className="size-3.5" /> Out of stock
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {o.in_stock && o.link_verified ? (
                        <Button asChild size="sm">
                          <a
                            href={affiliateHref(o.id)}
                            rel="nofollow sponsored"
                            target="_blank"
                          >
                            View on {o.merchant_name} <ExternalLink />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Link unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {offers[0] && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              {priceAsOfLong(offers[0].updated_at)}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            {AFFILIATE_DISCLOSURE} Buttons take you to the named retailer's own site to complete
            your purchase.
          </p>
        </section>

        {/* Biochemical facts */}
        {ingredient && pi && (
          <section>
            <h2 className="text-lg font-semibold">Biochemical facts panel</h2>
            <div className="mt-3 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
              <Stat label="Gross compound" value={`${pi.gross_amount_mg} mg`} />
              <Stat
                label="Elemental active"
                value={`${pi.elemental_amount_mg} mg`}
                highlight
              />
              <Stat label="% Daily value" value={`${pi.percent_daily_value}%`} />
              <Stat label="Bioavailability" value={pi.bioavailability_score} />
            </div>

            <div className="mt-4 rounded-lg border border-border bg-surface">
              <button
                type="button"
                onClick={() => setOpenMechanism((v) => !v)}
                className="flex min-h-11 w-full items-center justify-between p-4 text-left text-sm font-semibold"
              >
                Mechanism & pharmacokinetic pathway — {ingredient.chemical_form}
                <ChevronDown
                  className={`size-4 transition-transform ${openMechanism ? "rotate-180" : ""}`}
                />
              </button>
              {openMechanism && (
                <div className="space-y-4 border-t border-border p-4 text-sm leading-relaxed text-muted-foreground">
                  <p>{ingredient.mechanism_of_action}</p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <ListBlock
                      title="Target benefits"
                      items={ingredient.target_benefits}
                      tone="primary"
                    />
                    <ListBlock
                      title="GI tolerance & side effects"
                      items={ingredient.potential_side_effects}
                      tone="warning"
                    />
                    <ListBlock
                      title="Renal & other contraindications"
                      items={ingredient.contraindications}
                      tone="destructive"
                    />
                  </div>
                  <p className="flex items-start gap-2 rounded-md border border-border bg-surface-raised p-3 text-xs">
                    <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    Upper tolerable intake: {ingredient.upper_tolerable_limit}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-lg border border-border bg-surface p-4">
              <h3 className="text-sm font-semibold">Full excipient & inactive additive disclosure</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(product.excipients.length ? product.excipients : ["None declared"]).map((e) => (
                  <span
                    key={e}
                    className="rounded border border-border bg-surface-raised px-2 py-1 text-xs text-muted-foreground"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold">Similar alternatives</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Same category, different carrier economics.
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {alternatives.map((alt) => (
                <AltCard key={alt.id} product={alt} base={product} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-surface p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`num mt-1 text-xl font-semibold ${highlight ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function ListBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "primary" | "warning" | "destructive";
}) {
  const dot =
    tone === "primary" ? "bg-primary" : tone === "warning" ? "bg-warning" : "bg-destructive";
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</p>
      <ul className="mt-2 space-y-1.5 text-xs">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className={`mt-1.5 size-1 shrink-0 rounded-full ${dot}`} />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

type Diff = { text: string; tone: "good" | "bad" | "neutral" };

/** Plain-language differences between an alternative and the product in view. */
function compareToBase(base: Product, alt: Product, region: RegionCode): Diff[] {
  const diffs: Diff[] = [];
  const pick = (p: Product) =>
    p.merchant_offers
      .filter((o) => o.in_stock && o.link_verified && offerShipsTo(o, region))
      .sort((a, b) => Number(a.price) - Number(b.price))[0];
  const baseMetric = valueMetric(base, pick(base));
  const altMetric = valueMetric(alt, pick(alt));

  if (baseMetric && altMetric && baseMetric.primaryLabel === altMetric.primaryLabel) {
    const delta = altMetric.primaryValue - baseMetric.primaryValue;
    const pct = Math.round((Math.abs(delta) / baseMetric.primaryValue) * 100);
    if (pct >= 1) {
      diffs.push({
        text: `${pct}% ${delta < 0 ? "cheaper" : "dearer"} ${altMetric.primaryLabel.toLowerCase()}`,
        tone: delta < 0 ? "good" : "bad",
      });
    } else {
      diffs.push({ text: `Same ${altMetric.primaryLabel.toLowerCase()}`, tone: "neutral" });
    }
  }

  const baseDose = elementalPerServing(base);
  const altDose = elementalPerServing(alt);
  if (baseDose > 0 && altDose > 0 && altDose !== baseDose) {
    diffs.push({
      text: `${altDose > baseDose ? "Higher" : "Lower"} elemental dose (${altDose} mg vs ${baseDose} mg)`,
      tone: altDose > baseDose ? "good" : "bad",
    });
  }

  if (base.total_servings && alt.total_servings && alt.total_servings !== base.total_servings) {
    diffs.push({
      text: `${alt.total_servings > base.total_servings ? "More" : "Fewer"} servings per pack (${alt.total_servings} vs ${base.total_servings})`,
      tone: alt.total_servings > base.total_servings ? "good" : "bad",
    });
  }

  const extraCerts = alt.third_party_certifications.filter(
    (c) => c !== "None" && !base.third_party_certifications.includes(c),
  );
  const missingCerts = base.third_party_certifications.filter(
    (c) => c !== "None" && !alt.third_party_certifications.includes(c),
  );
  if (extraCerts.length) diffs.push({ text: `Adds ${extraCerts.join(", ")}`, tone: "good" });
  else if (missingCerts.length)
    diffs.push({ text: `No ${missingCerts.join(", ")}`, tone: "bad" });

  if (chemicalForm(alt) !== chemicalForm(base))
    diffs.push({ text: `Different carrier: ${chemicalForm(alt)}`, tone: "neutral" });

  return diffs.slice(0, 4);
}

function AltCard({ product, base }: { product: Product; base: Product }) {
  const { region } = useRegion();
  const money = useMoney();
  const offer = product.merchant_offers
    .filter((item) => item.in_stock && item.link_verified && offerShipsTo(item, region))
    .sort((a, b) => Number(a.price) - Number(b.price))[0];
  const metric = valueMetric(product, offer);
  const diffs = compareToBase(base, product, region);

  return (
    <article className="flex flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/50">
      <Link to="/products/$slug" params={{ slug: product.slug }} className="flex gap-3">
        <ProductImage
          src={productImageUrl(product)}
          alt={`${product.brands.name} ${product.name}`}
          brand={product.brands.name}
          className="size-20 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {product.brands.name}
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug">{product.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{chemicalForm(product)}</p>
          {offer ? (
            <p className="num mt-1.5 text-sm font-semibold text-primary">
              {money(offer.price, offer.currency)}
              {metric ? (
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  · {money(metric.primaryValue, metric.currency)}{" "}
                  {metric.primaryLabel.toLowerCase()}
                </span>
              ) : null}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">
              No verified offer ships to your region
            </p>
          )}
        </div>
      </Link>

      <ul className="mt-3 space-y-1 text-xs">
        {diffs.map((d) => (
          <li
            key={d.text}
            className={`flex gap-1.5 ${
              d.tone === "good"
                ? "text-primary"
                : d.tone === "bad"
                  ? "text-muted-foreground"
                  : "text-muted-foreground"
            }`}
          >
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-current" />
            {d.text}
          </li>
        ))}
        {!diffs.length && (
          <li className="text-muted-foreground">Comparable specification to this product.</li>
        )}
      </ul>

      <div className="mt-3">
        <RetailerActions product={product} compact />
      </div>
    </article>
  );
}
