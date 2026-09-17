import { Link } from "@tanstack/react-router";
import { AFFILIATE_DISCLOSURE, CLAIMS_POLICY_NOTE, MEDICAL_DISCLAIMER, OPERATOR_IDENTITY, SUPPORT_EMAIL } from "@/lib/suppcheck";
import { useConsent } from "@/lib/consent";
import { useT } from "@/lib/market";

export function SiteFooter() {
  const { openPanel } = useConsent();
  const t = useT();
  return (
    <footer className="mt-16 border-t border-border bg-surface pb-20 md:pb-0">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        <div className="rounded-lg border border-border bg-background p-4 sm:p-5">
          <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
                {t("footer.affiliate")}
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
            {t("nav.catalogue")}
          </Link>
          <Link to="/compare" className="text-muted-foreground hover:text-foreground">
            {t("nav.compare")}
          </Link>
          <Link to="/basket" className="text-muted-foreground hover:text-foreground">
            {t("nav.basket")}
          </Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground">
            {t("footer.about")}
          </Link>
          <Link to="/affiliate-disclosure" className="text-muted-foreground hover:text-foreground">
            Affiliate disclosure
          </Link>
          <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
            {t("footer.privacy")}
          </Link>
          <Link to="/terms" className="text-muted-foreground hover:text-foreground">
            {t("footer.terms")}
          </Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground">
            {t("footer.contact")}
          </Link>
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
        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          {OPERATOR_IDENTITY}{" "}
          <a className="text-primary underline underline-offset-2" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
        </p>
        <p className="mt-2 max-w-3xl text-[11px] leading-relaxed text-muted-foreground">
          {CLAIMS_POLICY_NOTE}
        </p>
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
