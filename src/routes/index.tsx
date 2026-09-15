import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { Filter, GitCompareArrows, Info, Search, ShieldCheck, X } from "lucide-react";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { ProductCard } from "@/components/suppcheck/ProductCard";
import { NewsletterSignup } from "@/components/suppcheck/NewsletterSignup";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  CERT_FILTERS,
  FORM_FILTERS,
  chemicalForm,
  costPer100mgElemental,
  productsQuery,
  type Product,
} from "@/lib/suppcheck";
import { productsForRegion, useRegion } from "@/lib/region";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "i-Supplement — Clinical Lab-Verified Supplement Comparison" },
      {
        name: "description",
        content:
          "Compare elemental magnesium yields, carrier molecules, excipients, third-party assays and live iHerb, Amazon.de and EU pharmacy pricing.",
      },
      { property: "og:title", content: "i-Supplement — Clinical Lab-Verified Supplement Comparison" },
      {
        property: "og:description",
        content:
          "Elemental yields, chelation integrity and normalised cost per 100 mg across European and US merchants.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function togglePill(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

type SortKey = "featured" | "price" | "value" | "elemental" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price", label: "Cheapest first" },
  { value: "value", label: "Best value per 100 mg" },
  { value: "elemental", label: "Most elemental per serving" },
  { value: "name", label: "A–Z" },
];

function sortProducts(list: Product[], sort: SortKey): Product[] {
  const sorted = [...list];
  switch (sort) {
    case "price":
      return sorted.sort((a, b) => {
        const pa = a.merchant_offers.length
          ? Math.min(...a.merchant_offers.map((o) => Number(o.price)))
          : Infinity;
        const pb = b.merchant_offers.length
          ? Math.min(...b.merchant_offers.map((o) => Number(o.price)))
          : Infinity;
        return pa - pb;
      });
    case "value":
      return sorted.sort(
        (a, b) => (costPer100mgElemental(a) ?? Infinity) - (costPer100mgElemental(b) ?? Infinity),
      );
    case "elemental":
      return sorted.sort((a, b) => {
        const ea = a.product_ingredients.reduce((s, pi) => s + Number(pi.elemental_amount_mg), 0);
        const eb = b.product_ingredients.reduce((s, pi) => s + Number(pi.elemental_amount_mg), 0);
        return eb - ea;
      });
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

function FilterOption({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 py-1.5 text-sm">
      <Checkbox checked={active} onCheckedChange={onClick} className="mt-0.5" />
      <span className="min-w-0 flex-1 leading-snug">{label}</span>
      <span className="num text-xs text-muted-foreground">{count}</span>
    </label>
  );
}

function HomePage() {
  const { data: products, isLoading, error } = useQuery(productsQuery);
  const { region } = useRegion();
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [forms, setForms] = useState<string[]>([]);
  const [certs, setCerts] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const regional = useMemo(() => productsForRegion(products ?? [], region), [products, region]);

  const filtered = useMemo(() => {
    const list: Product[] = regional;
    const q = search.trim().toLowerCase();
    return list.filter((p) => {
      const form = chemicalForm(p).toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brands.name.toLowerCase().includes(q) ||
        p.category_path.join(" ").toLowerCase().includes(q) ||
        form.includes(q);
      const matchesCategory = !categories.length || categories.includes(p.category_path.join(" › "));
      const matchesForm =
        !forms.length || forms.some((f) => form.includes(f.toLowerCase().split(" (")[0]!));
      const matchesCert =
        !certs.length || certs.some((c) => p.third_party_certifications.includes(c));
      return matchesSearch && matchesCategory && matchesForm && matchesCert;
    });
  }, [regional, search, categories, forms, certs]);

  const activeFilters = categories.length + forms.length + certs.length;
  const categoryFilters = useMemo(
    () => Array.from(new Set((products ?? []).map((product) => product.category_path.join(" › ")))).sort(),
    [products],
  );
  const countCategory = (value: string) => (products ?? []).filter((product) => product.category_path.join(" › ") === value).length;
  const countForm = (value: string) => (products ?? []).filter((product) => chemicalForm(product).toLowerCase().includes(value.toLowerCase().split(" (")[0] ?? "")).length;
  const countCert = (value: string) => (products ?? []).filter((product) => product.third_party_certifications.includes(value)).length;
  const filters = (
    <FilterPanel
      categories={categories}
      forms={forms}
      certs={certs}
      categoryFilters={categoryFilters}
      countCategory={countCategory}
      countForm={countForm}
      countCert={countCert}
      setCategories={setCategories}
      setForms={setForms}
      setCerts={setCerts}
    />
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      <SiteHeader />

      <section className="grid-noise border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <ShieldCheck className="size-4" />
            Clinical transparency, not marketing claims
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-5xl">
            Clinical Lab-Verified Supplement Comparison
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Elemental yields separated from gross compound weight, carrier molecules and chelation
            integrity, full excipient disclosure, and live pricing across iHerb, Amazon.de and EU
            pharmacy networks.
          </p>

          <div className="relative mt-8 max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by brand, product or chemical form (e.g. bisglycinate)"
              className="w-full rounded-lg border border-border bg-surface py-3 pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">{filters}</div>
        </aside>
        <section className="min-w-0">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <p className="num text-xs text-muted-foreground">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
            {activeFilters > 0 ? ` · ${activeFilters} filters active` : ""}
          </p>
          <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="sm" className="lg:hidden"><Filter /> Filters{activeFilters ? ` (${activeFilters})` : ""}</Button></SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <SheetHeader><SheetTitle>Filter products</SheetTitle></SheetHeader>
              <div className="mt-6">{filters}</div>
            </SheetContent>
          </Sheet>
          {activeFilters > 0 && (
            <button
              type="button"
              onClick={() => {
                setCategories([]);
                setForms([]);
                setCerts([]);
              }}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Reset filters
            </button>
          )}
          </div>
        </div>

        {isLoading && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg border border-border bg-surface" />
            ))}
          </div>
        )}

        {error && (
          <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            The catalog could not be loaded. Please refresh and try again.
          </p>
        )}

        {!isLoading && !error && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                selected={selected.includes(p.id)}
                selectionFull={selected.length >= 4}
                onToggle={(id) =>
                  setSelected((prev) =>
                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                  )
                }
              />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No products match these filters.
              </p>
            )}
          </div>
        )}
        </section>
        <NewsletterSignup />
      </main>

      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="num flex size-7 items-center justify-center rounded-md bg-primary/15 text-sm font-semibold text-primary">
                {selected.length}
              </span>
              <p className="text-sm text-muted-foreground">
                {selected.length < 2
                  ? "Select at least 2 products to compare"
                  : "Ready to compare"}
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="ml-3 text-xs underline-offset-4 hover:text-foreground hover:underline"
                >
                  Clear
                </button>
              </p>
            </div>
            {selected.length >= 2 ? (
              <Link
                to="/compare"
                search={{ ids: selected.join(",") }}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <GitCompareArrows className="size-4" />
                Compare selected products
              </Link>
            ) : (
              <span className="flex cursor-not-allowed items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-muted-foreground">
                <GitCompareArrows className="size-4" />
                Compare selected products
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-border py-4 first:border-t-0 first:pt-0">
      <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</legend>
      <div>{children}</div>
    </fieldset>
  );
}

type FilterPanelProps = {
  categories: string[]; forms: string[]; certs: string[]; categoryFilters: string[];
  countCategory: (value: string) => number; countForm: (value: string) => number; countCert: (value: string) => number;
  setCategories: (values: string[]) => void; setForms: (values: string[]) => void; setCerts: (values: string[]) => void;
};

function FilterPanel(props: FilterPanelProps) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2"><Filter className="size-4 text-primary" /><h2 className="text-sm font-semibold">Refine catalogue</h2></div>
      <FilterGroup label="Category">{props.categoryFilters.map((value) => <FilterOption key={value} label={value} count={props.countCategory(value)} active={props.categories.includes(value)} onClick={() => props.setCategories(togglePill(props.categories, value))} />)}</FilterGroup>
      <FilterGroup label="Chemical form">{FORM_FILTERS.map((value) => <FilterOption key={value} label={value} count={props.countForm(value)} active={props.forms.includes(value)} onClick={() => props.setForms(togglePill(props.forms, value))} />)}</FilterGroup>
      <FilterGroup label="Certification">{CERT_FILTERS.map((value) => <FilterOption key={value} label={value} count={props.countCert(value)} active={props.certs.includes(value)} onClick={() => props.setCerts(togglePill(props.certs, value))} />)}</FilterGroup>
    </div>
  );
}
