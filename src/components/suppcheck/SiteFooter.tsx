import { Link } from "@tanstack/react-router";
import { AFFILIATE_DISCLOSURE, MEDICAL_DISCLAIMER, SUPPORT_EMAIL } from "@/lib/suppcheck";
import { useConsent } from "@/lib/consent";

export function SiteFooter() {
  const { openPanel } = useConsent();
  return (
    <footer className="mt-16 border-t border-border bg-surface pb-20 md:pb-0">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        <div className="rounded-lg border border-border bg-background p-4 sm:p-5">
          <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
                Affiliate disclosure
              </p>
              <p className="mt-1.5">{AFFILIATE_DISCLOSURE}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
                Health &amp; medical disclaimer
              </p>
              <p className="mt-1.5">{MEDICAL_DISCLAIMER}</p>
            </div>
          </div>
        </div>

        <nav
          aria-label="Footer"
          className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs"
        >
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Catalogue
          </Link>
          <Link to="/compare" className="text-muted-foreground hover:text-foreground">
            Compare
          </Link>
          <Link to="/basket" className="text-muted-foreground hover:text-foreground">
            Basket
          </Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground">
            About us
          </Link>
          <Link to="/affiliate-disclosure" className="text-muted-foreground hover:text-foreground">
            Affiliate disclosure
          </Link>
          <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
            Privacy policy
          </Link>
          <Link to="/terms" className="text-muted-foreground hover:text-foreground">
            Terms of service
          </Link>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-muted-foreground hover:text-foreground"
          >
            Contact
          </a>
          <button
            type="button"
            onClick={openPanel}
            className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Cookie settings
          </button>
          <span className="text-muted-foreground/70">
            © {new Date().getFullYear()} i-Supplement
          </span>
        </nav>
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
