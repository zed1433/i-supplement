import { Link } from "@tanstack/react-router";
import { STAPLES } from "@/lib/staples";

/** Crawlable links to the five staple comparison pages. */
export function StapleNav({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Popular supplement comparisons" className={`flex gap-2 overflow-x-auto pb-1 ${className}`}>
      {STAPLES.map((staple) => (
        <Link
          key={staple.path}
          to={staple.path}
          className="whitespace-nowrap rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          activeProps={{ className: "border-primary bg-accent text-accent-foreground" }}
        >
          {staple.nav}
        </Link>
      ))}
    </nav>
  );
}
