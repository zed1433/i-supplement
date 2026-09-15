import { Link, useRouterState } from "@tanstack/react-router";
import { FlaskConical, GitCompareArrows, MapPin, Search, ShoppingBasket } from "lucide-react";
import { useState } from "react";
import { useBasket } from "@/lib/basket";
import { REGIONS, useRegion, type RegionCode } from "@/lib/region";
import { AffiliateNotice } from "@/components/suppcheck/AffiliateNotice";

export function SiteHeader() {
  const { totalItems } = useBasket();
  const { region, setRegion } = useRegion();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [search, setSearch] = useState("");
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (pathname === "/") {
      window.dispatchEvent(new CustomEvent("catalogue-search", { detail: search }));
      document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.assign(`/?q=${encodeURIComponent(search)}`);
    }
  };
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-[1600px] flex-wrap items-center gap-2 px-4 py-2 sm:px-6 lg:flex-nowrap">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FlaskConical className="size-5" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            i-<span className="text-primary">Supplement</span>
          </span>
        </Link>
        <form onSubmit={submitSearch} className="order-3 relative w-full lg:order-none lg:ml-5 lg:max-w-xl lg:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search supplements, forms or brands" aria-label="Search catalogue" className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </form>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          <label className="mr-1 flex items-center gap-1.5">
            <MapPin className="size-4 text-primary" />
            <span className="sr-only">Deliver to</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as RegionCode)}
              aria-label="Deliver to"
              className="h-11 max-w-28 rounded-md border border-border bg-background px-2 text-xs text-foreground transition-colors hover:border-primary sm:max-w-40"
            >
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <Link
            to="/compare"
            className="hidden min-h-11 items-center gap-1.5 rounded-md px-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary sm:flex"
            activeProps={{ className: "text-primary border-primary/50" }}
          >
            <GitCompareArrows className="size-3.5" />
            Compare
          </Link>
          <Link
            to="/basket"
            aria-label={`Basket with ${totalItems} items`}
            className="relative flex size-11 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
            activeProps={{ className: "text-primary border-primary/50" }}
          >
             <ShoppingBasket className="size-5" />
            {totalItems > 0 && <span className="num absolute -right-1.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{totalItems}</span>}
          </Link>
        </nav>
      </div>
      <AffiliateNotice />
    </header>
  );
}
