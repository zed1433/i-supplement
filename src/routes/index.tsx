import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { GitCompareArrows, Search, ShieldCheck, X } from "lucide-react";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { ProductCard } from "@/components/suppcheck/ProductCard";
import {
  CATEGORY_FILTERS,
  CERT_FILTERS,
  FORM_FILTERS,
  chemicalForm,
  productsQuery,
  type Product,
} from "@/lib/suppcheck";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SuppCheck — Clinical Lab-Verified Supplement Comparison" },
      {
        name: "description",
        content:
          "Compare elemental magnesium yields, carrier molecules, excipients, third-party assays and live iHerb, Amazon.de and EU pharmacy pricing.",
      },
      { property: "og:title", content: "SuppCheck — Clinical Lab-Verified Supplement Comparison" },
      {
        property: "og:description",
        content:
          "Elemental yields, chelation integrity and normalised cost per 100 mg across European and US merchants.",
      },
    ],
  }),
  component: HomePage,
});

function togglePill(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function HomePage() {
  const { data: products, isLoading, error } = useQuery(productsQuery);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [forms, setForms] = useState<string[]>([]);
  const [certs, setCerts] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const list: Product[] = products ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((p) => {
      const form = chemicalForm(p).toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brands.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        form.includes(q);
      const matchesCategory = !categories.length || categories.includes(p.category);
      const matchesForm =
        !forms.length || forms.some((f) => form.includes(f.toLowerCase().split(" (")[0]!));
      const matchesCert =
        !certs.length || certs.some((c) => p.third_party_certifications.includes(c));
      return matchesSearch && matchesCategory && matchesForm && matchesCert;
    });
  }, [products, search, categories, forms, certs]);

  const activeFilters = categories.length + forms.length + certs.length;

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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="space-y-3">
          <FilterRow label="Category">
            <Pill
              label="All"
              active={categories.length === 0}
              onClick={() => setCategories([])}
            />
            {CATEGORY_FILTERS.map((c) => (
              <Pill
                key={c}
                label={c}
                active={categories.includes(c)}
                onClick={() => setCategories(togglePill(categories, c))}
              />
            ))}
          </FilterRow>
          <FilterRow label="Chemical form">
            {FORM_FILTERS.map((f) => (
              <Pill
                key={f}
                label={f}
                active={forms.includes(f)}
                onClick={() => setForms(togglePill(forms, f))}
              />
            ))}
          </FilterRow>
          <FilterRow label="Certification">
            {CERT_FILTERS.map((c) => (
              <Pill
                key={c}
                label={c}
                active={certs.includes(c)}
                onClick={() => setCerts(togglePill(certs, c))}
              />
            ))}
          </FilterRow>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <p className="num text-xs text-muted-foreground">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
            {activeFilters > 0 ? ` · ${activeFilters} filters active` : ""}
          </p>
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

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-28 shrink-0 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
