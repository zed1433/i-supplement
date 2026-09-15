import { Link } from "@tanstack/react-router";
import { AFFILIATE_DISCLOSURE } from "@/lib/suppcheck";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface pb-20 md:pb-0">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        <p className="text-xs leading-relaxed text-muted-foreground">{AFFILIATE_DISCLOSURE}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Catalogue
          </Link>
          <Link to="/compare" className="text-muted-foreground hover:text-foreground">
            Compare
          </Link>
          <Link to="/basket" className="text-muted-foreground hover:text-foreground">
            Basket
          </Link>
          <Link
            to="/affiliate-disclosure"
            className="text-muted-foreground hover:text-foreground"
          >
            Affiliate disclosure
          </Link>
          <span className="text-muted-foreground/70">
            © {new Date().getFullYear()} i-Supplement
          </span>
        </div>
      </div>
    </footer>
  );
}

/** Inline disclosure shown directly above retailer buy actions. */
export function InlineDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed text-muted-foreground ${className}`}>
      {AFFILIATE_DISCLOSURE}
    </p>
  );
}
