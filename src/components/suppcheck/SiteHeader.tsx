import { Link } from "@tanstack/react-router";
import { FlaskConical, GitCompareArrows } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <FlaskConical className="size-4" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            Supp<span className="text-primary">Check</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
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
        </nav>
      </div>
    </header>
  );
}
