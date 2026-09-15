import { Link } from "@tanstack/react-router";
import { FlaskConical, GitCompareArrows, ShoppingBasket } from "lucide-react";
import { useBasket } from "@/lib/basket";
import { REGIONS, useRegion, type RegionCode } from "@/lib/region";

export function SiteHeader() {
  const { totalItems } = useBasket();
  const { region, setRegion } = useRegion();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <FlaskConical className="size-4" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            i-<span className="text-primary">Supplement</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <label className="mr-1 hidden items-center gap-1.5 sm:flex">
            <span className="sr-only">Deliver to</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as RegionCode)}
              aria-label="Deliver to"
              className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  Deliver to: {r.label}
                </option>
              ))}
            </select>
          </label>
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground" }}
          >
            Catalog
          </Link>
          <Link
            to="/compare"
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            activeProps={{ className: "text-primary border-primary/50" }}
          >
            <GitCompareArrows className="size-3.5" />
            Compare
          </Link>
          <Link
            to="/basket"
            aria-label={`Basket with ${totalItems} items`}
            className="relative flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            activeProps={{ className: "text-primary border-primary/50" }}
          >
            <ShoppingBasket className="size-4" />
            {totalItems > 0 && <span className="num absolute -right-1.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{totalItems}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
