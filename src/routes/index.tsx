import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  FlaskConical,
  GitCompareArrows,
  Info,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Tag,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { ProductCard } from "@/components/suppcheck/ProductCard";
import { NewsletterSignup } from "@/components/suppcheck/NewsletterSignup";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  CERT_FILTERS,
  
  chemicalForm,
  costPer100mgElemental,
  productsQuery,
  type Product,
} from "@/lib/suppcheck";
import { productsForRegion, useRegion } from "@/lib/region";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
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

function groupOf(p: Product) {
  return p.category_path[1] ?? p.category_path[0] ?? "Other";
}
function nutrientOf(p: Product) {
  return p.category_path[2] ?? p.category;
}
function formOf(p: Product) {
  return p.category_path[3] ?? chemicalForm(p);
}

function HomePage() {
  const { data: products, isLoading, error, refetch } = useQuery(productsQuery);
  const reduceMotion = useReducedMotion();
  const { region } = useRegion();
  const [search, setSearch] = useState("");
  const [certs, setCerts] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("featured");
  const [group, setGroup] = useState<string | null>(null);
  const [nutrient, setNutrient] = useState<string | null>(null);
  const [form, setForm] = useState<string | null>(null);

  const regional = useMemo(() => productsForRegion(products ?? [], region), [products, region]);

  const filtered = useMemo(() => {
    const list: Product[] = regional;
    const q = search.trim().toLowerCase();
    return sortProducts(
      list.filter((p) => {
        const chem = chemicalForm(p).toLowerCase();
        const matchesSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.brands.name.toLowerCase().includes(q) ||
          p.category_path.join(" ").toLowerCase().includes(q) ||
          chem.includes(q);
        const matchesGroup = !group || groupOf(p) === group;
        const matchesNutrient = !nutrient || nutrientOf(p) === nutrient;
        const matchesForm = !form || formOf(p) === form;
        const matchesCert =
          !certs.length || certs.some((c) => p.third_party_certifications.includes(c));
        return matchesSearch && matchesGroup && matchesNutrient && matchesForm && matchesCert;
      }),
      sort,
    );
  }, [regional, search, certs, sort, group, nutrient, form]);

  const activeFilters =
    certs.length + (group ? 1 : 0) + (nutrient ? 1 : 0) + (form ? 1 : 0);

  const all = products ?? [];
  const groups = useMemo(
    () => Array.from(new Set(all.map(groupOf))).sort(),
    [products],
  );
  const nutrients = useMemo(
    () =>
      group
        ? Array.from(new Set(all.filter((p) => groupOf(p) === group).map(nutrientOf))).sort()
        : [],
    [products, group],
  );
  const formOptions = useMemo(
    () =>
      nutrient
        ? Array.from(
            new Set(
              all
                .filter((p) => groupOf(p) === group && nutrientOf(p) === nutrient)
                .map(formOf),
            ),
          ).sort()
        : [],
    [products, group, nutrient],
  );

  const countGroup = (value: string) => all.filter((p) => groupOf(p) === value).length;
  const countNutrient = (value: string) =>
    all.filter((p) => groupOf(p) === group && nutrientOf(p) === value).length;
  const countForm = (value: string) =>
    all.filter((p) => groupOf(p) === group && nutrientOf(p) === nutrient && formOf(p) === value)
      .length;
  const countCert = (value: string) =>
    all.filter((p) => p.third_party_certifications.includes(value)).length;

  const selectGroup = (value: string | null) => {
    setGroup(value);
    setNutrient(null);
    setForm(null);
  };
  const selectNutrient = (value: string | null) => {
    setNutrient(value);
    setForm(null);
  };

  const filters = (
    <FilterPanel
      group={group}
      nutrient={nutrient}
      form={form}
      groups={groups}
      nutrients={nutrients}
      formOptions={formOptions}
      countGroup={countGroup}
      countNutrient={countNutrient}
      countForm={countForm}
      countCert={countCert}
      certs={certs}
      setCerts={setCerts}
      selectGroup={selectGroup}
      selectNutrient={selectNutrient}
      setForm={setForm}
    />
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      <SiteHeader />

      <section className="grid-noise border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <ShieldCheck className="size-4" />
            Lab-verified. Every batch, every claim.
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
            Find and buy the best lab-tested supplements.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
            One place for what actually works, at the best price we can find — real elemental doses,
            real third-party testing, no marketing claims.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#catalogue"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse supplements
              <ChevronRight className="size-4" />
            </a>
            <Link
              to="/affiliate-disclosure"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              How we verify
            </Link>
          </div>

          <div className="relative mt-8 max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search magnesium, vitamin D, omega-3…"
              className="w-full rounded-xl border border-border bg-surface py-4 pl-11 pr-10 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
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

          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: ShieldCheck, label: "Third-party tested" },
              { icon: FlaskConical, label: "Elemental dose shown" },
              { icon: Tag, label: "Live retailer prices" },
              { icon: ShoppingBasket, label: "One basket, any retailer" },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs font-medium text-foreground"
              >
                <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <div
            id="catalogue"
            className="mt-8 flex scroll-mt-24 flex-wrap gap-2"
            role="group"
            aria-label="Browse by category"
          >
            <button
              type="button"
              onClick={() => selectGroup(null)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                group === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              All
            </button>
            {groups.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => selectGroup(group === cat ? null : cat)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  group === cat
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {cat} <span className="num opacity-70">{countGroup(cat)}</span>
              </button>
            ))}
          </div>

          {group && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <button type="button" onClick={() => selectGroup(null)} className="hover:text-foreground">
                All supplements
              </button>
              <span>›</span>
              <button
                type="button"
                onClick={() => selectNutrient(null)}
                className={nutrient ? "hover:text-foreground" : "font-semibold text-foreground"}
              >
                {group}
              </button>
              {nutrient && (
                <>
                  <span>›</span>
                  <button
                    type="button"
                    onClick={() => setForm(null)}
                    className={form ? "hover:text-foreground" : "font-semibold text-foreground"}
                  >
                    {nutrient}
                  </button>
                </>
              )}
              {form && (
                <>
                  <span>›</span>
                  <span className="font-semibold text-foreground">{form}</span>
                </>
              )}
            </div>
          )}

          <p className="mt-6 flex max-w-2xl items-start gap-2 rounded-lg border border-border bg-surface/60 p-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>
              <strong className="font-semibold text-foreground">How to read this:</strong> "Elemental" is the
              amount your body actually absorbs per serving — it can be far less than the label's compound
              weight. "Cost / 100 mg elemental" lets you compare products with different strengths fairly.
              Every certification badge is explained on hover.
            </span>
          </p>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-5 animate-pulse rounded bg-surface" />
                ))}
              </div>
            ) : (
              filters
            )}
          </div>
        </aside>
        <section className="min-w-0">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <p className="num text-xs text-muted-foreground">
            {isLoading
              ? "Loading catalogue…"
              : `${filtered.length} product${filtered.length === 1 ? "" : "s"}${
                  activeFilters > 0 ? ` · ${activeFilters} filters active` : ""
                }`}
          </p>
          <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary/60"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
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
                selectGroup(null);
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
          <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <p className="text-foreground">We could not load the catalogue just now.</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !error && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {filtered.map((p) => (
                <motion.div
                  key={p.id}
                  layout={reduceMotion ? false : "position"}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                  transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  <ProductCard
                    product={p}
                    selected={selected.includes(p.id)}
                    selectionFull={selected.length >= 4}
                    onToggle={(id) =>
                      setSelected((prev) =>
                        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                      )
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
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

function BrowseRow({
  label,
  count,
  active,
  onClick,
  chevron,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  chevron?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors ${
        active
          ? "bg-primary/15 font-semibold text-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      }`}
    >
      <span className="min-w-0 flex-1 leading-snug">{label}</span>
      <span className="num text-xs text-muted-foreground">{count}</span>
      {chevron && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />}
    </button>
  );
}

type FilterPanelProps = {
  group: string | null;
  nutrient: string | null;
  form: string | null;
  groups: string[];
  nutrients: string[];
  formOptions: string[];
  countGroup: (value: string) => number;
  countNutrient: (value: string) => number;
  countForm: (value: string) => number;
  countCert: (value: string) => number;
  certs: string[];
  setCerts: (values: string[]) => void;
  selectGroup: (value: string | null) => void;
  selectNutrient: (value: string | null) => void;
  setForm: (value: string | null) => void;
};

function FilterPanel(props: FilterPanelProps) {
  const { group, nutrient, form } = props;
  const reduceMotion = useReducedMotion();
  const level = !group ? 0 : !nutrient ? 1 : 2;
  const slide = reduceMotion ? 0 : 14;
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Filter className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">Browse</h2>
      </div>

      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={`${level}-${group ?? ""}-${nutrient ?? ""}`}
          initial={{ opacity: 0, x: slide }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -slide }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
      {!group && (
        <FilterGroup label="Category">
          {props.groups.map((value) => (
            <BrowseRow
              key={value}
              label={value}
              count={props.countGroup(value)}
              active={false}
              chevron
              onClick={() => props.selectGroup(value)}
            />
          ))}
        </FilterGroup>
      )}

      {group && !nutrient && (
        <FilterGroup label={group}>
          <button
            type="button"
            onClick={() => props.selectGroup(null)}
            className="mb-1 flex items-center gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" /> All categories
          </button>
          {props.nutrients.map((value) => (
            <BrowseRow
              key={value}
              label={value}
              count={props.countNutrient(value)}
              active={false}
              chevron
              onClick={() => props.selectNutrient(value)}
            />
          ))}
        </FilterGroup>
      )}

      {group && nutrient && (
        <FilterGroup label={`${nutrient} — form`}>
          <button
            type="button"
            onClick={() => props.selectNutrient(null)}
            className="mb-1 flex items-center gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" /> Back to {group}
          </button>
          <BrowseRow
            label="All forms"
            count={props.formOptions.reduce((s, v) => s + props.countForm(v), 0)}
            active={!form}
            onClick={() => props.setForm(null)}
          />
          {props.formOptions.map((value) => (
            <BrowseRow
              key={value}
              label={value}
              count={props.countForm(value)}
              active={form === value}
              onClick={() => props.setForm(form === value ? null : value)}
            />
          ))}
        </FilterGroup>
      )}
        </motion.div>
      </AnimatePresence>


      <FilterGroup label="Certification">
        {CERT_FILTERS.map((value) => (
          <FilterOption
            key={value}
            label={value}
            count={props.countCert(value)}
            active={props.certs.includes(value)}
            onClick={() => props.setCerts(togglePill(props.certs, value))}
          />
        ))}
      </FilterGroup>
    </div>
  );
}
